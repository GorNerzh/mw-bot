# The MW-bot Project

## Requirements

### Discord

- A Discord bot 
- A Discord server for testing

### Dev requirements

- The latest version of Node.js (v21)

## Setup the environment

First, create a `.env` file at the root of the project. Paste the following content into the file and update the data with your own :

```
DISCORD_TOKEN=the bot token
CLIENT=the bot client ID
TEST_GUILD=the discord server ID for testing the bot
```

## NPM commands

`npm run build` : Build the project

`npm start` : Build the project and start the bot

`npm run deploy` : Reload the slash commands on the test server

`npm run deploy:global` : Reload the slash commands for every server (changes appear around 30 minutes later)

## Project architecture

The bot code is contained in the `/src` folder.

### Creating commands

To create a command, go to the `./commands` folder, then create a `.ts` file **inside** a new or existing subfolder.

The file architecture :

```ts
module.exports = {
    data: new SlashCommandBuilder()
        .setName('command-name')
        .setDescription('Command description')
        // Add other parameters...
    ,
    async execute(interaction: ChatInputCommandInteraction) {
        // Your code here

        await interaction.reply({ content: `The command works!` });
    }
}
```

Use the `npm run deploy` command to reload the commands.

### Creating events

Create a `.ts` file inside the `./events` folder and copy another event file's architecture.

File architecture :

```ts
module.exports = {
    name: Events.<EventName>,
    async execute(<parameters>) {
        // Your code
    },
}
```
Go onto the Events section of [this page](https://discord.js.org/docs/packages/discord.js/14.15.2/Client:Class#applicationCommandPermissionsUpdate) to obtain the events name and the parameters inside the execute() command.

### Managing data

#### Create a data class

This project uses QuickDB to store persistent data. The data is stored in a file called `json.sqlite` located at the project's root.

**Steps to create a data class :**
- Inside `db-objects/datakeys.ts`, add a key to the enum. It will define the data location in the database.
- Create a `.ts` file inside the `/db-objects/data` folder. Create a class that extends `BaseData`.
- Add every properties needed to the class
- Add the following constructor to the class. Use the key created in the DataKey enum for the second parameter :
```js
constructor(guildId: string) {
    super(guildId, DataKey.yourDataKey)
}
```

> Each guild must have its own data. The guild ID must be provided to not overwrite the data of another guild.

#### Use the data classes

1. Instantiate a data class : `MyData data = new MyData(guildId)`

2. Load the data from the database : `await data.LoadAsync()`

3. Read / update the data class properties.

4. Save the data to the database : `await data.SaveAsync()`

## Side notes

- Sometimes Typescript doesn't build the project properly. Delete the `/dist` folder and rebuild the project.