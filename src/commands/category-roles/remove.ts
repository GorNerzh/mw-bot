import {
    ChatInputCommandInteraction,
    SlashCommandSubcommandBuilder,
} from 'discord.js'
import CategoryRoleData from '../../db-objects/data/category-roles'

module.exports = {
    commandName: 'remove',
    data: new SlashCommandSubcommandBuilder()
        .setName('remove')
        .setDescription('Removes a category role.')
        .addRoleOption((option) =>
            option
                .setName('role')
                .setDescription('The category role')
                .setRequired(true)
        ),
    async execute(interaction: ChatInputCommandInteraction) {
        const role = interaction.options.getRole('role')
        const data = new CategoryRoleData(interaction.guildId)
        await data.loadAsync()

        let index = data.categoryRoleIds.indexOf(role.id, 0);
        if (index < 0) {
            await interaction.reply({
                content: `${role} is not a category role`,
                ephemeral: true
            })
            return
        }

        data.categoryRoleIds.splice(index, 1);
        index = data.ghostRoleIds.indexOf(role.id, 0);
        data.ghostRoleIds.splice(index, 1);

        await data.saveAsync()
        await interaction.reply({
            content: `Removed the role ${role}.`,
            ephemeral: true
        })
    },
}
