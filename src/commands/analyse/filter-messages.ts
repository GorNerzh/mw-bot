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

        data.messages.forEach(m => {
            const content = m.message.content;
            const lines = content.split('\n');

            lines.forEach(line => {
                if (line.includes(filter)) {
                    filteredLines.push(line);
                }
            });
        });

        const groupedLines = filteredLines.reduce<{ [key: string]: string[] }>((acc, line) => {
            if (!acc[line]) {
                acc[line] = [];
            }
            acc[line].push(line);
            return acc;
        }, {});

        // Create an embed with the grouped lines and their counts
        const embed = new EmbedBuilder()
            .setTitle(`List of lines containing '${filter}' by ${user.displayName}`)
            .setDescription(
                Object.entries(groupedLines)
                    .map(([content, messages]) => `${content} (**${messages.length}** times)`)
                    .join('\n\n')
            );


        await interaction.reply({ embeds: [embed] })
    },
}
