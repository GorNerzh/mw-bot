import {
    ChatInputCommandInteraction,
    SlashCommandSubcommandBuilder,
} from 'discord.js'
import CategoryRoleData from '../../db-objects/data/category-roles'

module.exports = {
    commandName: 'add-ghost',
    data: new SlashCommandSubcommandBuilder()
        .setName('add-ghost')
        .setDescription('Adds a category role that doesn\'t appear.')
        .addRoleOption((option) =>
            option
                .setName('role')
                .setDescription('The ghost category role')
                .setRequired(true)
        ),
    async execute(interaction: ChatInputCommandInteraction) {
        const role = interaction.options.getRole('role')
        const data = new CategoryRoleData(interaction.guildId)
        await data.loadAsync()

        const index = data.categoryRoleIds.indexOf(role.id, 0);
        if (index > -1) {
            await interaction.reply({
                content: `${role} is already a category role.`,
                ephemeral: true
            })
            return
        }

        data.categoryRoleIds.push(role.id)
        data.ghostRoleIds.push(role.id)
        await data.saveAsync()

        await interaction.reply({
            content: `Added the role ${role}.`,
            ephemeral: true
        })
    },
}
