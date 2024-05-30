import {
    ChatInputCommandInteraction,
    PermissionsBitField,
    SlashCommandBuilder,
} from 'discord.js'

const add = require('./add')
const remove = require('./remove')
const list = require('./list')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('challenge-roles')
        .setDescription('Manage Challenge roles.')
        .addSubcommand(add.data)
        .addSubcommand(remove.data)
        .addSubcommand(list.data)
        .setDefaultMemberPermissions(PermissionsBitField.Flags.ManageRoles),
    async execute(interaction: ChatInputCommandInteraction) {
        const subcommand = interaction.options.getSubcommand()

        if (subcommand === add.commandName) {
            await add.execute(interaction)
        } else if (subcommand === remove.commandName) {
            await remove.execute(interaction)
        } else if (subcommand === list.commandName) {
            await list.execute(interaction)
        }
    },
}
