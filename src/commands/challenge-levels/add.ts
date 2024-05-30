import {
    ChatInputCommandInteraction,
    SlashCommandSubcommandBuilder,
} from 'discord.js'
import ChallengeLevelData, { RoleData } from '../../db-objects/data/challenge-levels-data'

module.exports = {
    commandName: 'add',
    data: new SlashCommandSubcommandBuilder()
        .setName('add')
        .setDescription('Adds a challenge level.')
        .addRoleOption((option) =>
            option
                .setName('role')
                .setDescription('The challenge level')
                .setRequired(true)
        )
        .addNumberOption((option) =>
            option
                .setName('amount')
                .setDescription('The number of challenge roles needed to obtain the level')
                .setRequired(true)
        ),
    async execute(interaction: ChatInputCommandInteraction) {
        const role = interaction.options.getRole('role')
        const data = new ChallengeLevelData(interaction.guildId)
        await data.loadAsync()

        const index = data.challengeLevelIds.findIndex(c => c.roleId == role.id);
        if (index > -1) {
            await interaction.reply({
                content: `${role} is already a level role.`,
                ephemeral: true
            })
            return
        }

        const roleData = new RoleData()
        roleData.roleId = role.id
        roleData.level = interaction.options.getNumber('amount')

        data.challengeLevelIds.push(roleData)
        await data.saveAsync()

        await interaction.reply({
            content: `Added the role ${role}.`,
            ephemeral: true
        })
    },
}
