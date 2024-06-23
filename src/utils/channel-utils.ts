import { Guild, Message, TextChannel } from "discord.js";

export default class ChannelUtils {

    async fetchMessageById(messageId: string, channelId: string, guild: Guild): Promise<Message<true>> {
        try {
            const channel = await guild.channels.fetch(channelId) as TextChannel
            return await channel.messages.fetch(messageId)
        } catch (error) {
            return null
        }
    }

    async fetchMessageByLink(messageLink: string, guild: Guild): Promise<Message<true>> {
        try {
            const [, channelId, messageId] = messageLink.match(/(\d{17,19})/g);
            const channel = await guild.channels.fetch(channelId) as TextChannel;
            return await channel.messages.fetch(messageId);
        } catch (error) {
            return null
        }
    }
}