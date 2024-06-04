import {
    ChannelType,
    ChatInputCommandInteraction,
    EmbedBuilder,
    PermissionsBitField,
    REST,
    Routes,
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
        const data = new JailData(interaction.guildId)
        await data.loadAsync()

        if (
            !data.jailChannelId ||
            !data.jailRoleId ||
            !data.roleToRemoveId
        ) {
            await interaction.reply({
                content: 'The jail command is not setup !',
            })
            return
        }

        const jailRole = interaction.guild.roles.cache.find((r) => r.id === data.jailRoleId)
        const roleToRemove = interaction.guild.roles.cache.find((r) => r.id === data.roleToRemoveId)
        const jailChannel = interaction.guild.channels.cache.get(data.jailChannelId) as TextChannel

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
                ephemeral: true
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
            `# You are here for a reason ${memberToJail}`
        )

        threadChannel.members.add(interaction.user)

        await interaction.reply({
            content: `Jail thread created for ${memberToJail} : ${threadChannel}`,
        })

        if (!data.logChannelId) {
            return
        }

        const logChannel = interaction.guild.channels.cache.get(data.logChannelId) as TextChannel

        if (logChannel) {
            const embed = new EmbedBuilder()
            .setDescription(`Jail thread created by ${interaction.user} : ${threadChannel}`)
            logChannel.send({embeds: [embed]})
        }
    },
}
