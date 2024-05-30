import { Events, GuildMember, TextChannel } from 'discord.js'
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
    const welcomeData = new WelcomeData(member.guild.id)
        await welcomeData.loadAsync()

        if (!welcomeData.welcomeChannel || !welcomeData.message) {
            return
        }

        const welcomeChannel = member.guild.channels.cache.get(welcomeData.welcomeChannel) as TextChannel

        if (!welcomeChannel) {
            console.log(
                `Couldn't find welcome channel with id ${welcomeData.welcomeChannel}`
            )
            return
        }

        let welcomeMessage = welcomeData.message
        welcomeMessage = Utils.replaceAll(welcomeMessage, '{user}', member)
        welcomeChannel.send(welcomeMessage)
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