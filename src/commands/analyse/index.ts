import {
    ChatInputCommandInteraction,
    PermissionsBitField,
    SlashCommandBuilder,
} from 'discord.js'

const load = require('./load')
const unload = require('./unload')
const messageCount = require('./message-count')
const filterMessages = require('./filter-messages')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('analyse')
        .setDescription('Analyse data from a list of messages.')
        .addSubcommand(load.data)
        .addSubcommand(messageCount.data)
        .addSubcommand(unload.data)
        .addSubcommand(filterMessages.data)
        .setDefaultMemberPermissions(PermissionsBitField.Flags.ManageRoles),
    async execute(interaction: ChatInputCommandInteraction) {
        const subcommand = interaction.options.getSubcommand()

        if (subcommand === load.commandName) {
            await load.execute(interaction)
        } else if (subcommand === messageCount.commandName) {
            await messageCount.execute(interaction)
        } else if (subcommand === unload.commandName) {
            await unload.execute(interaction)
        } else if (subcommand === filterMessages.commandName) {
            await filterMessages.execute(interaction)
        }
    },
}
