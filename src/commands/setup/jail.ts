import {
    ChatInputCommandInteraction,
    SlashCommandSubcommandBuilder,
} from 'discord.js'
import JailData from '../../db-objects/data/jail-data'
import Utils from '../../utils/utils'

module.exports = {
    commandName: 'jail',
    data: new SlashCommandSubcommandBuilder()
        .setName('jail')
        .setDescription('Setup jail roles and channel.')
        .addRoleOption((option) =>
            option
                .setName('jail-role')
                .setDescription('The role to assign to jailed users.')
                .setRequired(true)
        )
        .addRoleOption((option) =>
            option
                .setName('role-to-remove')
                .setDescription('The role to remove from jailed users.')
                .setRequired(true)
        )
        .addChannelOption((option) =>
            option
                .setName('jail-channel')
                .setDescription('The jail channel.')
                .setRequired(true)
        )
        .addChannelOption((option) =>
            option
                .setName('log-channel')
                .setDescription('The channel to log jail actions.')
                .setRequired(false)
        ),
    async execute(interaction: ChatInputCommandInteraction) {

        const channel = interaction.options.getChannel('jail-channel')

        if (!await Utils.mustBeTextChannelAsync(channel, interaction)) {
            return
        }

        const data = new JailData(interaction.guildId)
        data.jailChannelId = channel.id
        data.jailRoleId = interaction.options.getRole('jail-role').id
        data.roleToRemoveId = interaction.options.getRole('role-to-remove').id
        const logChannel = interaction.options.getChannel('log-channel')
        if (logChannel) {
            data.logChannelId = logChannel.id
        }
        await data.saveAsync()

        await interaction.reply({
            content: 'Jail config updated.',
        })
    },
}
