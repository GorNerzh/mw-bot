import {
    ChatInputCommandInteraction,
    Collection,
    GuildMember,
    Role,
    SlashCommandSubcommandBuilder,
} from 'discord.js'
import CategoryRoleData from '../../db-objects/data/category-roles'

module.exports = {
    commandName: 'reload',
    data: new SlashCommandSubcommandBuilder()
        .setName('reload')
        .setDescription('Reload the category roles on every users.'),
    async execute(interaction: ChatInputCommandInteraction) {

        const data = new CategoryRoleData(interaction.guildId)
        await data.loadAsync()

        if (data.categoryRoleIds.length == 0) {
            interaction.reply({ content: 'No category roles have been setup.', ephemeral: true })
            return
        }

        const totalMembers = interaction.guild.memberCount;
        let membersProcessed = 0;
        const reply = await interaction.reply('Reloading all the category roles...');
        let progressMessage = await reply.edit({ content: 'Reloading all the category roles...' })
        
        const guildCategoryRolesAsc = (await interaction.guild.roles.fetch())
            .filter(r => data.categoryRoleIds.includes(r.id))
            .sort((r1, r2) => r1.position - r2.position)

        const guildMembers = await interaction.guild.members.fetch()


        const tasks = Array.from(guildMembers, async ([memberId, member]) => {
            const currentCategoryRoles = getMemberCurrentCategoryRoles(member, data)
            const correctCategoryRoles = getMemberCorrectCategoryRoles(member, guildCategoryRolesAsc, data.ghostRoleIds)

            const rolesToRemove = currentCategoryRoles.filter(r => !correctCategoryRoles.includes(r))
            if (rolesToRemove.size > 0) {
                await member.roles.remove(rolesToRemove)
            }

            const rolesToAdd = correctCategoryRoles.filter(cor => !currentCategoryRoles.some(cur => cur.id == cor.id))
            if (rolesToAdd.length > 0) {
                await member.roles.add(rolesToAdd)
            }

            membersProcessed++;

            //console.log(membersProcessed + " : " + member.displayName)

            if (membersProcessed % (totalMembers / 100) === 0) {
                progressMessage = await progressMessage.edit(`Reload... ${(membersProcessed / totalMembers * 100).toFixed(0)}%`);
            }
        });

        await Promise.all(tasks);

        // Edit the message to indicate that the process is complete
        progressMessage = await progressMessage.edit('Category roles reload finished');
    },
}

function getMemberCurrentCategoryRoles(member: GuildMember, data: CategoryRoleData) {
    return member.roles.cache.filter(r => data.categoryRoleIds.includes(r.id))
}

function getMemberCorrectCategoryRoles(member: GuildMember, guildCategoryRolesAsc: Collection<string, Role>, ghostRoles: string[]): Role[] {
    const correctCategoryRoles = new Array<Role>()

    const selectedMemberRoles = member.roles.cache
        .filter(r => r.id != member.guild.id // remove @everyone role
            && !guildCategoryRolesAsc.has(r.id) // removes every category roles of the member
        ).sort((r1, r2) => r1.position - r2.position) // sort asc

    let minimalPosition = 0

    selectedMemberRoles.forEach(role => {
        // skip if role < minimal position

        if (guildCategoryRolesAsc.size == 0
            || role.position < minimalPosition) {
            return
        }

        // remove lower category roles from the list
        guildCategoryRolesAsc = guildCategoryRolesAsc.filter(r => r.position > role.position)

        if (guildCategoryRolesAsc.size == 0) {
            return
        }

        const lowestCategoryRole = guildCategoryRolesAsc.first()

        minimalPosition = lowestCategoryRole.position
        
        if (!ghostRoles.includes(lowestCategoryRole.id)) {
            correctCategoryRoles.push(lowestCategoryRole)
        }

    });

    return correctCategoryRoles
}