import { BaseInteraction, Events } from 'discord.js'
import ClientUtils from '../utils/client-utils'

module.exports = {
    name: Events.InteractionCreate,
    async execute(interaction: BaseInteraction) {
        if (!interaction.isChatInputCommand()) return

        const command = ClientUtils.getInstance().commands.get(
            interaction.commandName
        )

        if (!command) {
            console.error(
                `No command matching ${interaction.commandName} was found.`
            )
            return
        }

        try {
            await command.execute(interaction)
        } catch (error) {
            console.error(error)
            if (interaction.replied || interaction.deferred) {
                await interaction.followUp({
                    content: 'There was an error while executing this command !',
                    ephemeral: true,
                })
            } else {
                await interaction.reply({
                    content: 'There was an error while executing this command !',
                    ephemeral: true,
                })
            }
        }
    },
}
