const { SlashCommandBuilder } = require('@discordjs/builders');
const { clans, saveClans } = require('../utils/clans');
const { PermissionsBitField } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('request_clan')
        .setDescription('Demande à rejoindre un clan.')
        .addStringOption(option => 
            option.setName('name')
                  .setDescription('Nom du clan')
                  .setRequired(true)),
    async execute(interaction) {
        const clanName = interaction.options.getString('name').trim();
        const userId = interaction.user.id;
        const userName = interaction.user.tag;

        if (!clans[clanName]) {
            await interaction.reply({ content: 'Ce clan n\'existe pas.', ephemeral: true });
            return;
        }

        if (clans[clanName].members.includes(userId)) {
            await interaction.reply({ content: 'Vous êtes déjà membre de ce clan.', ephemeral: true });
            return;
        }

        const userIsMemberOfAnotherClan = Object.values(clans).some(clan => clan.members.includes(userId));
        if (userIsMemberOfAnotherClan) {
            await interaction.reply({ content: 'Vous êtes déjà membre d\'un autre clan.', ephemeral: true });
            return;
        }

        clans[clanName].requests = clans[clanName].requests || [];
        if (clans[clanName].requests.includes(userId)) {
            await interaction.reply({ content: 'Vous avez déjà demandé à rejoindre ce clan.', ephemeral: true });
            return;
        }

        clans[clanName].requests.push(userId);
        saveClans();

        // Trouver le canal du clan
        const guild = interaction.guild;
        const clanChannel = guild.channels.cache.find(channel => channel.name === clanName && channel.type === 0);

        if (clanChannel) {
            await clanChannel.send(`Nouvelle demande de ${userName} pour rejoindre le clan.`);
        }

        await interaction.reply({ content: `Votre demande pour rejoindre le clan ${clanName} a été envoyée.`, ephemeral: true });
    }
};
