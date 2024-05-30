const { SlashCommandBuilder } = require('@discordjs/builders');
const { clans, saveClans } = require('../utils/clans');
const { PermissionsBitField } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('accept_member')
        .setDescription('Accepte un utilisateur dans un clan.')
        .addUserOption(option => 
            option.setName('user')
                  .setDescription('Utilisateur à accepter')
                  .setRequired(true)),
    async execute(interaction) {
        const user = interaction.options.getUser('user');
        const memberId = user.id;

        // Trouver le clan dans lequel l'utilisateur a fait une demande
        let clanName = null;
        for (const [name, clan] of Object.entries(clans)) {
            if (clan.requests && clan.requests.includes(memberId)) {
                clanName = name;
                break;
            }
        }

        if (!clanName) {
            await interaction.reply({ content: 'Cet utilisateur n\'a pas demandé à rejoindre un clan.', ephemeral: true });
            return;
        }

        if (clans[clanName].members.length >= 8) {
            await interaction.reply({ content: 'Ce clan a atteint le nombre maximum de membres.', ephemeral: true });
            return;
        }

        const guild = interaction.guild;
        const member = await guild.members.fetch(memberId);

        let role = guild.roles.cache.find(r => r.name === clanName);
        if (!role) {
            role = await guild.roles.create({
                name: clanName,
                color: 'BLUE',
                reason: `Rôle pour le clan ${clanName}`,
            });
        }
        await member.roles.add(role);

        clans[clanName].members.push(memberId);
        clans[clanName].requests = clans[clanName].requests.filter(id => id !== memberId);
        saveClans();

        // Envoyer une notification dans le canal du clan
        const clanChannel = guild.channels.cache.find(channel => channel.name === clanName && channel.type === 0);
        if (clanChannel) {
            await clanChannel.send(`${user.tag} a été accepté dans le clan.`);
        }

        await interaction.reply({ content: `${user.tag} a été accepté dans le clan ${clanName}.`, ephemeral: true });
    }
};
