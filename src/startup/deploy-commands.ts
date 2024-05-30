import { REST, Routes, SlashCommandBuilder } from 'discord.js'
import path from 'path'
import fs from 'fs'

// Config the env variables
require('dotenv').config()

const commands: any[] = []
// Grab all the command folders from the commands directory you created earlier
const foldersPath = path.join(__dirname, '../commands')
const commandFolders = fs.readdirSync(foldersPath)

for (const folder of commandFolders) {
    // Grab all the command files from the commands directory you created earlier
    const commandsPath = path.join(foldersPath, folder)
    const commandFiles = fs
        .readdirSync(commandsPath)
        .filter((file) => file.endsWith('.js'))
    // Grab the SlashCommandBuilder#toJSON() output of each command's data for deployment
    for (const file of commandFiles) {
        const filePath = path.join(commandsPath, file)
        const command = require(filePath)
        if ('data' in command && 'execute' in command) {
            if (command.data instanceof SlashCommandBuilder) {
                commands.push(command.data.toJSON())
            }
        } else {
            console.log(
                `[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`
            )
        }
    }
}

//commands.splice(0, commands.length)

// Construct and prepare an instance of the REST module
const rest = new REST().setToken(process.env.DISCORD_TOKEN)

// Deploy the commands
;(async () => {
    console.log(
        `Started refreshing ${commands.length} application (/) commands.`
    )

    try {
        if (process.argv[2] === 'global') {
            const data: any = await rest.put(
                Routes.applicationCommands(process.env.CLIENT),
                { body: commands }
            )

            console.log(
                `Successfully reloaded ${data.length} global application (/) commands.`
            )
        } else {
            const data: any = await rest.put(
                Routes.applicationGuildCommands(
                    process.env.CLIENT,
                    process.env.TEST_GUILD
                ),
                { body: commands }
            )

            console.log(
                `Successfully reloaded ${data.length} application (/) commands.`
            )
        }
    } catch (error) {
        console.error(error)
    }
})()
