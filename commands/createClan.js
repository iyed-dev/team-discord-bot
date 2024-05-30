const { SlashCommandBuilder } = require('@discordjs/builders');
const { Clan, clans, saveClans } = require('../utils/clans');
const { PermissionsBitField } = require('discord.js');
const fs = require('fs');
const path = require('path');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('create_clan')
        .setDescription('Crée un nouveau clan.')
        .addStringOption(option => 
            option.setName('name')
                  .setDescription('Nom du clan')
                  .setRequired(true)),
    async execute(interaction) {
        const clanNameOption = interaction.options.getString('name');
        console.log('Received clan name option:', clanNameOption);

        if (!clanNameOption) {
            await interaction.reply('Veuillez fournir un nom valide pour le clan.');
            return;
        }

        const clanName = clanNameOption.trim().toLowerCase();
        console.log('Trimmed and lowercased clan name:', clanName);

        if (!clanName) {
            await interaction.reply('Veuillez fournir un nom valide pour le clan.');
            return;
        }

        if (Object.keys(clans).map(name => name.toLowerCase()).includes(clanName)) {
            await interaction.reply('Ce clan existe déjà.');
            return;
        }

        const guild = interaction.guild;
        const owner = interaction.member;

        // Vérifier si le membre appartient déjà à un autre clan
        const existingClan = Object.values(clans).find(clan => clan.members.includes(owner.id));
        if (existingClan) {
            await interaction.reply('Vous faites déjà partie d\'un clan.');
            return;
        }

        try {
            console.log(`Creating role for clan: ${clanName}`);
            const role = await guild.roles.create({
                name: clanNameOption, // Utiliser le nom original pour le rôle
                mentionable: true,
                reason: `Role pour le clan ${clanNameOption}` // Utiliser le nom original dans la raison
            });
            console.log(`Role created: ${role.id}`);

            let category = guild.channels.cache.find(c => c.name === 'clans' && c.type === 4); // 'GUILD_CATEGORY' type
            if (!category) {
                console.log('Creating "clans" category');
                category = await guild.channels.create({
                    name: 'clans',
                    type: 4 // 'GUILD_CATEGORY' type
                });
                console.log(`Category created: ${category.id}`);
            } else {
                console.log(`Category found: ${category.id}`);
            }

            console.log(`Creating channel for clan: ${clanName}`);
            const channel = await guild.channels.create({
                name: clanNameOption, // Utiliser le nom original pour le canal
                type: 0, // 'GUILD_TEXT' type
                parent: category.id,
                permissionOverwrites: [
                    {
                        id: guild.id,
                        deny: [PermissionsBitField.Flags.ViewChannel]
                    },
                    {
                        id: role.id,
                        allow: [PermissionsBitField.Flags.ViewChannel]
                    }
                ]
            });
            console.log(`Channel created: ${channel.id}`);

            clans[clanName] = new Clan(clanNameOption, owner); // Utiliser le nom original pour le clan
            saveClans(); // Sauvegarde des données après modification
            await owner.roles.add(role);
            console.log(`Role added to owner: ${owner.id}`);

            await interaction.reply(`Clan ${clanNameOption} créé avec succès!`);
        } catch (error) {
            console.error('Erreur lors de la création du clan:', error);
            await interaction.reply('Erreur lors de la création du clan. Veuillez vérifier les journaux pour plus de détails.');
        }
    },
};
