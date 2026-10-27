#!/usr/bin/env python3
"""Fasst die report.json-Dateien aller Referenzen zu references/analysis/MEASUREMENTS.md zusammen.

Aufruf: python3 tools/summarize_references.py
"""
import glob
import json
import os

ROOT = os.path.join(os.path.dirname(__file__), "..", "references", "analysis")


def main():
    rows, prof = [], []
    for p in sorted(glob.glob(os.path.join(ROOT, "R*", "report.json"))):
        r = json.load(open(p))
        rid = os.path.basename(os.path.dirname(p))
        pv, v, a = r["probe"]["video"], r["video"], r["audio"]
        s = v["shot_stats"]
        rows.append(
            f"| {rid} | {r['probe']['duration']:.1f} | {pv['width']}×{pv['height']} | {pv['codec']} | "
            f"{pv['avg_frame_rate']:.0f} | {v['cut_count']} | {v['motion_transition_count']} | "
            f"{s['count']} | {s['shot_changes_per_10s']} | {s['median_s']} | {v['first_shot_change_s']} | "
            f"{a.get('integrated_lufs')} | {a.get('lra_lu')} | {a.get('true_peak_dbtp')} | "
            f"{len(a['silences'])} | {v['duplicate_ratio_in_motion']:.1%} | {len(v['isolated_duplicate_frames'])} | "
            f"{'ja' if v.get('letterbox_crop') else 'nein'} |")
        prof.append(f"- **{rid}**: " + " ".join(
            f"{t}:{'–' if x is None else round(x)}" for t, x in a.get("short_term_lufs_per_s", [])[::2]))
    out = ["# Messwerte der Referenzvideos", "",
           "Automatisch erzeugt mit `tools/video_qa.py --mode reference` und `tools/summarize_references.py`.",
           "Alle Werte beziehen sich auf die **heruntergeladenen Dateien** (Download-Dienst, re-encodiert), "
           "nicht auf die Originaluploads der Ersteller.", "",
           "**Wichtig zur Interpretation:** „Segmente“ = harte Schnitte + erkannte Bewegungsübergänge. "
           "Bei Zeitraffer mit Tag/Nacht-Wechsel (R04), Weißblitz-Übergängen (R09) oder Abblend-Übergängen (R07) "
           "weicht die Zählung von der visuell gezählten Einstellungszahl ab. Kennzahlen nur zusammen mit "
           "der Sichtprüfung in REFERENCE_ANALYSIS.md verwenden.", "",
           "| ID | Dauer s | Auflösung | Codec | fps | harte Schnitte | Bewegungs-Übergänge | Segmente | "
           "Wechsel/10 s | Median-Segment s | erster Wechsel s | LUFS int. | LRA LU | True Peak dBTP | "
           "Stillen ≥0,4 s | Doppelbild-Anteil | isolierte Doppelbilder | Letterbox |",
           "|" + "---|" * 18] + rows + [
           "", "## Lautheitsverlauf (Short-Term-LUFS, 3-s-Fenster, Stützstelle alle 2 s)", "",
           "Format `Sekunde:LUFS`, `–` = Stille (< −70 LUFS).", ""] + prof
    with open(os.path.join(ROOT, "MEASUREMENTS.md"), "w") as fh:
        fh.write("\n".join(out) + "\n")
    print("geschrieben:", os.path.join(ROOT, "MEASUREMENTS.md"))


if __name__ == "__main__":
    main()
