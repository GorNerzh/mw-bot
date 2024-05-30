import {
    ChatInputCommandInteraction,
    SlashCommandSubcommandBuilder,
} from 'discord.js'
import Utils from '../../utils/utils'
import ModCmdData from '../../db-objects/data/mod-cmd-data'

module.exports = {
    commandName: 'mod-cmd-channel',
    data: new SlashCommandSubcommandBuilder()
        .setName('mod-cmd-channel')
        .setDescription('Setup mod commands channel.')
        .addChannelOption((option) =>
            option
                .setName('channel')
                .setDescription('The channel for mod commands')
                .setRequired(false)
        ),
    async execute(interaction: ChatInputCommandInteraction) {
        const channel = interaction.options.getChannel('channel')

        const data = new ModCmdData(interaction.guildId)
        await data.loadAsync()

        if (!channel) {
            data.channelId = null
            await interaction.reply({
                content: 'Resetted the mod commands channel.',
            })
            return
        }

        if (!Utils.mustBeTextChannelAsync(channel, interaction)) {
            return
        }

        data.channelId = channel.id
        await data.saveAsync()

        await interaction.reply({
            content: 'Updated mod command channel.',
        })
    },
}
