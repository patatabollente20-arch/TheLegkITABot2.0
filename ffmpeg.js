const { execFile } = require('node:child_process');
const { promisify } = require('node:util');
const { mkdtemp, writeFile, readFile, rm } = require('node:fs/promises');
const { tmpdir } = require('node:os');
const { join } = require('node:path');
const ffmpegStaticPath = require('ffmpeg-static');

const execFileAsync = promisify(execFile);

// Permette di puntare a un ffmpeg di sistema (con supporto libass per i
// sottotitoli) tramite FFMPEG_PATH nel .env, se il binario incluso in
// ffmpeg-static non dovesse supportare il filtro "subtitles".
const ffmpegPath = process.env.FFMPEG_PATH || ffmpegStaticPath;

/**
 * Scarica un file da un URL e lo salva in un percorso locale.
 */
async function downloadToFile(url, destPath) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Impossibile scaricare il file da ${url} (${response.status})`);
  }
  const buffer = Buffer.from(await response.arrayBuffer());
  await writeFile(destPath, buffer);
}

/**
 * Pipeline completa e gratuita, tutta in locale:
 * 1. Unisce la clip video con l'audio generato (sostituendo l'audio originale)
 * 2. Brucia i sottotitoli SRT direttamente nei fotogrammi del video
 *
 * @param {object} params
 * @param {string} params.videoUrl - URL pubblico della clip originale
 * @param {Buffer} params.audioBuffer - audio mp3 generato (voce sintetica)
 * @param {string} params.srtContent - contenuto del file sottotitoli in formato SRT
 * @returns {Promise<Buffer>} buffer del video mp4 finale, con voce e sottotitoli
 */
async function createFinalVideo({ videoUrl, audioBuffer, srtContent }) {
  if (!ffmpegPath) {
    throw new Error(
      'Binario ffmpeg non trovato (pacchetto ffmpeg-static non installato correttamente, o FFMPEG_PATH non valido)'
    );
  }

  const workDir = await mkdtemp(join(tmpdir(), 'legkitabot-video-'));
  const videoInPath = join(workDir, 'input.mp4');
  const audioInPath = join(workDir, 'voice.mp3');
  const srtPath = join(workDir, 'subtitles.srt');
  const mergedPath = join(workDir, 'merged.mp4');
  const outputPath = join(workDir, 'output.mp4');

  try {
    await downloadToFile(videoUrl, videoInPath);
    await writeFile(audioInPath, audioBuffer);
    await writeFile(srtPath, srtContent, 'utf-8');

    // Passo 1: sostituisce/aggiunge la traccia audio, tagliando alla durata più corta
    await execFileAsync(ffmpegPath, [
      '-y',
      '-i', videoInPath,
      '-i', audioInPath,
      '-map', '0:v:0',
      '-map', '1:a:0',
      '-c:v', 'copy',
      '-c:a', 'aac',
      '-shortest',
      mergedPath,
    ]);

    // Passo 2: brucia i sottotitoli nei fotogrammi (richiede ri-codifica video).
    // Eseguito con cwd sulla cartella di lavoro e nome file relativo per
    // evitare il bug del filtro "subtitles" con i percorsi Windows (C:\...).
    const subtitlesFilter = `subtitles=subtitles.srt:force_style='FontName=Arial,Fontsize=22,PrimaryColour=&H00FFFFFF,OutlineColour=&H00000000,BorderStyle=1,Outline=2,Shadow=0,Alignment=2,MarginV=40'`;

    await execFileAsync(
      ffmpegPath,
      ['-y', '-i', 'merged.mp4', '-vf', subtitlesFilter, '-c:a', 'copy', 'output.mp4'],
      { cwd: workDir }
    );

    return await readFile(outputPath);
  } finally {
    await rm(workDir, { recursive: true, force: true }).catch(() => {});
  }
}

module.exports = { createFinalVideo };
