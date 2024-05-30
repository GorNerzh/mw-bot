import {
    ChatInputCommandInteraction,
    EmbedBuilder,
    SlashCommandSubcommandBuilder,
} from 'discord.js'
import CategoryRoleData from '../../db-objects/data/category-roles'
import Utils from '../../utils/utils'

module.exports = {
    commandName: 'list',
    data: new SlashCommandSubcommandBuilder()
        .setName('list')
        .setDescription('Gets the list of every challenge roles.'),
    async execute(interaction: ChatInputCommandInteraction) {
        if (!await Utils.isModCmdChannel(interaction)) {
            return
        }

        const data = new CategoryRoleData(interaction.guildId)
        await data.loadAsync()

        if (data.categoryRoleIds.length == 0) {
            const embed = new EmbedBuilder()
                .setTitle('Category Roles')
                .setDescription('No category roles');

            await interaction.reply({ embeds: [embed] });
            return
        }

        const roleList = interaction.guild.roles.cache
            .filter(role => role.id !== interaction.guild.id) // Removes @everyone role
            .sort((a, b) => b.position - a.position)
            .map(role => {
                if (data.ghostRoleIds.includes(role.id)) {
                    return `### ${role} :ghost:`
                }
                else if (data.categoryRoleIds.includes(role.id)) {
                    return `### ${role}`
                }
                else {
                    return `${role}`
                }
            })
            .join('\n');

        const embed = new EmbedBuilder()
            .setTitle('Category Roles')
            .setDescription(roleList || 'No roles found')

        await interaction.reply({ embeds: [embed] });
        await cleanUpRoles(data, interaction)
    },
}

async function cleanUpRoles(data: CategoryRoleData, interaction: ChatInputCommandInteraction) {
    const validRoleIds = data.categoryRoleIds.filter(id => interaction.guild.roles.cache.has(id))
    data.categoryRoleIds = validRoleIds
    const validGhostIds = data.ghostRoleIds.filter(id => validRoleIds.includes(id))
    data.ghostRoleIds = validGhostIds

    await data.saveAsync()
}