import { Client, Collection, SlashCommandBuilder } from 'discord.js'
import path from 'path'
import fs from 'fs'

class ClientUtils {
    private static instance: ClientUtils
    public commands = new Collection<string, any>()

    private constructor() {}

    public static getInstance(): ClientUtils {
        if (!ClientUtils.instance) {
            ClientUtils.instance = new ClientUtils()
        }
        return ClientUtils.instance
    }

    public initCommandList() {
        const foldersPath = path.join(__dirname, '../commands')
        const commandFolders = fs.readdirSync(foldersPath)

        for (const folder of commandFolders) {
            const commandsPath = path.join(foldersPath, folder)
            const commandFiles = fs
                .readdirSync(commandsPath)
                .filter((file) => file.endsWith('.js'))
            for (const file of commandFiles) {
                const filePath = path.join(commandsPath, file)
                const command = require(filePath)
                if ('data' in command && 'execute' in command) {
                    if (command.data instanceof SlashCommandBuilder) {
                        this.commands.set(command.data.name, command)
                    }
                } else {
                    console.log(
                        `[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`
                    )
                }
            }
        }
    }

    public initClientEvents(client: Client) {
        const eventsPath = path.join(__dirname, '../events')
        const eventFiles = fs
            .readdirSync(eventsPath)
            .filter((file) => file.endsWith('.js'))

        for (const file of eventFiles) {
            const filePath = path.join(eventsPath, file)
            const event = require(filePath)
            if (event.once) {
                client.once(event.name, (...args) => event.execute(...args))
            } else {
                client.on(event.name, (...args) => event.execute(...args))
            }
        }
    }
}

export default ClientUtils
