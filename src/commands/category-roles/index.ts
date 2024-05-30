import {
    ChatInputCommandInteraction,
    PermissionsBitField,
    SlashCommandBuilder,
} from 'discord.js'

const add = require('./add')
const remove = require('./remove')
const list = require('./list')
const reload = require('./reload')
const addGhost = require('./add-ghost')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('category-roles')
        .setDescription('Manage Category roles.')
        .addSubcommand(add.data)
        .addSubcommand(remove.data)
        .addSubcommand(list.data)
        .addSubcommand(reload.data)
        .addSubcommand(addGhost.data)
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
        } else if (subcommand === addGhost.commandName) {
            await addGhost.execute(interaction)
        }
    },
}
