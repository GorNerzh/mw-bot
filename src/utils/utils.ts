import { GuildBasedChannel, ChatInputCommandInteraction, Guild, TextChannel, BaseChannel } from "discord.js"
import ModCmdData from "../db-objects/data/mod-cmd-data"

class Utils {
    static replaceAll(str: string, find: string, replace: any) {
        return str.replace(new RegExp(find, 'g'), replace)
    }

    static isTextChannel(channel: any) : boolean {
        return channel instanceof TextChannel
    }

    static async mustBeTextChannelAsync(channel: any, interaction: ChatInputCommandInteraction) : Promise<boolean> {
        if (this.isTextChannel(channel)) {
            return true
        }
        else {
            await interaction.reply({content: `The channel ${channel} is not a Text channel !`})
            return false
        }
    }

    static async mustBeTextChannelOrNullAsync(channel: any, interaction: ChatInputCommandInteraction) : Promise<boolean> {
        if (!channel || this.isTextChannel(channel)) {
            return true
        }
        else {
            await interaction.reply({content: `The channel ${channel} is not a Text channel !`})
            return false
        }
    }

    static async isModCmdChannel(interaction: ChatInputCommandInteraction) : Promise<boolean> {
        const data = new ModCmdData(interaction.guildId)
        await data.loadAsync()

        if (!data.channelId) {
            return true
        }
        
        const channelId = interaction.channelId
        if (data.channelId == channelId) {
            return true
        }

        const modChannel = interaction.guild.channels.cache.get(data.channelId)

        await interaction.reply({
            content: `This command must be executed in ${modChannel} !`,
            ephemeral: true
        })
        return false
    }
}

export default Utils
