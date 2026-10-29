#!/usr/bin/env node
// Endkodierung: verlustfreie Teilstücke + mix.wav → final.mp4 (einziger verlustbehafteter Schritt).
//
//   node pipeline/encode.mjs --production productions/<slug> [--out <render-dir>]
//
// Ausgabe nach Style-Guide 10.1: 1080×1920, fps aus timeline.json (Standard 30) CFR, H.264 High, yuv420p, BT.709, CRF 16,
// AAC-LC 48 kHz Stereo 256 kbit/s, +faststart. Danach Selbstkontrolle mit ffprobe.
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { ROOT } from './server.mjs';
import { countFrames } from './render_frames.mjs';

function probe(file) {
  return JSON.parse(execFileSync('ffprobe', ['-v', 'error', '-show_streams', '-show_format', '-count_packets', '-of', 'json', file]).toString());
}

export function encode({ production, out }) {
  const prodDir = path.resolve(ROOT, production);
  const tl = JSON.parse(fs.readFileSync(path.join(prodDir, 'timeline.json'), 'utf8'));
  const fps = tl.fps || 30;
  const total = Math.round(tl.duration * fps);
  const renderDir = path.resolve(out || path.join(prodDir, 'render'));
  const chunkDir = path.join(renderDir, 'chunks');
  const audio = path.join(renderDir, 'audio', 'mix.wav');
  if (!fs.existsSync(audio)) throw new Error(`Tonspur fehlt: ${audio} (zuerst tools/audio_mix.py)`);
  const chunks = fs.readdirSync(chunkDir).filter((f) => /^c\d{4}\.mkv$/.test(f)).sort();
  let sum = 0;
  for (const c of chunks) sum += countFrames(path.join(chunkDir, c));
  if (sum !== total) throw new Error(`Teilstücke enthalten ${sum} Frames, erwartet ${total} – Render unvollständig`);
  const list = path.join(renderDir, 'chunks.ffconcat');
  fs.writeFileSync(list, 'ffconcat version 1.0\n' + chunks.map((c) => `file 'chunks/${c}'`).join('\n') + '\n');
  const final = path.join(renderDir, 'final.mp4');
  execFileSync('ffmpeg', ['-v', 'error', '-y', '-f', 'concat', '-safe', '0', '-i', list, '-i', audio,
    '-map', '0:v:0', '-map', '1:a:0',
    '-vf', 'scale=in_range=full:out_range=tv:out_color_matrix=bt709:flags=accurate_rnd+full_chroma_int,format=yuv420p',
    '-c:v', 'libx264', '-profile:v', 'high', '-preset', 'slow', '-crf', '16', '-g', String(2 * fps),
    '-colorspace', 'bt709', '-color_primaries', 'bt709', '-color_trc', 'bt709', '-color_range', 'tv',
    '-r', String(fps), '-fps_mode', 'cfr',
    '-c:a', 'aac', '-b:a', '256k', '-ar', '48000', '-ac', '2',
    '-movflags', '+faststart', final], { stdio: ['ignore', 'inherit', 'inherit'] });

  // Selbstkontrolle
  const p = probe(final);
  const v = p.streams.find((s) => s.codec_type === 'video');
  const a = p.streams.find((s) => s.codec_type === 'audio');
  const problems = [];
  if (Number(v.nb_read_packets) !== total) problems.push(`Video hat ${v.nb_read_packets} Frames statt ${total}`);
  if (v.r_frame_rate !== `${fps}/1` || v.avg_frame_rate !== `${fps}/1`) problems.push(`Bildrate ${v.r_frame_rate}/${v.avg_frame_rate}`);
  if (v.width !== 1080 || v.height !== 1920) problems.push(`Auflösung ${v.width}x${v.height}`);
  if (v.pix_fmt !== 'yuv420p' || v.profile !== 'High') problems.push(`Format ${v.profile} ${v.pix_fmt}`);
  if (Math.abs(Number(a.duration) - Number(v.duration)) > 0.1) problems.push(`A/V-Länge ${a.duration} vs ${v.duration}`);
  if (Math.abs(Number(a.start_time)) > 0.02 || Math.abs(Number(v.start_time)) > 0.02) problems.push(`Startzeiten ${a.start_time}/${v.start_time}`);
  if (problems.length) throw new Error(`final.mp4 fehlerhaft: ${problems.join('; ')}`);
  return { final, frames: total, video_duration: Number(v.duration), audio_duration: Number(a.duration), size_mb: Number(p.format.size) / 1e6 };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const args = process.argv.slice(2);
  const get = (k) => (args.includes(k) ? args[args.indexOf(k) + 1] : undefined);
  try {
    const r = encode({ production: get('--production'), out: get('--out') });
    console.log(`final.mp4: ${r.frames} Frames, Video ${r.video_duration} s, Audio ${r.audio_duration} s, ${r.size_mb.toFixed(1)} MB`);
  } catch (e) {
    console.error(String(e.stack || e));
    process.exit(1);
  }
}
