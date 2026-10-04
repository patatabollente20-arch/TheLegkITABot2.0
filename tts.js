const { EdgeTTS, createSRT } = require('edge-tts-universal');

/**
 * Genera audio (mp3) e sottotitoli (SRT) a partire da un testo, usando il
 * servizio gratuito "Leggi ad alta voce" di Microsoft Edge (nessuna chiave
 * API richiesta). I sottotitoli sono generati dagli stessi "confini di
 * parola" usati per produrre l'audio, quindi sono sempre esatti al 100%
 * rispetto al testo scritto (non è una trascrizione automatica).
 *
 * Voci italiane comuni: "it-IT-DiegoNeural" (maschile),
 * "it-IT-GiuseppeMultilingualNeural" (maschile), "it-IT-ElsaNeural" (femminile),
 * "it-IT-IsabellaNeural" (femminile).
 *
 * @param {string} text - Il testo da narrare
 * @param {object} opts
 * @param {string} [opts.voice] - Nome voce Edge TTS (default: it-IT-GiuseppeMultilingualNeural)
 * @param {string} [opts.rate] - Velocità, es. '+0%', '-10%', '+20%'
 * @returns {Promise<{audioBuffer: Buffer, srtContent: string}>}
 */
async function generateSpeechWithSubtitles(text, opts = {}) {
  const voice = opts.voice || process.env.TTS_VOICE || 'it-IT-GiuseppeMultilingualNeural';
  const rate = opts.rate || process.env.TTS_RATE || '+0%';

  const tts = new EdgeTTS(text, voice, {
    rate,
    volume: '+0%',
    pitch: '+0Hz',
  });

  const result = await tts.synthesize();
  const audioBuffer = Buffer.from(await result.audio.arrayBuffer());
  const srtContent = createSRT(result.subtitle);

  return { audioBuffer, srtContent };
}

module.exports = { generateSpeechWithSubtitles };
