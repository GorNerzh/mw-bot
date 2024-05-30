import { SlashCommandBuilder, PermissionsBitField, EmbedBuilder, ChatInputCommandInteraction, Collection, Role } from 'discord.js';
import Utils from '../../utils/utils';

module.exports = {
    data: new SlashCommandBuilder()
        .setName('list-roles')
        .setDescription('List roles with certain perms.')
        .setDefaultMemberPermissions(PermissionsBitField.Flags.ModerateMembers)
        .addStringOption(option =>
            option
                .setName('perms')
                .setDescription('The permission to check for')
                .setRequired(true)
                .addChoices(
                    { name: 'Administrator', value: 'ADMINISTRATOR' },
                    { name: 'Mention Everyone', value: 'MENTION_EVERYONE' },
                    { name: 'Mentionable', value: 'MENTIONABLE' },
                    { name: 'Time Out Members', value: 'MODERATE_MEMBERS' },
                    { name: 'Kick Members', value: 'KICK_MEMBERS' },
                    { name: 'Ban Members', value: 'BAN_MEMBERS' },
                    { name: 'Manage Roles', value: 'MANAGE_ROLES' },
                    { name: 'Manage Channels', value: 'MANAGE_CHANNELS' },
                    { name: 'View Channels', value: 'VIEW_CHANNELS' },
                ),
        ),

    async execute(interaction: ChatInputCommandInteraction) {
        if (!await Utils.isModCmdChannel(interaction)) {
            return
        }
        const permission = interaction.options.getString('perms');

        let rolesWithPermission: Collection<string, Role>

        if (permission == 'MENTIONABLE') {
            rolesWithPermission = interaction.guild.roles.cache.filter(role => role.mentionable);
        }
        else if (permission == 'ADMINISTRATOR') {
            rolesWithPermission = interaction.guild.roles.cache.filter(r => r.permissions.has(PermissionsBitField.Flags.Administrator))
        }
        else {
            const permbigInt = getPermissionBigInt(permission)
            rolesWithPermission = interaction.guild.roles.cache.filter(role => role.permissions.has(permbigInt, false))
                .filter(r => !r.permissions.has(PermissionsBitField.Flags.Administrator));
        }

        rolesWithPermission = rolesWithPermission.sort((r1, r2) => r2.position - r1.position)

        const embed = new EmbedBuilder()
            .setTitle(`Roles with ${permission} Permission`)
            .setDescription(rolesWithPermission.map(role => `${role}`).join('\n') || 'No roles found');

        await interaction.reply({ embeds: [embed] });
    }
};

function getPermissionBigInt(permission: string): bigint {
    switch (permission) {
        case 'ADMINISTRATOR':
            return PermissionsBitField.Flags.Administrator
        case 'VIEW_CHANNELS':
            return PermissionsBitField.Flags.ViewChannel
        case 'MENTION_EVERYONE':
            return PermissionsBitField.Flags.MentionEveryone
        case 'MODERATE_MEMBERS':
            return PermissionsBitField.Flags.ModerateMembers
        case 'MANAGE_ROLES':
            return PermissionsBitField.Flags.ManageRoles
        case 'MANAGE_CHANNELS':
            return PermissionsBitField.Flags.ManageChannels
        case 'BAN_MEMBERS':
            return PermissionsBitField.Flags.BanMembers
        case 'KICK_MEMBERS':
            return PermissionsBitField.Flags.KickMembers
        default:
            break;
    }
}