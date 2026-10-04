🛡️ Discord Guardian Bot
Bot Discord di moderazione avanzata con anti-nuke, anti-raid, anti-spam, sistema di backup automatico, ticket, statistiche e creazione video.

📋 Indice
Caratteristiche

Requisiti

Installazione

Installazione FFmpeg e creavideo.js

Configurazione

Variabili d'ambiente

Struttura del progetto

Comandi

Sistema Video

Sistemi interni

Deploy

Troubleshooting

✨ Caratteristiche
Moderazione automatica
Anti-Spam — rileva spam locale, rotazionale (multi-canale) e vocale con escalation progressiva

Anti-Ping — rileva ping testuali, vocali, rotazionali, globali e abuso @everyone con 5 livelli di escalation

Anti-Raid — rileva ondate di join, account nuovi e raffiche rapide

Anti-Link — elimina inviti Discord esterni

Anti-Ghost-Ping — logga messaggi cancellati che contenevano menzioni

Anti-Nuke — rileva e ripara automaticamente azioni distruttive (canali/ruoli eliminati, ban di massa)

Sistema di backup
Backup automatico ogni 24 ore

Cronologia ultimi 10 backup per guild

Ripristino completo di canali, categorie, ruoli, thread e assegnazioni membri

Rollback automatico dopo nuke

Logging
Log messaggi (edit/delete)

Log vocale (join/leave/move/mute/deaf)

Log membri (nickname/ruoli)

Log moderazione (kick/ban/timeout/warn/clear)

Log anti-nuke con report dettagliati

Utility
Ticket system con pulsanti e ruoli per motivo

Stats channels — contatori live di membri/bot/staff/tutti

Verifica con ruolo automatico

Benvenuto con data creazione account/server e numero membro

Auto-publish per canali annunci

Auto-thread per canali configurati

🎬 Creazione Video
Comando /creavideo per generare video direttamente da Discord

Pipeline basata sul modulo ./commands/creavideo.js

Supporto per input utente → output video allegato

🔧 Requisiti
Node.js ≥ 18.0.0 (raccomandato 20+)

npm o yarn

Un'applicazione Discord con bot token

Permessi bot: Administrator (consigliato) o almeno:

Manage Channels, Manage Roles, Manage Messages

Kick Members, Ban Members, Moderate Members

View Audit Log, Read Message History

Send Messages, Embed Links, Attach Files

FFmpeg installato nel sistema (richiesto per /creavideo)

Linux: sudo apt install ffmpeg

macOS: brew install ffmpeg

Windows: ffmpeg.org/download

📦 Installazione
bash
# 1. Clona o copia il progetto
cd discord-guardian-bot

# 2. Installa le dipendenze
npm install

# 3. (Solo se usi /creavideo) Verifica FFmpeg
ffmpeg -version

# 4. Crea il file .env
cp .env.example .env

# 5. Compila il .env con i tuoi valori

# 6. Avvia il bot
node index.js
Dipendenze richieste
json
{
  "dependencies": {
    "discord.js": "^14.x",
    "dotenv": "^16.x"
  }
}
Dipendenze opzionali per /creavideo
Aggiungi al package.json a seconda della pipeline usata nel tuo commands/creavideo.js:

json
{
  "dependencies": {
    "@ffmpeg-installer/ffmpeg": "^1.x",
    "fluent-ffmpeg": "^2.x",
    "canvas": "^2.x",
    "sharp": "^0.33.x"
  }
}
🎥 Installazione FFmpeg e creavideo.js
Questa sezione spiega esattamente dove mettere i file per far funzionare /creavideo.

📁 Struttura finale delle cartelle
text
discord-guardian-bot/
├── index.js                    ← entry point
├── package.json
├── .env                        ← variabili d'ambiente
├── config.settings.json        ← auto-generato
├── commands/                   ← cartella comandi
│   └── creavideo.js            ← QUI va creavideo.js
├── video_output/               ← auto-creata (video temporanei)
├── backups/
│   ├── backup_<guildId>.json
│   └── history/
├── ffmpeg/                     ← (opzionale, solo Windows portable)
│   ├── ffmpeg.exe
│   ├── ffprobe.exe
│   └── ffplay.exe
└── node_modules/
🎬 creavideo.js — dove metterlo
Posizione obbligatoria
text
discord-guardian-bot/commands/creavideo.js
Perché
In index.js c'è questa riga:

javascript
const creavideoCommand = require('./commands/creavideo.js');
Il path è relativo alla root del progetto. Se il file è altrove, il bot crasha all'avvio con:

text
Error: Cannot find module './commands/creavideo.js'
Come crearlo
Metodo 1 — Manuale

bash
mkdir commands
nano commands/creavideo.js
Metodo 2 — Copia da template

Se hai già un creavideo.js altrove, copialo:

bash
cp /percorso/vecchio/creavideo.js ./commands/
Deve esportare data e execute
javascript
// commands/creavideo.js
const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('creavideo')
    .setDescription('Crea un video'),
  async execute(interaction) {
    // logica
  }
};
Senza data → errore creavideoCommand.data is not a function
Senza execute → errore quando l'utente usa /creavideo

🎥 FFmpeg — dove metterlo
Hai tre strade. Scegli in base al sistema operativo.

🐧 Linux (VPS, Debian/Ubuntu)
Strada consigliata: installazione di sistema

bash
sudo apt update
sudo apt install -y ffmpeg
Verifica:

bash
which ffmpeg
# → /usr/bin/ffmpeg
ffmpeg -version
Nessuna cartella da creare. fluent-ffmpeg trova ffmpeg automaticamente nel PATH.

Se usi Fedora/RHEL:

bash
sudo dnf install -y ffmpeg
Se usi Alpine (Docker):

bash
apk add --no-cache ffmpeg
🪟 Windows
Hai due opzioni.

Opzione A — Installazione di sistema (più semplice)

Scarica da gyan.dev/ffmpeg/builds → release-essentials.zip

Estrai in C:\ffmpeg\

Aggiungi C:\ffmpeg\bin al PATH:

Tasto Windows → "Variabili d'ambiente" → Variabili di sistema → Path → Modifica → Nuovo → C:\ffmpeg\bin

Riapri il terminale

Verifica:

cmd
ffmpeg -version
Opzione B — Portable nella cartella del bot

Scarica ed estrai ffmpeg.exe, ffprobe.exe, ffplay.exe

Mettili in:

text
discord-guardian-bot/ffmpeg/
Nel tuo creavideo.js, imposta il path esplicito:

javascript
const ffmpeg = require('fluent-ffmpeg');
const path = require('path');

// Windows
ffmpeg.setFfmpegPath(path.join(__dirname, '..', 'ffmpeg', 'ffmpeg.exe'));
ffmpeg.setFfprobePath(path.join(__dirname, '..', 'ffmpeg', 'ffprobe.exe'));
Attenzione: __dirname è commands/, quindi .. sale alla root. Da lì ffmpeg/ffmpeg.exe.

🐳 Docker
Nel Dockerfile:

dockerfile
FROM node:20-alpine

# Installa FFmpeg
RUN apk add --no-cache ffmpeg

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .

# Crea cartelle runtime
RUN mkdir -p video_output backups/history

CMD ["node", "index.js"]
Verifica dentro il container:

bash
docker exec -it guardian-bot which ffmpeg
# → /usr/bin/ffmpeg
🔧 Configurazione in creavideo.js
Template completo che gestisce sia il PATH di sistema che la modalità portable:

javascript
// commands/creavideo.js
const { SlashCommandBuilder, AttachmentBuilder } = require('discord.js');
const ffmpeg = require('fluent-ffmpeg');
const path = require('path');
const fs = require('fs');

// === CONFIGURAZIONE FFMPEG ===
// Prova prima il binario portable, poi il PATH di sistema
const localFfmpeg = path.join(__dirname, '..', 'ffmpeg', 'ffmpeg.exe');
const localFfprobe = path.join(__dirname, '..', 'ffmpeg', 'ffprobe.exe');

if (fs.existsSync(localFfmpeg)) {
  ffmpeg.setFfmpegPath(localFfmpeg);
  console.log('[creavideo] FFmpeg portable trovato');
}
if (fs.existsSync(localFfprobe)) {
  ffmpeg.setFfprobePath(localFfprobe);
}
// Altrimenti usa il PATH di sistema automaticamente

module.exports = {
  data: new SlashCommandBuilder()
    .setName('creavideo')
    .setDescription('Crea un video personalizzato')
    .addStringOption(o =>
      o.setName('testo').setDescription('Testo da mostrare').setRequired(true))
    .addIntegerOption(o =>
      o.setName('durata').setDescription('Durata in secondi').setMinValue(3).setMaxValue(60)),

  async execute(interaction) {
    await interaction.deferReply();

    const testo = interaction.options.getString('testo');
    const durata = interaction.options.getInteger('durata') ?? 10;

    const outputDir = process.env.VIDEO_OUTPUT_DIR || './video_output';
    fs.mkdirSync(outputDir, { recursive: true });

    const out = path.join(outputDir, `${interaction.id}.mp4`);

    try {
      await new Promise((resolve, reject) => {
        ffmpeg()
          .input(`color=c=black:s=1280x720:d=${durata}`)
          .inputFormat('lavfi')
          .videoFilters(
            `drawtext=text='${testo.replace(/'/g, "\\'")}':` +
            `fontcolor=white:fontsize=48:` +
            `x=(w-text_w)/2:y=(h-text_h)/2`
          )
          .outputOptions([
            '-c:v libx264',
            '-pix_fmt yuv420p',
            '-preset fast',
            '-movflags +faststart'
          ])
          .save(out)
          .on('end', resolve)
          .on('error', reject);
      });

      const attachment = new AttachmentBuilder(out);
      await interaction.editReply({ files: [attachment] });

    } catch (err) {
      console.error('[creavideo]', err);
      await interaction.editReply(`❌ Errore rendering: ${err.message}`);
    } finally {
      fs.unlink(out, () => {});
    }
  }
};
📋 Checklist finale
Linux

□ sudo apt install ffmpeg (o equivalente)
□ commands/creavideo.js presente
□ node index.js parte senza errori
□ /creavideo testo:Ciao funziona
Windows — PATH di sistema

□ FFmpeg in C:\ffmpeg\bin
□ PATH aggiornato
□ ffmpeg -version funziona in cmd
□ commands/creavideo.js presente
□ /creavideo testo:Ciao funziona
Windows — Portable

□ ffmpeg/ffmpeg.exe + ffprobe.exe nella root del bot
□ creavideo.js con ffmpeg.setFfmpegPath(...)
□ /creavideo testo:Ciao funziona
Docker

□ RUN apk add --no-cache ffmpeg nel Dockerfile
□ Volume montato: -v $(pwd)/video_output:/app/video_output
□ /creavideo testo:Ciao funziona
🧪 Test rapido
Dopo aver messo tutto a posto, testa da terminale:

Linux / macOS:

bash
node -e "const ff=require('fluent-ffmpeg'); ff.getAvailableFormats((e,f)=>{if(e)console.error(e);else console.log('OK, formati:',Object.keys(f).length)})"
Windows:

cmd
node -e "const ff=require('fluent-ffmpeg'); ff.getAvailableFormats((e,f)=>{if(e)console.error(e);else console.log('OK, formati:',Object.keys(f).length)})"
Se stampa OK, formati: N → FFmpeg è correttamente rilevato.

⚠️ Errori comuni
Errore	Causa	Fix
Cannot find module './commands/creavideo.js'	File mancante o path sbagliato	Metti creavideo.js in commands/
creavideoCommand.data is not a function	Manca data nell'export	Aggiungi data: new SlashCommandBuilder()...
ffmpeg: command not found	FFmpeg non installato o fuori PATH	Installa o usa modalità portable
drawtext: No such filter	FFmpeg compilato senza --enable-libfreetype	Usa build completa (gyan.dev)
EACCES: permission denied, mkdir video_output	Permessi cartella	chmod 755 video_output
ENOENT: no such file or directory, open ...mp4	video_output/ non esiste	Il bot la crea con fs.mkdirSync
⚙️ Configurazione
La configurazione avviene in due modi:

Variabili d'ambiente (.env) — per il setup iniziale

Comandi /config — runtime, persistiti in ./config.settings.json

Ordine di priorità
/config > .env > default hardcoded

🌍 Variabili d'ambiente
Crea un file .env nella root. Solo le variabili che non possono essere gestite da /config vanno qui.

env
# ============================================================
#  DISCORD GUARDIAN BOT — .env.example
#  Copia questo file in `.env` e compila i valori.
#
#  NOTA: tutto ciò che riguarda canali, ruoli, whitelist e
#  log è gestito via `/config` e salvato in config.settings.json.
#  NON aggiungerli qui.
# ============================================================

# === OBBLIGATORIE ===
TOKEN=il_tuo_bot_token_qui
CLIENT_ID=123456789012345678
GUILD_ID=123456789012345678
OWNER_ID=123456789012345678

# === VIDEO (/creavideo) ===
VIDEO_OUTPUT_DIR=./video_output
VIDEO_MAX_DURATION=60
VIDEO_MAX_SIZE_MB=8

# === BACKUP ===
BACKUP_INTERVAL_HOURS=24
BACKUP_HISTORY_KEEP=10

# === LOGGING INTERNO ===
LOG_LEVEL=info

# === TIMEOUT / ESCALATION ===
ESCALATION_WINDOW_HOURS=48
MAX_TIMEOUT_MINUTES=40320
Cosa è gestito da /config (NON nel .env)
Variabile	Comando /config equivalente
LOG_CHANNEL_IDS	/config logchannel add|remove|list
ALERT_CHANNEL_ID	/config channel set alert #canale
SUSPICIOUS_BOT_LOG_CHANNEL_ID	/config channel set bot_sospetti #canale
MESSAGE_LOG_CHANNEL_ID	/config channel set log_messaggi #canale
VOICE_LOG_CHANNEL_ID	/config channel set log_vocale #canale
MEMBER_LOG_CHANNEL_ID	/config channel set log_membri #canale
MOD_LOG_CHANNEL_ID	/config channel set log_moderazione #canale
IMMUNE_ROLE_ID	/config role set immune @ruolo
MEMBER_ROLE_ID	/config role set membro @ruolo
OG_ROLE_ID	/config role set og @ruolo
STAFF_ROLE_*	/config staffrole set <chiave> @ruolo
TICKET_ROLE_*	/config ticketrole set <motivo> @ruolo
VERIFY_CHANNEL_ID	/config channel set verify #canale
WELCOME_CHANNEL_ID	/config channel set welcome #canale
AI_FREE_CHANNEL_IDS	/config freechannel add|remove|list
AUTO_PUBLISH_CHANNELS	/config publishchannel add|remove|list
WHITELISTED_IDS	/config whitelist add|remove|list
📁 Struttura del progetto
text
.
├── index.js                    # Entry point
├── .env                        # Variabili d'ambiente
├── commands/
│   └── creavideo.js            # Comando creazione video
├── config.settings.json        # Config persistita (auto-generato)
├── member_numbers.json         # Numeri membri (auto-generato)
├── stats_channels.json         # ID canali stats (auto-generato)
├── ticket_data.json            # Dati ticket (auto-generato)
├── video_output/               # Video generati (auto-creata)
├── ffmpeg/                     # (opzionale) FFmpeg portable
└── backups/
    ├── backup_<guildId>.json   # Ultimo backup
    └── history/
        └── backup_<guildId>_<timestamp>.json
🎮 Comandi
👤 Generali (tutti)
Comando	Descrizione
/help	Lista comandi disponibili
/ping	Latenza bot
/serverinfo	Info server
/userinfo [@utente]	Info utente
/avatar [@utente]	Avatar utente
/verify	Verifica nel canale dedicato
/regole	Mostra il regolamento
/creavideo	Crea un video
🛡️ Moderazione (staff)
Comando	Permesso	Descrizione
/kick @utente [motivo]	Kick Members	Espelle
/ban @utente [motivo]	Ban Members	Banna
/unban <id> [motivo]	Ban Members	Rimuove ban
/timeout @utente <min> [motivo]	Moderate Members	Timeout
/untimeout @utente [motivo]	Moderate Members	Rimuove timeout
/warn @utente <motivo>	Moderate Members	Warn con DM
/clear <quantità>	Manage Messages	Pulisce (max 1000)
/roleall @ruolo	Administrator	Assegna ruolo a tutti
/controlla <utente>	Moderate Members	Cerca richieste whitelist
⚙️ Configurazione (/config)
text
/config show                                    → Mostra config attuale
/config whitelist add|remove|list @utente       → Gestione whitelist (solo founder)
/config role set <target> @ruolo                → Imposta ruolo (immune/membro/og)
/config channel set <target> #canale            → Imposta canale (alert/verify/welcome/log)
/config logchannel add|remove|list #canale      → Canali log
/config freechannel add|remove|list #canale     → Canali free (no anti-spam)
/config publishchannel add|remove|list #canale  → Canali auto-publish
/config staffrole set <chiave> @ruolo           → Ruoli staff
/config ticketrole set <motivo> @ruolo          → Ruoli ticket
👑 Founder-only (prefix !)
Comando	Descrizione
!concedi @utente <n>	Concede n permessi bypass anti-nuke
!toglipermessi @utente <n>	Rimuove permessi
!lock [motivo]	Attiva lockdown (blocca tutti i canali)
!unlock	Rimuove lockdown
💾 Backup / Restore
Comando	Descrizione
/backup_server	Forza backup manuale
/restore_server	Ripristina da backup (⚠️ elimina tutto!)
📊 Setup
Comando	Descrizione
/stats_setup	Crea/ripara canali stats
/stats_refresh	Forza aggiornamento
/ticket_setup	Crea/ripara pannello ticket
🎬 Sistema Video
Comando /creavideo
Genera un video a partire dagli input dell'utente. La logica è incapsulata in ./commands/creavideo.js.

Flusso
text
Utente → /creavideo [opzioni]
   ↓
creavideoCommand.execute(interaction)
   ↓
[ pipeline interna: template, ffmpeg, rendering ]
   ↓
Allegato video → risposta a Discord
Configurazione
Variabile	Default	Descrizione
VIDEO_OUTPUT_DIR	./video_output	Cartella output temporaneo
VIDEO_MAX_DURATION	60	Durata massima in secondi
VIDEO_MAX_SIZE_MB	8	Dimensione massima allegato (limite Discord free)
Requisiti runtime
FFmpeg nel PATH di sistema (o portable in ffmpeg/)

Spazio disco almeno 500 MB per video temporanei

RAM consigliata 1 GB+ per rendering

CPU — il rendering è CPU-bound; multi-core consigliato

Note tecniche
I video vengono salvati in video_output/ prima dell'invio

Pulizia automatica consigliata ogni 24h (aggiungi al cron del sistema)

Se il video supera VIDEO_MAX_SIZE_MB, il bot risponde con errore

Concurrency: se più utenti invocano /creavideo insieme, il bot mette in coda (limite consigliato: 2 simultanei)

🧠 Sistemi interni
ViolationTracker
Traccia violazioni in una finestra di 15s. Soglia: 3 violazioni = azione.

EscalationTracker
3 livelli: 10min → 1h → 24h (finestra 48h).

EveryoneEscalationTracker
5 livelli: 5min → 15min → 1h → 6h → 24h (finestra 24h).

SpamTracker
Locale — 3 messaggi in 5s nello stesso canale

Rotazionale — 3 messaggi in 2+ canali in 6s

Vocale — 3 messaggi in 7s in canale vocale

PingTracker
Testuale — 5 ping in 6s

Vocale — 4 ping in 8s

Rotazionale — stesso target in 3 canali in 8s

Globale — 8 ping in 10s

@everyone — multi-canale (2+ in 5min)

@everyone abuse — 2+ in 2h → timeout 6h

@everyone rapido — 3 in 1min → escalation 5 livelli

RaidTracker
Burst rapido — 5 join in 10s

Flusso — 15 join in 60s

Account nuovi — 3 account <7gg in 60s

Anti-Nuke
Ogni azione distruttiva (channel/role delete, ban) viene:

Attribuita via audit log

Punita (timeout 1h sull'esecutore)

Riparata automaticamente via backup o changes dell'audit log

Reportata con riepilogo riparazioni

Video Pipeline
interaction ricevuta → creavideoCommand.execute()

Input parsati e validati

Rendering via FFmpeg (template, testo, transizioni)

Output in video_output/

Upload come allegato Discord

Pulizia file temporaneo

🚀 Deploy
Metodo 1: VPS (consigliato)
bash
# Installa FFmpeg
sudo apt install ffmpeg

# Installa PM2
npm install -g pm2

# Avvia
pm2 start index.js --name guardian-bot

# Auto-start al boot
pm2 startup
pm2 save

# Log
pm2 logs guardian-bot
Metodo 2: Docker
dockerfile
FROM node:20-alpine
RUN apk add --no-cache ffmpeg
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN mkdir -p video_output backups/history
CMD ["node", "index.js"]
bash
docker build -t guardian-bot .
docker run -d \
  --name guardian-bot \
  --restart unless-stopped \
  --env-file .env \
  -v $(pwd)/video_output:/app/video_output \
  -v $(pwd)/backups:/app/backups \
  guardian-bot
Metodo 3: Hosting gratuito
Vedi la guida precedente. Consigliati: DisHost, Kerit Cloud, Fly.io.

⚠️ Attenzione: molti hosting gratuiti non hanno FFmpeg preinstallato e hanno limiti di CPU/RAM che rendono /creavideo lento o inutilizzabile. Per il rendering video serve un VPS con almeno 1 GB RAM e 1 vCPU dedicata.

🔍 Troubleshooting
Il bot non si connette
Verifica TOKEN nel .env

Controlla che gli intent siano abilitati nel Discord Developer Portal:

✅ Server Members Intent

✅ Message Content Intent

✅ Presence Intent (opzionale)

Comandi slash non appaiono
Attendi fino a 1 ora per i comandi globali

I comandi guild (con GUILD_ID) appaiono subito

Prova a riavviare Discord (Ctrl+R)

Anti-nuke non punisce
Verifica che il bot abbia ruolo sopra i ruoli da moderare

Controlla che abbia View Audit Log

Backup fallisce
Verifica permessi di scrittura nella cartella del bot

Controlla che ./backups/ esista o sia creabile

Ticket non funziona
Verifica che il canale pannello abbia i permessi corretti

Controlla TICKET_ROLE_MEMBRI e TICKET_ROLE_BOT

Log non arrivano
Verifica che i canali configurati esistano

Controlla che il bot abbia Send Messages + Embed Links

Se fallisce tutto, il bot DMa l'owner come fallback

/creavideo non funziona
ffmpeg: command not found → installa FFmpeg nel sistema (vedi Installazione FFmpeg e creavideo.js)

Cannot find module './commands/creavideo.js' → il file non è in commands/

"File troppo grande" → riduci durata o risoluzione (max 8 MB free)

Rendering lentissimo → CPU insufficiente, riduci risoluzione a 640x360

Errore font → su Linux installa fonts-dejavu: sudo apt install fonts-dejavu

Video corrotto → verifica -pix_fmt yuv420p e codec libx264

Timeout Discord (15 min) → il rendering deve finire in 15 min; se più lungo, invia come messaggio separato con interaction.followUp()

Permessi cartella → chmod 755 video_output

📝 Note
Config persistente: tutte le modifiche via /config sopravvivono al riavvio

File auto-generati: config.settings.json, member_numbers.json, stats_channels.json, ticket_data.json

Backup automatico: ogni 24h per ogni guild (cronologia ultimi 10)

Fallback DM: se nessun canale log è disponibile, il bot DMa l'owner

Whitelist: utenti in whitelist sono immuni a tutte le azioni automatiche

Video: i file temporanei in video_output/ vanno puliti periodicamente; aggiungi un cron job o uno script di cleanup

Cleanup automatico video (opzionale)
javascript
// Aggiungi in fondo a index.js
const VIDEO_CLEANUP_INTERVAL_MS = 60 * 60 * 1000; // 1h
setInterval(() => {
  const dir = process.env.VIDEO_OUTPUT_DIR || './video_output';
  if (!fs.existsSync(dir)) return;
  const now = Date.now();
  for (const f of fs.readdirSync(dir)) {
    const p = path.join(dir, f);
    try {
      if (now - fs.statSync(p).mtimeMs > 2 * 60 * 60 * 1000) fs.unlinkSync(p);
    } catch {}
  }
}, VIDEO_CLEANUP_INTERVAL_MS);
📄 Licenza
Uso personale. Modifica liberamente.
