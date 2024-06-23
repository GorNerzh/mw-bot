import {
    SlashCommandSubcommandBuilder,
    ChatInputCommandInteraction,
} from 'discord.js'
import WelcomeData from '../../db-objects/data/welcome-data'
import Utils from '../../utils/utils'
import ChannelUtils from '../../utils/channel-utils'

module.exports = {
    commandName: 'welcome-message',
    data: new SlashCommandSubcommandBuilder()
        .setName('welcome-message')
        .setDescription('Setup welcome message.')
        .addChannelOption((option) =>
            option
                .setName('welcome-channel')
                .setDescription('The channel to send the greetings message to.')
                .setRequired(true)
        )
        .addStringOption((option) =>
            option
                .setName('content-message-link')
                .setDescription(
                    'The link to the message with the greetings content.'
                )
        )
        .addStringOption((option) =>
            option
                .setName('embed-title')
                .setDescription(
                    'The embed title.'
                )
        )
        .addStringOption((option) =>
            option
                .setName('embed-content-message-link')
                .setDescription(
                    'The link to the message with the embed content.'
                )
        )
        .addStringOption((option) =>
            option
                .setName('attachment-link')
                .setDescription(
                    'The attachment file link.'
                )
        ),

    async execute(interaction: ChatInputCommandInteraction) {
        const welcomeChannel = interaction.options.getChannel('welcome-channel')
        const messageLink = interaction.options.getString('content-message-link')
        const embedTitle = interaction.options.getString('embed-title')
        const embedLink = interaction.options.getString('embed-content-message-link')
        const attachmentLink = interaction.options.getString('attachment-link')

        if ((messageLink && !await Utils.mustBeDiscordMessageLinkAsync(messageLink, interaction))
            || (embedLink && !await Utils.mustBeDiscordMessageLinkAsync(embedLink, interaction))) {
            return
        }

        const channelUtils = new ChannelUtils()

        let messageContent: string
        let embedContent: string

        if (messageLink) {
            messageContent = (await channelUtils.fetchMessageByLink(messageLink, interaction.guild))?.content
            if (!messageContent) {
                await interaction.reply({
                    content: 'Invalid URL. Please provide a correct greeting message link.',
                    ephemeral: true,
                })
                return
            }
        }

        if (embedLink) {
            embedContent = (await channelUtils.fetchMessageByLink(embedLink, interaction.guild))?.content
            if (!embedContent) {
                await interaction.reply({
                    content: 'Invalid URL. Please provide a correct embed message link.',
                    ephemeral: true,
                })
                return
            }
        }

        const data = new WelcomeData(interaction.guildId)
        data.welcomeChannel = welcomeChannel.id
        data.message = messageContent
        data.embedTitle = embedTitle
        data.embedContent = embedContent
        data.attachmentLink = attachmentLink
        await data.saveAsync()

        await interaction.reply({
            content: 'Welcome message updated.',
        })
    },
}
