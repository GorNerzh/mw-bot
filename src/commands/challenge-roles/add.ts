import {
    ChatInputCommandInteraction,
    SlashCommandSubcommandBuilder,
} from 'discord.js'
import ChallengeRolesData from '../../db-objects/data/challenge-roles-data'

module.exports = {
    commandName: 'add',
    data: new SlashCommandSubcommandBuilder()
        .setName('add')
        .setDescription('Adds a challenge role.')
        .addRoleOption((option) =>
            option
                .setName('role')
                .setDescription('The challenge role')
                .setRequired(true)
        ),
    async execute(interaction: ChatInputCommandInteraction) {
        const role = interaction.options.getRole('role')
        const challengeRoles = new ChallengeRolesData(interaction.guildId)
        await challengeRoles.loadAsync()

        const index = challengeRoles.challengeRoleIds.indexOf(role.id, 0);
        if (index > -1) {
            await interaction.reply({
                content: `${role} is already a challenge role.`,
                ephemeral: true
            })
            return
        }

        challengeRoles.challengeRoleIds.push(role.id)
        await challengeRoles.saveAsync()

        await interaction.reply({
            content: `Added the role ${role}.`,
            ephemeral: true
        })
    },
}
