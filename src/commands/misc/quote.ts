import {
    ChatInputCommandInteraction,
    EmbedBuilder,
    SlashCommandBuilder,
    TextChannel,
} from 'discord.js'
import QuoteData from '../../db-objects/data/quote-data'

module.exports = {
    data: new SlashCommandBuilder()
        .setName('quote')
        .setDescription('Send a random quote from the server.'),

    async execute(interaction: ChatInputCommandInteraction) {
        const data = new QuoteData(interaction.guildId)
        await data.loadAsync()

        if (!data.channelId) {
            await interaction.reply({
                content: 'The quote command is not setup !',
            })
            return
        }

        const quoteChannel = interaction.guild.channels.cache.get(data.channelId) as TextChannel

        // Fetch 300 messages
        const messages = await quoteChannel.messages.fetch({ limit: 100 })
        for (let i = 0; i < 2; i++) {
            const lastMessage = messages.last().id
            messages.concat(await quoteChannel.messages.fetch({ limit: 100, before: lastMessage }))
        }

        const selectedMessage = messages.random()
        const author = selectedMessage.author
        const reply = selectedMessage.content

        const embed = new EmbedBuilder()
            .setColor(0x900000)
            .setAuthor({ name: author.displayName, iconURL: author.avatarURL(), url: selectedMessage.url })
            .setDescription(reply)

        await interaction.reply({ embeds: [embed] })
    },
}
