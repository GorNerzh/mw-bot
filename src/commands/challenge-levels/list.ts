import {
    ChatInputCommandInteraction,
    EmbedBuilder,
    SlashCommandSubcommandBuilder,
} from 'discord.js'
import ChallengeLevelData from '../../db-objects/data/challenge-levels-data';

module.exports = {
    commandName: 'list',
    data: new SlashCommandSubcommandBuilder()
        .setName('list')
        .setDescription('Gets the list of every challenge levels.'),
    async execute(interaction: ChatInputCommandInteraction) {
        const data = new ChallengeLevelData(interaction.guildId)
        await data.loadAsync()

        if (data.challengeLevelIds.length == 0) {
            const embed = new EmbedBuilder()
                .setTitle('Challenge Levels')
                .setDescription('No level roles');

            await interaction.reply({ embeds: [embed] });
            return
        }

        await cleanUpRoles(data, interaction)

        const roles = data.challengeLevelIds
            .sort((a, b) => b.level - a.level)
            .map(c => `**${interaction.guild.roles.cache.get(c.roleId)} : ${c.level} ${c.level == 1 ? 'challenge' : 'challenges'}**`)

        const embed = new EmbedBuilder()
            .setTitle('Challenge Levels')
            .setDescription(roles.join('\n') || 'No roles found');

        await interaction.reply({ embeds: [embed] });
    },
}

async function cleanUpRoles(data: ChallengeLevelData, interaction: ChatInputCommandInteraction) {
    const validRoleIds = data.challengeLevelIds.filter(c => interaction.guild.roles.cache.has(c.roleId))
    data.challengeLevelIds = validRoleIds
    await data.saveAsync()
}