const fs = require('fs');
const path = require('path');

class Clan {
    constructor(name, owner) {
        this.name = name;
        this.owner = owner;
        this.members = [owner.id];
        this.requests = [];
        this.requestMessageId = null;
    }
}

const clans = {};
const reactionMessages = {};

// Sauvegarder les clans et les messages de demande de réaction dans un fichier JSON
function saveClans() {
    const data = { clans, reactionMessages };
    fs.writeFileSync(path.join(__dirname, 'clans.json'), JSON.stringify(data, null, 2));
}

// Charger les clans et les messages de demande de réaction à partir d'un fichier JSON
function loadClans() {
    if (fs.existsSync(path.join(__dirname, 'clans.json'))) {
        try {
            const rawData = fs.readFileSync(path.join(__dirname, 'clans.json'));
            const data = JSON.parse(rawData);
            if (data && typeof data === 'object') {
                if (data.clans && typeof data.clans === 'object') {
                    for (const [name, clan] of Object.entries(data.clans)) {
                        const loadedClan = new Clan(clan.name, { id: clan.owner.id });
                        loadedClan.members = clan.members;
                        loadedClan.requests = clan.requests;
                        loadedClan.requestMessageId = clan.requestMessageId;
                        clans[name] = loadedClan;
                    }
                }
                if (data.reactionMessages && typeof data.reactionMessages === 'object') {
                    Object.assign(reactionMessages, data.reactionMessages);
                }
            }
        } catch (error) {
            console.error('Erreur lors du chargement des clans:', error);
        }
    }
}

// Sauvegarder les messages de réaction dans un fichier JSON séparé
function saveReactionMessages() {
    fs.writeFileSync(path.join(__dirname, 'reactionMessages.json'), JSON.stringify(reactionMessages, null, 2));
}

// Charger les messages de réaction à partir d'un fichier JSON séparé
function loadReactionMessages() {
    if (fs.existsSync(path.join(__dirname, 'reactionMessages.json'))) {
        try {
            const rawData = fs.readFileSync(path.join(__dirname, 'reactionMessages.json'));
            const data = JSON.parse(rawData);
            if (data && typeof data === 'object') {
                Object.assign(reactionMessages, data);
            }
        } catch (error) {
            console.error('Erreur lors du chargement des messages de réaction:', error);
        }
    }
}

module.exports = {
    Clan,
    clans,
    reactionMessages,
    saveClans,
    loadClans,
    saveReactionMessages,
    loadReactionMessages
};
