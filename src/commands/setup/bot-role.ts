import {
    ChatInputCommandInteraction,
    SlashCommandSubcommandBuilder,
} from 'discord.js'
import BotRoleData from '../../db-objects/data/bot-role'

module.exports = {
    commandName: 'bot-role',
    data: new SlashCommandSubcommandBuilder()
        .setName('bot-role')
        .setDescription('Adds a role to bots when entering the server.')
        .addRoleOption((option) =>
            option
                .setName('role')
                .setDescription('The role to assign to jailed users.')
                .setRequired(true)
        ),
    async execute(interaction: ChatInputCommandInteraction) {

        const role = interaction.options.getRole('role')
        const data = new BotRoleData(interaction.guildId)
        data.roleId = role.id
        await data.saveAsync()

        await interaction.reply({
            content: 'Bot role updated.',
        })
    },
}
