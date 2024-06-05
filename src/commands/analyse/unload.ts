import {
    ChatInputCommandInteraction,
    SlashCommandSubcommandBuilder,
} from 'discord.js'
import AnalysisData from '../../db-objects/data/analysis'

module.exports = {
    commandName: 'unload',
    data: new SlashCommandSubcommandBuilder()
        .setName('unload')
        .setDescription('Unloads the data.'),
    async execute(interaction: ChatInputCommandInteraction) {
        const data = new AnalysisData(interaction.guildId)
        data.messages = null
        await data.saveAsync()

        await interaction.reply({content: "The messages have been unloaded."})
    },
}