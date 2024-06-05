import {
    ChatInputCommandInteraction,
    EmbedBuilder,
    SlashCommandSubcommandBuilder,
} from 'discord.js'
import AnalysisData from '../../db-objects/data/analysis'

module.exports = {
    commandName: 'filter-messages',
    data: new SlashCommandSubcommandBuilder()
        .setName('filter-messages')
        .setDescription('List the messages containing a certain pattern.')
        .addUserOption((option) =>
            option
                .setName('user')
                .setDescription('The selected user')
                .setRequired(true)
        )
        .addStringOption((option) =>
            option
                .setName('contains')
                .setDescription('The filter')
                .setRequired(true)
        ),
    async execute(interaction: ChatInputCommandInteraction) {
        const user = interaction.options.getUser('user')
        const filter = interaction.options.getString('contains')

        const data = new AnalysisData(interaction.guildId)
        await data.loadAsync()
        if (await data.noDataLoaded(interaction)) {
            return
        }

        let filteredLines: string[] = [];

        const regex: RegExp = new RegExp(`${filter.replace('[*]', '.*').toLowerCase()}`);
        
        // Extract the lines containing the filter from the messages
        data.messages.filter(m => m.authorId == user.id).forEach(m => {
            const lines = m.message.content.split('\n');
            filteredLines.push(...lines.filter(line => regex.test(line.toLowerCase())))
        });

        const groupedLines = filteredLines.reduce<{ [key: string]: string[] }>((acc, line) => {
            if (!acc[line]) {
                acc[line] = [];
            }
            acc[line].push(line);
            return acc;
        }, {});

        const totalLinesFound = Object.values(groupedLines).reduce((acc, lines) => acc + lines.length, 0);

        const embed = new EmbedBuilder()
            .setTitle(`List of lines containing '${filter}' by ${user.displayName}`)
            .setDescription(
                `**${totalLinesFound}** lines found:\n\n` +
                Object.entries(groupedLines)
                    .sort((a, b) => b[1].length - a[1].length) // Sort by count in descending order
                    .map(([line, lines]) => `${line} (**${lines.length}** times)`)
                    .join('\n')
            );


        await interaction.reply({ embeds: [embed] })
    },
}
