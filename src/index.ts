import { Client, GatewayIntentBits } from 'discord.js'
import ClientUtils from './utils/client-utils'

// Config the env variables
require('dotenv').config()

// Create a new client instance
const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers],
})

const clientUtils = ClientUtils.getInstance()
clientUtils.initCommandList()
clientUtils.initClientEvents(client)

// Log in to Discord with your client's token
client.login(process.env.DISCORD_TOKEN)
