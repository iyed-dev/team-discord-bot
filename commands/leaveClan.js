const { SlashCommandBuilder } = require('@discordjs/builders');
const { clans, saveClans } = require('../utils/clans');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('leave_clan')
        .setDescription('Quitte le clan actuel.'),
    async execute(interaction) {
        const member = interaction.member;
        const clan = Object.values(clans).find(clan => clan.members.includes(member.id));

        if (!clan) {
            await interaction.reply('Vous ne faites partie d\'aucun clan.');
            return;
        }

        const role = interaction.guild.roles.cache.find(r => r.name === clan.name);
        if (role) {
            await member.roles.remove(role);
        }

        clan.members = clan.members.filter(m => m !== member.id);

        if (clan.members.length === 0) {
            delete clans[clan.name];
            if (role) {
                await role.delete();
            }
            const channel = interaction.guild.channels.cache.find(c => c.name === clan.name && c.type === 0); // 'GUILD_TEXT'
            if (channel) {
                await channel.delete();
            }
        } else if (clan.owner.id === member.id) {
            clan.owner = interaction.guild.members.cache.get(clan.members[0]);
        }

        saveClans(); // Sauvegarde des données après modification
        await interaction.reply(`Vous avez quitté le clan ${clan.name}.`);
    },
};
