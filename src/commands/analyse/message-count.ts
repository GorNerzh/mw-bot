import {
    ChatInputCommandInteraction,
    EmbedBuilder,
    SlashCommandSubcommandBuilder,
    User,
} from 'discord.js'
import ChannelUtils from '../../utils/channel-utils'
import AnalysisData from '../../db-objects/data/analysis'

module.exports = {
    commandName: 'message-count',
    data: new SlashCommandSubcommandBuilder()
        .setName('message-count')
        .setDescription('Count the messages per member.'),
    async execute(interaction: ChatInputCommandInteraction) {
        const data = new AnalysisData(interaction.guildId)
        await data.loadAsync()
        if (await data.noDataLoaded(interaction)) {
            return
        }

        const userData = new Array<UserData>()

        data.messages.forEach(m => {
            const selectedData = userData.find(data => data.id == m.authorId)
            if (selectedData) {
                selectedData.messageCount++;
            }
            else {
                const newData: UserData = {
                    id: m.authorId,
                    messageCount: 1
                }
                userData.push(newData)
            }
        })

        const reply = userData.sort((u1, u2) => u2.messageCount - u1.messageCount).map(d => `<@${d.id}> : **${d.messageCount}**`).join('\n')

        const embed = new EmbedBuilder()
            .setTitle('Amount of messages posted by each user :')
            .setDescription(reply);

        await interaction.reply({embeds: [embed]})
    },
}

interface UserData {
    id: string;
    messageCount: number;
}