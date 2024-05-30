const { SlashCommandBuilder } = require('@discordjs/builders');
const { clans, saveClans } = require('../utils/clans');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('clear')
        .setDescription('Supprime tous les clans du serveur.'),
    async execute(interaction) {
        if (!interaction.member.permissions.has('ADMINISTRATOR')) {
            await interaction.reply('Vous n\'avez pas la permission d\'utiliser cette commande.');
            return;
        }

        const guild = interaction.guild;

        for (const clanName in clans) {
            const role = guild.roles.cache.find(r => r.name === clanName);
            const channel = guild.channels.cache.find(c => c.name === clanName && c.type === 0); // 'GUILD_TEXT'

            if (role) await role.delete();
            if (channel) await channel.delete();
        }

        Object.keys(clans).forEach(key => delete clans[key]);

        saveClans(); // Sauvegarde des données après modification
        await interaction.reply('Tous les clans ont été supprimés.');
    },
};
