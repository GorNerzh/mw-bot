import {
    ChatInputCommandInteraction,
    PermissionsBitField,
    SlashCommandBuilder,
} from 'discord.js'

const add = require('./add')
const remove = require('./remove')
const list = require('./list')
const reload = require('./reload')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('challenge-levels')
        .setDescription('Manage Challenge level roles.')
        .addSubcommand(add.data)
        .addSubcommand(remove.data)
        .addSubcommand(list.data)
        .addSubcommand(reload.data)
        .setDefaultMemberPermissions(PermissionsBitField.Flags.ManageRoles),
    async execute(interaction: ChatInputCommandInteraction) {
        const subcommand = interaction.options.getSubcommand()

        if (subcommand === add.commandName) {
            await add.execute(interaction)
        } else if (subcommand === remove.commandName) {
            await remove.execute(interaction)
        } else if (subcommand === list.commandName) {
            await list.execute(interaction)
        } else if (subcommand === reload.commandName) {
            await reload.execute(interaction)
        }
    },
}
