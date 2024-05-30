import {
    ChatInputCommandInteraction,
    EmbedBuilder,
    SlashCommandSubcommandBuilder,
} from 'discord.js'
import ChallengeRolesData from '../../db-objects/data/challenge-roles-data'

module.exports = {
    commandName: 'list',
    data: new SlashCommandSubcommandBuilder()
        .setName('list')
        .setDescription('Gets the list of every challenge roles.'),
    async execute(interaction: ChatInputCommandInteraction) {
        const challengeRoles = new ChallengeRolesData(interaction.guildId)
        await challengeRoles.loadAsync()

        const roles = challengeRoles.challengeRoleIds
            .map(id => interaction.guild.roles.cache.get(id))
            .filter(role => role !== null)
            .sort((a, b) => b.position - a.position);

        const embed = new EmbedBuilder()
            .setTitle('Challenge Roles')
            .setDescription(roles.join('\n') || 'No roles found');

        await interaction.reply({ embeds: [embed] });
        await cleanUpRoles(challengeRoles, interaction)
    },
}

async function cleanUpRoles(data: ChallengeRolesData, interaction: ChatInputCommandInteraction) {
    const validRoleIds = data.challengeRoleIds.filter(id => interaction.guild.roles.cache.has(id))
    data.challengeRoleIds = validRoleIds
    await data.saveAsync()
}