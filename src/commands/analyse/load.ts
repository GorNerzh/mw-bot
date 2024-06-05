import {
    ChatInputCommandInteraction,
    FetchMessagesOptions,
    Message,
    SlashCommandSubcommandBuilder,
    TextChannel,
} from 'discord.js'
import ChannelUtils from '../../utils/channel-utils'
import AnalysisData from '../../db-objects/data/analysis'

module.exports = {
    commandName: 'load',
    data: new SlashCommandSubcommandBuilder()
        .setName('load')
        .setDescription('Loads the data to analyse.')
        .addStringOption((option) =>
            option
                .setName('oldest-message-id')
                .setDescription('The oldest message')
                .setRequired(true)
        )
        .addStringOption((option) =>
            option
                .setName('latest-message-id')
                .setDescription('The newest message')
                .setRequired(false)
        )
        .addChannelOption((option) =>
            option
                .setName('channel')
                .setDescription('The analysed channel')
                .setRequired(false)
        ),
    async execute(interaction: ChatInputCommandInteraction) {
        const oldestMessageId = interaction.options.getString('oldest-message-id')
        const latestMessageId = interaction.options.getString('latest-message-id')
        const channelId = interaction.options.getChannel('channel')?.id ?? interaction.channelId

        const channel = await interaction.guild.channels.fetch(channelId) as TextChannel
        if (!channel) {
            await interaction.reply({
                content: `The channel provided is not correct.`,
                ephemeral: true
            })
            return
        }

        const replyMessage = await interaction.reply({
            content: `Loading messages...`,
            ephemeral: true
        })

        const channelUtils = new ChannelUtils()
        const oldestMessage = await channelUtils.getMessageById(oldestMessageId, channelId, interaction.guild)

        const latestMessage = latestMessageId ? await channelUtils.getMessageById(latestMessageId, channelId, interaction.guild)
            : (await channel.messages.fetch({ limit: 1 })).first()

        const messages = await fetchMessages(oldestMessage, latestMessage, channel)

        replyMessage.edit({
            content: `Loaded **${messages.length}** messages.`
        })

        const data = new AnalysisData(interaction.guildId)
        data.messages = messages.map(m => {
            return {
                authorId: m.author.id,
                message: m
            };
        });
        await data.saveAsync()
    },
}

async function fetchMessages(oldestMessage: Message<true>, latestMessage: Message<true>, channel: TextChannel): Promise<Message<true>[]> {
    if ((await channel.messages.fetch({ limit: 1 })).size == 0) {
        return new Array<Message<true>>()
    }

    let lastId = latestMessage.id;
    let messagesBetween = new Array<Message<true>>();
    messagesBetween.push(latestMessage);

    while (true) {
        const options: FetchMessagesOptions = { limit: 100 };
        options.before = lastId;

        const messages = await channel.messages.fetch(options);
        lastId = messages.at(messages.size - 1)?.id;

        for (const message of messages.map(m => m)) {
            if (message.id > oldestMessage.id) {
                messagesBetween.push(message);
            }
            if (message.id === oldestMessage.id) {
                messagesBetween.push(message);
                break;
            }
        }

        if (!lastId) {
            break;
        }
    }

    return messagesBetween
}