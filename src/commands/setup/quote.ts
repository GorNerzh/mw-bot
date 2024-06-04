import {
    ChatInputCommandInteraction,
    SlashCommandSubcommandBuilder,
} from 'discord.js'
import QuoteData from '../../db-objects/data/quote-data'
import Utils from '../../utils/utils'

module.exports = {
    commandName: 'quote',
    data: new SlashCommandSubcommandBuilder()
        .setName('quote')
        .setDescription('Setup quotes channel.')
        .addChannelOption((option) =>
            option
                .setName('channel')
                .setDescription('The quote channel.')
                .setRequired(true)
        ),
    async execute(interaction: ChatInputCommandInteraction) {
        const channel = interaction.options.getChannel('channel')
        if (!Utils.mustBeTextChannelAsync(channel, interaction)) {
            return
        }

        const data = new QuoteData(interaction.guildId)
        data.channelId = channel.id
        await data.saveAsync()

        await interaction.reply({
            content: 'Quote channel updated.',
        })
    },
}
