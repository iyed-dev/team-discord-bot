require('dotenv').config();
const { Client, GatewayIntentBits, Collection, PermissionsBitField } = require('discord.js');
const fs = require('fs');
const path = require('path');
const { Clan, clans, saveClans, loadClans } = require('./utils/clans');

if (!process.env.TOKEN || !process.env.GUILD_ID) {
    console.error('Veuillez définir les variables d\'environnement TOKEN et GUILD_ID.');
    process.exit(1);
}

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMessageReactions
    ]
});

client.commands = new Collection();
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    client.commands.set(command.data.name, command);
}

client.once('ready', async () => {
    console.log(`Connecté en tant que ${client.user.tag}`);
    loadClans(); // Charger les données des clans
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return;

    const command = client.commands.get(interaction.commandName);

    if (!command) return;

    try {
        await command.execute(interaction);
    } catch (error) {
        console.error(error);
        await interaction.reply({ content: 'Erreur lors de l\'exécution de la commande.', ephemeral: true });
    }
});

client.on('disconnect', () => {
    saveClans(); // Sauvegarder les données des clans lors de la déconnexion
});

client.login(process.env.TOKEN);
