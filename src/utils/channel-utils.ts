import { Guild, Message, TextChannel } from "discord.js";

export default class ChannelUtils {

    async getMessageById(messageId: string, channelId: string, guild: Guild): Promise<Message<true>> {
        try {
            const channel = guild.channels.cache.get(channelId) as TextChannel
            return await channel.messages.fetch(messageId)
        } catch (error) {
            return null
        }
    }
}