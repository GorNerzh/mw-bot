import { ChatInputCommandInteraction, Message } from 'discord.js'
import BaseData from '../base-data'
import DataKey from '../datakeys'

export default class AnalysisData extends BaseData {
    messages: MessageData[]

    constructor(guildId: string) {
        super(guildId, DataKey.analysis)
        this.messages = null
    }

    async noDataLoaded(interaction: ChatInputCommandInteraction): Promise<boolean> {
        if (this.messages == null || this.messages.length == 0) {
            await interaction.reply({
                content: 'No data has been loaded. Use the command `/analyse load` first.',
                ephemeral: true
            })
            return true
        }
        return false
    }
}

interface MessageData {
    authorId: string,
    message: Message<true>
}