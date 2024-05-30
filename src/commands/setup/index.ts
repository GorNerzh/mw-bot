import {
    ChatInputCommandInteraction,
    PermissionsBitField,
    SlashCommandBuilder,
} from 'discord.js'

const welcomeMessage = require('./welcome-message')
const quote = require('./quote')
const jail = require('./jail')
const modCmdChannel = require('./mod-cmd-channel')
const botRole = require('./bot-role')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('setup')
        .setDescription('Setup various bot features.')
        .addSubcommand(welcomeMessage.data)
        .addSubcommand(quote.data)
        .addSubcommand(jail.data)
        .addSubcommand(modCmdChannel.data)
        .addSubcommand(botRole.data)
        .setDefaultMemberPermissions(PermissionsBitField.Flags.Administrator),
    async execute(interaction: ChatInputCommandInteraction) {
        const subcommand = interaction.options.getSubcommand()

        if (subcommand === welcomeMessage.commandName) {
            await welcomeMessage.execute(interaction)
        } else if (subcommand === quote.commandName) {
            await quote.execute(interaction)
        } else if (subcommand === jail.commandName) {
            await jail.execute(interaction)
        } else if (subcommand === modCmdChannel.commandName) {
            await modCmdChannel.execute(interaction)
        } else if (subcommand === botRole.commandName) {
            await botRole.execute(interaction)
        }
    },
}
