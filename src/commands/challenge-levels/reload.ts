import {
    ChatInputCommandInteraction,
    SlashCommandSubcommandBuilder,
} from 'discord.js'
import ChallengeLevelData from '../../db-objects/data/challenge-levels-data'
import ChallengeRolesData from '../../db-objects/data/challenge-roles-data'
import RoleUtils from '../../utils/role-utils'

module.exports = {
    commandName: 'reload',
    data: new SlashCommandSubcommandBuilder()
        .setName('reload')
        .setDescription('Reload the level role of every users.'),
    async execute(interaction: ChatInputCommandInteraction) {

        const levelData = new ChallengeLevelData(interaction.guildId)
        const roleData = new ChallengeRolesData(interaction.guildId)
        await levelData.loadAsync()
        await roleData.loadAsync()

        if (levelData.challengeLevelIds.length == 0
            || roleData.challengeRoleIds.length == 0
        ) {
            interaction.reply({ content: 'The challenge roles and levels haven\'t been setup.', ephemeral: true })
            return
        }

        const totalMembers = interaction.guild.memberCount;
        let membersProcessed = 0;

        const reply = await interaction.reply('Reloading all the challenge levels...');
        let progressMessage = await reply.edit({ content: 'Reloading all the challenge levels...' })

        const challengeLevelRolesIds = levelData.challengeLevelIds.map(lr => lr.roleId)

        const guildMembers = await interaction.guild.members.fetch()

        const tasks = Array.from(guildMembers, async ([memberId, member]) => {

            const memberChallengeRolesCount = member.roles.cache.filter(r => roleData.challengeRoleIds.includes(r.id)).size;
            const memberLevelRoles = member.roles.cache.filter(r => challengeLevelRolesIds.includes(r.id));

            if (memberChallengeRolesCount == 0) {
                if (memberLevelRoles.size != 0) {
                    await member.roles.remove(memberLevelRoles)
                }
            }
            else {
                const roleUtils = new RoleUtils()
                const correctLevelRoleId = roleUtils.getCorrectLevelRoleId(memberChallengeRolesCount, levelData)
    
                if (memberLevelRoles.size != 1 || !memberLevelRoles.has(correctLevelRoleId)) {
                    if (memberLevelRoles.size > 0) {
                        await member.roles.remove(memberLevelRoles)
                    }
                    await member.roles.add(correctLevelRoleId)
                }
            }

            membersProcessed++;

            //console.log(membersProcessed + " : " + member.displayName)

            if (membersProcessed % (totalMembers / 100) === 0) {
                progressMessage = await progressMessage.edit(`Reload... ${(membersProcessed / totalMembers * 100).toFixed(0)}%`);
            }
        });

        await Promise.all(tasks);

        // Edit the message to indicate that the process is complete
        progressMessage = await progressMessage.edit('Level roles reload finished');
    },
}
