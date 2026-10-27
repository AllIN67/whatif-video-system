// Stufe 7: Gesamtablauf auf einem 3-s-Fixture – Render → Mix → Encode → QA → Bildstreifen, plus A/V-Sync.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { run } from '../pipeline/run.mjs';
import { ROOT } from '../pipeline/server.mjs';

const FIX = 'tests/fixtures/text';

test('Pipeline erzeugt vollständige, spezifikationsgerechte MP4 und prüft sie', { timeout: 900000 }, async () => {
  const dir = path.join(ROOT, FIX);
  try {
    const log = await run({ production: FIX, skipValidate: true, qaIgnoreLength: true });
    const final = path.join(dir, 'render', 'final.mp4');
    assert.ok(fs.existsSync(final));
    const v = JSON.parse(execFileSync('ffprobe', ['-v', 'error', '-select_streams', 'v:0', '-count_packets', '-show_entries',
      'stream=width,height,r_frame_rate,avg_frame_rate,nb_read_packets,pix_fmt,profile,color_space,color_primaries,color_transfer', '-of', 'json', final]).toString()).streams[0];
    assert.equal(Number(v.nb_read_packets), 90);
    assert.equal(v.r_frame_rate, '30/1');
    assert.equal(v.avg_frame_rate, '30/1');
    assert.equal(`${v.width}x${v.height}`, '1080x1920');
    assert.equal(v.pix_fmt, 'yuv420p');
    assert.equal(v.color_space, 'bt709');
    const report = JSON.parse(fs.readFileSync(path.join(dir, 'qa', 'report.json'), 'utf8'));
    assert.deepEqual(report.fails, [], `QA-FAIL: ${JSON.stringify(report.fails)}`);
    assert.ok(['PASS', 'REVIEW'].includes(log.qa_status));
    assert.ok(fs.readdirSync(path.join(dir, 'qa', 'strips')).length > 0);
    const sync = JSON.parse(execFileSync('python3', ['tools/av_sync.py', final, '--json'], { cwd: ROOT }).toString());
    assert.equal(sync.markers, 2, JSON.stringify(sync));
    assert.ok(sync.ok, `A/V-Versatz außerhalb ±1 Frame: ${JSON.stringify(sync.pairs)}`);
    const runLog = JSON.parse(fs.readFileSync(path.join(dir, 'render', 'run_log.json'), 'utf8'));
    assert.ok(runLog.git_commit);
    assert.equal(runLog.steps.length, 5);
  } finally {
    fs.rmSync(path.join(dir, 'render'), { recursive: true, force: true });
    fs.rmSync(path.join(dir, 'qa'), { recursive: true, force: true });
  }
});
