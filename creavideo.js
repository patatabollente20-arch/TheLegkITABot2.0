const { SlashCommandBuilder, AttachmentBuilder } = require('discord.js');
const { generateSpeechWithSubtitles } = require('../services/tts.js');
const { createFinalVideo } = require('../services/ffmpeg.js');

// Limite conservativo per l'invio come allegato Discord (il limite reale
// dipende dal boost del server: 25MB di default, 50MB/100MB con boost).
const MAX_ATTACHMENT_BYTES = 25 * 1024 * 1024;

const data = new SlashCommandBuilder()
  .setName('creavideo')
  .setDescription('Crea un video con voce sintetica e sottotitoli a partire da una clip (100% gratis)')
  .addAttachmentOption((opt) =>
    opt.setName('clip').setDescription('Il video/clip di partenza').setRequired(true)
  )
  .addStringOption((opt) =>
    opt.setName('testo').setDescription('Testo da narrare nel video').setRequired(true)
  )
  .addStringOption((opt) =>
    opt
      .setName('voce')
      .setDescription('Voce Edge TTS (default: it-IT-GiuseppeMultilingualNeural, maschile)')
      .setRequired(false)
  );

async function execute(interaction) {
  await interaction.deferReply();

  const clip = interaction.options.getAttachment('clip', true);
  const testo = interaction.options.getString('testo', true);
  const voice = interaction.options.getString('voce') ?? undefined;

  if (!clip.contentType?.startsWith('video/')) {
    await interaction.editReply('⚠️ L\'allegato fornito non sembra essere un video.');
    return;
  }

  try {
    await interaction.editReply('🎙️ Genero audio e sottotitoli (gratis, Edge TTS)...');
    const { audioBuffer, srtContent } = await generateSpeechWithSubtitles(testo, { voice });

    await interaction.editReply('🎞️ Unisco audio e sottotitoli al video con ffmpeg...');
    const finalVideoBuffer = await createFinalVideo({
      videoUrl: clip.url,
      audioBuffer,
      srtContent,
    });

    if (finalVideoBuffer.length > MAX_ATTACHMENT_BYTES) {
      await interaction.editReply(
        '⚠️ Il video generato supera i limiti di allegato di Discord (~25MB). ' +
          'Prova con una clip più corta o di risoluzione inferiore.'
      );
      return;
    }

    const attachment = new AttachmentBuilder(finalVideoBuffer, {
      name: `video-${interaction.id}.mp4`,
    });

    await interaction.editReply({ content: '✅ Video pronto!', files: [attachment] });
  } catch (err) {
    console.error('Errore /creavideo:', err);
    const shortMessage = (err.message || String(err)).slice(0, 1500);
    await interaction.editReply(`❌ Si è verificato un errore: ${shortMessage}`);
  }
}

module.exports = { data, execute };
