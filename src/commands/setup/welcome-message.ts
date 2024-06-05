import {
    SlashCommandSubcommandBuilder,
    ChatInputCommandInteraction,
    Message,
    TextChannel,
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
                .setDescription('The channel to send the greetings message.')
                .setRequired(true)
        )
        .addStringOption((option) =>
            option
                .setName('reference-message-id')
                .setDescription(
                    'The message containing the greetings text.'
                )
                .setRequired(true)
        )
        .addChannelOption((option) =>
            option
                .setName('reference-message-channel')
                .setDescription(
                    'The channel where the reference message is located.'
                )
                .setRequired(false)
        ),

    async execute(interaction: ChatInputCommandInteraction) {
        const welcomeChannel = interaction.options.getChannel('welcome-channel')
        const messageId = interaction.options.getString('reference-message-id')
        const messageSampleChannel = interaction.options.getChannel(
            'reference-message-channel'
        )

        if (!Utils.mustBeTextChannelAsync(welcomeChannel, interaction)
        || (messageSampleChannel && !Utils.mustBeTextChannelAsync(messageSampleChannel, interaction))) {
            return
        }

        const channelUtils = new ChannelUtils()

        const message = await channelUtils.getMessageById(messageId,
            messageSampleChannel?.id ?? interaction.channel.id,
            interaction.guild)

        if (!message) {
            await interaction.reply({
                content: 'Cannot find the greeting message.',
                ephemeral: true,
            })
            return
        }

        const data = new WelcomeData(interaction.guildId)
        data.welcomeChannel = welcomeChannel.id
        data.message = message.content
        await data.saveAsync()

        await interaction.reply({
            content: 'Welcome message updated.',
        })
    },
}
