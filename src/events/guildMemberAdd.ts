import { AttachmentBuilder, EmbedBuilder, Events, GuildMember, MessageCreateOptions, TextChannel } from 'discord.js'
import Utils from '../utils/utils'
import WelcomeData from '../db-objects/data/welcome-data'
import BotRoleData from '../db-objects/data/bot-role'

module.exports = {
    name: Events.GuildMemberAdd,
    async execute(member: GuildMember) {
        await printWelcomeMessage(member)
        await manageNewBot(member)
    },
}

async function printWelcomeMessage(member: GuildMember) {
    const data = new WelcomeData(member.guild.id)
    await data.loadAsync()

    if (!data.welcomeChannel
        || (!data.message && !data.embedTitle && !data.embedContent && !data.attachmentLink)) {
        return
    }

    const welcomeChannel = member.guild.channels.cache.get(data.welcomeChannel) as TextChannel

    if (!welcomeChannel) {
        console.log(
            `Couldn't find welcome channel with id ${data.welcomeChannel}`
        )
        return
    }

    const messageContent = Utils.replaceAll(data.message, '{user}', member)
    let embed: EmbedBuilder = null
    let attachmentFile: AttachmentBuilder = null

    if (data.embedTitle || data.embedContent) {
        embed = new EmbedBuilder()
            .setTitle(data.embedTitle)
            .setDescription(data.embedContent);
    }

    const hello: MessageCreateOptions = null


    if (data.attachmentLink) {
        attachmentFile = new AttachmentBuilder(null)
            .setFile(data.attachmentLink)
    }

    welcomeChannel.send({ content: messageContent ? messageContent : null, embeds: embed ? [embed] : null, files: attachmentFile ? [attachmentFile] : null })
}

async function manageNewBot(member: GuildMember) {
    if (member.user.bot) {
        const data = new BotRoleData(member.guild.id)
        await data.loadAsync()

        if (data.roleId) {
            const botRole = await member.guild.roles.fetch(data.roleId)
            member.roles.add(botRole)
        }
    }
}