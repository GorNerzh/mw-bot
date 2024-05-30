import {
    ChatInputCommandInteraction,
    SlashCommandSubcommandBuilder,
} from 'discord.js'
import ChallengeRolesData from '../../db-objects/data/challenge-roles-data'

module.exports = {
    commandName: 'remove',
    data: new SlashCommandSubcommandBuilder()
        .setName('remove')
        .setDescription('Removes a challenge role.')
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
        if (index < 0) {
            await interaction.reply({
                content: `${role} is not a challenge role`,
                ephemeral: true
            })
            return
        }

        challengeRoles.challengeRoleIds.splice(index, 1);

        await challengeRoles.saveAsync()
        await interaction.reply({
            content: `Removed the role ${role}.`,
            ephemeral: true
        })
    },
}
