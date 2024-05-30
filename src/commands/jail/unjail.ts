import {
    ChatInputCommandInteraction,
    PermissionsBitField,
    SlashCommandBuilder,
} from 'discord.js'
import JailData from '../../db-objects/data/jail-data'
import Utils from '../../utils/utils'

module.exports = {
    data: new SlashCommandBuilder()
        .setName('unjail')
        .setDescription('Unjails a user.')
        .addUserOption((option) =>
            option
                .setName('user')
                .setDescription('The user to unjail.')
                .setRequired(true)
        )
        .setDefaultMemberPermissions(PermissionsBitField.Flags.ModerateMembers),

    async execute(interaction: ChatInputCommandInteraction) {
        if (!await Utils.isModCmdChannel(interaction)){
            return
        }
        const setup = new JailData(interaction.guildId)
        await setup.loadAsync()
        if (
            !setup.jailChannelId ||
            !setup.jailRoleId ||
            !setup.roleToRemoveId
        ) {
            await interaction.reply({
                content: 'The jail command is not setup !',
            })
            return
        }

        const jailRole = interaction.guild.roles.cache.find((r) => r.id === setup.jailRoleId)
        const roleToRemove = interaction.guild.roles.cache.find((r) => r.id === setup.roleToRemoveId)

        if (!jailRole) {
            await interaction.reply({
                content: 'Could not find the jail role.',
            })
            return
        }
        if (!roleToRemove) {
            await interaction.reply({
                content: 'Could not find the role to remove.',
            })
            return
        }

        const user = interaction.options.getUser('user')
        const memberToJail = await interaction.guild.members.fetch(user)

        if (!memberToJail.roles.cache.some((r) => r.id === jailRole.id)) {
            await interaction.reply({
                content: `This member doesn't have the ${jailRole} role`,
            })
            return
        }

        // Remove member role and add jail role
        await memberToJail.roles.remove(jailRole)
        await memberToJail.roles.add(roleToRemove)

        await interaction.reply({
            content: `Unjailed user ${memberToJail}.`,
        })
    },
}
