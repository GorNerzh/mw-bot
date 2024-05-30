import {
    ChatInputCommandInteraction,
    SlashCommandSubcommandBuilder,
} from 'discord.js'
import ChallengeLevelData from '../../db-objects/data/challenge-levels-data'

module.exports = {
    commandName: 'remove',
    data: new SlashCommandSubcommandBuilder()
        .setName('remove')
        .setDescription('Removes a challenge level.')
        .addRoleOption((option) =>
            option
                .setName('role')
                .setDescription('The level role')
                .setRequired(true)
        ),
    async execute(interaction: ChatInputCommandInteraction) {
        const role = interaction.options.getRole('role')
        const challengeRoles = new ChallengeLevelData(interaction.guildId)
        await challengeRoles.loadAsync()

        const index = challengeRoles.challengeLevelIds.findIndex(c => c.roleId == role.id);
        if (index < 0) {
            await interaction.reply({
                content: `${role} is not a level role.`,
                ephemeral: true
            })
            return
        }

        challengeRoles.challengeLevelIds.splice(index, 1);

        await challengeRoles.saveAsync()
        await interaction.reply({
            content: `Removed the role ${role}.`,
            ephemeral: true
        })
    },
}
