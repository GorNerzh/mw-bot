import {
    ChannelType,
    ChatInputCommandInteraction,
    PermissionsBitField,
    SlashCommandBuilder,
    TextChannel,
    ThreadAutoArchiveDuration,
} from 'discord.js'
import JailData from '../../db-objects/data/jail-data'
import Utils from '../../utils/utils'

module.exports = {
    data: new SlashCommandBuilder()
        .setName('jail')
        .setDescription('Jails a user.')
        .addUserOption((option) =>
            option
                .setName('user')
                .setDescription('The user to put in jail.')
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
        const jailChannel = interaction.guild.channels.cache.get(setup.jailChannelId) as TextChannel

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

        if (memberToJail.roles.cache.some((r) => r.id === jailRole.id)) {
            await interaction.reply({
                content: `This member already has the ${jailRole} role`,
            })
            return
        }

        // Remove member role and add jail role
        await memberToJail.roles.remove(roleToRemove)
        await memberToJail.roles.add(jailRole)

        const threadChannel = await jailChannel.threads
            .create({
                name: `Jail-Thread-${memberToJail.displayName}`,
                autoArchiveDuration: ThreadAutoArchiveDuration.OneDay,
                reason: `${memberToJail.displayName} was jailed`,
                type: ChannelType.PrivateThread,
            })
        
        await threadChannel.send(
            `# You are here for a reason ${memberToJail}\nAction taken by ${interaction.user}`
        )

        await interaction.reply({
            content: `Jail thread created for ${memberToJail} : ${threadChannel}`,
        })
    },
}
