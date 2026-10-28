#!/usr/bin/env python3
"""Klänge dieser Produktion – ausschließlich aus FFmpeg-Generatoren (Sinus/Rauschen, feste Seeds), kein fremdes Material.

  python3 productions/what-if-same-girlfriend/sound.py      → productions/what-if-same-girlfriend/render/sfx/*.wav

Muss vor `node pipeline/run.mjs --production productions/what-if-same-girlfriend` laufen; timeline.json verweist
auf render/sfx/<name>.wav. Nutzt den Generator-Aufruf von tools/sfx_synth.py (bit-identisch bei jedem Lauf).
Alle Klänge: weicher Einsatz 3–15 ms (kein Knacken, aber auch kein verspäteter Akzent), Inhalte überwiegend
unter 5 kHz, damit Akzente nicht als Klick-Kandidaten erscheinen.
"""
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, "..", "..", "tools"))
from sfx_synth import render, SR  # noqa: E402

OUT = os.path.join(HERE, "render", "sfx")


def env(expr):
    return f"volume='{expr}':eval=frame"


def tones(parts, d, lfo=True):
    """parts: [(amp, freq, phase, lfo_hz)] → aevalsrc-Ausdruck mit langsamer Schwebung"""
    terms = []
    for a, f, p, l in parts:
        mod = f"*(0.75+0.25*sin(2*PI*{l}*t))" if lfo else ""
        terms.append(f"{a}*sin(2*PI*{f}*t+{p}){mod}")
    return f"aevalsrc='{' + '.join(terms)}':d={d}:s={SR}"


def stereo(chain):
    return f"{chain},pan=stereo|c0=c0|c1=c0[out]"


SOUNDS = {
    # Spannungsfläche (A-Moll mit kleiner Sekunde), 46 s
    "pad_tension": stereo(
        f"{tones([(0.20, 55, 0, 0.05), (0.16, 110, 1.1, 0.07), (0.12, 130.81, 2.0, 0.09), (0.09, 164.81, 0.4, 0.06), (0.035, 233.08, 2.7, 0.13)], 46)}[a];"
        f"anoisesrc=d=46:c=pink:r={SR}:a=0.035:s=101,lowpass=f=900[b];[a][b]amix=inputs=2:normalize=0,lowpass=f=2400"),
    # helle Schicht, wächst mit dem Chaos (Lautstärke per Automation), 27 s
    "pad_high": stereo(
        f"{tones([(0.08, 659.25, 0, 0.21), (0.06, 880, 1.3, 0.17), (0.045, 987.77, 2.2, 0.27), (0.03, 1318.5, 0.8, 0.31)], 27)},lowpass=f=3500"),
    # Auflösung (A-Dur), 16 s
    "pad_resolve": stereo(
        f"{tones([(0.18, 110, 0, 0.05), (0.13, 138.59, 1.0, 0.07), (0.12, 164.81, 2.0, 0.06), (0.09, 220, 0.6, 0.08), (0.06, 277.18, 1.7, 0.1), (0.04, 329.63, 2.4, 0.12)], 16)},lowpass=f=2600"),
    # Straße: Stadtrauschen, entfernter Verkehr
    "amb_street": stereo(
        f"anoisesrc=d=12:c=brown:r={SR}:a=0.5:s=201,lowpass=f=380,{env('0.7+0.3*sin(2*PI*0.13*t)')}[a];"
        f"anoisesrc=d=12:c=pink:r={SR}:a=0.06:s=202,bandpass=f=900:width_type=o:w=2,{env('0.5+0.5*pow(sin(2*PI*0.07*t),2)')}[b];"
        "[a][b]amix=inputs=2:normalize=0"),
    # Hütte: Wind draußen + Kaminfeuer (weiches Rauschen, keine Knister-Klicks)
    "amb_cabin": stereo(
        f"anoisesrc=d=12:c=pink:r={SR}:a=0.25:s=211,bandpass=f=520:width_type=o:w=1.2,{env('0.5+0.5*pow(sin(2*PI*0.11*t),2)')}[a];"
        f"anoisesrc=d=12:c=brown:r={SR}:a=0.5:s=212,lowpass=f=260,{env('0.8+0.2*sin(2*PI*2.3*t)*sin(2*PI*0.7*t)')}[b];"
        "[a][b]amix=inputs=2:normalize=0"),
    # Steg: Wellen
    "amb_pier": stereo(
        f"anoisesrc=d=12:c=pink:r={SR}:a=0.35:s=221,lowpass=f=1100,{env('0.25+0.75*pow(sin(2*PI*0.16*t+0.3),2)')}[a];"
        f"anoisesrc=d=12:c=white:r={SR}:a=0.02:s=222,lowpass=f=3200,highpass=f=1200[b];"
        "[a][b]amix=inputs=2:normalize=0"),
    # Restaurant: Stimmengemurmel (Formant-Bänder mit Silbenrhythmus) + leises Klirren
    "amb_rest": stereo(
        f"anoisesrc=d=12:c=pink:r={SR}:a=0.5:s=231,bandpass=f=420:width_type=o:w=0.8,{env('0.55+0.45*sin(2*PI*3.7*t)*sin(2*PI*0.9*t+1)')}[a];"
        f"anoisesrc=d=12:c=pink:r={SR}:a=0.4:s=232,bandpass=f=780:width_type=o:w=0.7,{env('0.55+0.45*sin(2*PI*4.6*t+2)*sin(2*PI*0.6*t)')}[b];"
        f"aevalsrc='0.05*sin(2*PI*2093*t)*exp(-9*mod(t,2.3))*min(1,mod(t,2.3)/0.004)+0.04*sin(2*PI*2637*t)*exp(-9*mod(t+1.1,3.1))*min(1,mod(t+1.1,3.1)/0.004)':d=12:s={SR}[c];"
        "[a][b][c]amix=inputs=3:normalize=0"),
    # Wohnung: Raumton + gedämpfte Menge draußen
    "amb_room": stereo(
        f"anoisesrc=d=12:c=brown:r={SR}:a=0.25:s=241,lowpass=f=200[a];"
        f"anoisesrc=d=12:c=pink:r={SR}:a=0.4:s=242,bandpass=f=350:width_type=o:w=1,lowpass=f=600,{env('0.6+0.4*sin(2*PI*1.9*t)*sin(2*PI*0.4*t)')}[b];"
        "[a][b]amix=inputs=2:normalize=0"),
    # Stille-Raumton für die ruhige Phase (nie digital stumm)
    "amb_quiet": stereo(f"anoisesrc=d=12:c=brown:r={SR}:a=0.25:s=251,lowpass=f=180"),
    # Menge (Aufsicht): breites Rauschen der Menge
    "crowd_roar": stereo(
        f"anoisesrc=d=6:c=pink:r={SR}:a=0.6:s=261,bandpass=f=600:width_type=o:w=1.6,{env('0.7+0.3*sin(2*PI*1.3*t)')}[a];"
        f"anoisesrc=d=6:c=pink:r={SR}:a=0.4:s=262,bandpass=f=1300:width_type=o:w=1,{env('0.6+0.4*sin(2*PI*2.7*t+1)')}[b];"
        "[a][b]amix=inputs=2:normalize=0"),
    # Menge auf Augenhöhe (verstummt per Automation mit der Welle)
    "crowd_street": stereo(
        f"anoisesrc=d=6:c=pink:r={SR}:a=0.55:s=271,bandpass=f=520:width_type=o:w=1.4,{env('0.65+0.35*sin(2*PI*3.1*t)*sin(2*PI*0.8*t)')}[a];"
        f"anoisesrc=d=6:c=pink:r={SR}:a=0.3:s=272,bandpass=f=1100:width_type=o:w=1,{env('0.6+0.4*sin(2*PI*4.3*t+2)')}[b];"
        "[a][b]amix=inputs=2:normalize=0"),
    # Whip: Luftzug, Maximum exakt bei 0,3333 s (= Einstellungsgrenze, Start 10 Frames vorher)
    "swish": stereo(
        f"anoisesrc=d=0.6667:c=pink:r={SR}:a=0.9:s=281,highpass=f=250,lowpass=f=2200,lowpass=f=2200,{env('pow(sin(PI*t/0.6667),3)')}"),
    # Tür: dumpfer Anschlag + Holz
    "door": stereo(
        f"aevalsrc='0.7*sin(2*PI*(70*t+20*(1-exp(-12*t))))*exp(-9*t)*min(1,t/0.004)':d=1:s={SR}[a];"
        f"anoisesrc=d=1:c=brown:r={SR}:a=0.5:s=291,lowpass=f=700,{env('exp(-6*t)*min(1,t/0.006)')}[b];"
        "[a][b]amix=inputs=2:normalize=0"),
    # Nachrichten-Ton: zwei Glockentöne (E6, A6), weicher Einsatz 4 ms
    "ping": stereo(
        f"aevalsrc='0.4*min(1,t/0.004)*(sin(2*PI*1318.5*t)*exp(-7*t)+0.7*gte(t,0.11)*sin(2*PI*1760*(t-0.11))*exp(-6*(t-0.11))*min(1,(t-0.11)/0.004))':d=1:s={SR}"),
    # Vibrationsalarm: 170-Hz-Brummen in zwei Stößen
    "buzz": stereo(
        f"aevalsrc='0.5*(sin(2*PI*170*t)+0.3*sin(2*PI*340*t))*(lt(t,0.16)*min(1,t/0.006)*min(1,(0.16-t)/0.01)+gte(t,0.22)*lt(t,0.38)*min(1,(t-0.22)/0.006)*min(1,(0.38-t)/0.01))':d=0.4:s={SR},lowpass=f=1200"),
    # Klangfläche fällt in sich zusammen: Kunststoff-Plättchen, tiefpassgefiltert
    "clatter": stereo(
        "aevalsrc='" + " + ".join(
            f"0.25*{0.9 ** i:.3f}*sin(2*PI*{900 + (i * 137) % 700}*(t-{0.04 * i + 0.012 * (i % 3):.3f}))*exp(-38*(t-{0.04 * i + 0.012 * (i % 3):.3f}))*gte(t,{0.04 * i + 0.012 * (i % 3):.3f})*min(1,(t-{0.04 * i + 0.012 * (i % 3):.3f})/0.003)"
            for i in range(22)) + f"':d=1.4:s={SR}[a];"
        f"aevalsrc='0.6*sin(2*PI*(48*t+10*(1-exp(-8*t))))*exp(-4*t)*min(1,t/0.004)':d=1.4:s={SR}[b];"
        "[a][b]amix=inputs=2:normalize=0,lowpass=f=3000"),
    # Menge erscheint: dumpfer Schwall
    "swell": stereo(
        f"aevalsrc='0.6*sin(2*PI*(40*t))*exp(-1.5*t)*min(1,t/0.008)':d=3:s={SR}[a];"
        f"anoisesrc=d=3:c=brown:r={SR}:a=0.6:s=301,lowpass=f=500,{env('exp(-1.2*t)*min(1,t/0.01)')}[b];"
        "[a][b]amix=inputs=2:normalize=0"),
    # Vorhang: Stoffrascheln (weich)
    "curtain": stereo(
        f"anoisesrc=d=1.1:c=pink:r={SR}:a=0.6:s=311,bandpass=f=1800:width_type=o:w=1.5,{env('pow(sin(PI*min(t,1.0)/1.0),2)*min(1,t/0.01)')}"),
    # Ausschalten: kurzer weicher Druckpunkt + absteigender Ton
    "poweroff": stereo(
        f"aevalsrc='0.5*sin(2*PI*(700*(1-exp(-5*t))/5+70*t))*exp(-3.2*t)*min(1,t/0.004)':d=1.2:s={SR}[a];"
        f"aevalsrc='0.35*sin(2*PI*260*t)*exp(-30*t)*min(1,t/0.003)':d=1.2:s={SR}[b];"
        "[a][b]amix=inputs=2:normalize=0,lowpass=f=2500"),
    # Lichter erlöschen: tiefer Puls
    "whomp": stereo(
        f"aevalsrc='0.9*sin(2*PI*(52*t-6*t*t))*exp(-1.6*t)*min(1,t/0.006)':d=2.6:s={SR}[a];"
        f"anoisesrc=d=2.6:c=brown:r={SR}:a=0.5:s=321,lowpass=f=240,{env('exp(-2*t)*min(1,t/0.008)')}[b];"
        "[a][b]amix=inputs=2:normalize=0"),
    # Pointe: warmer A-Dur-Akkord, schneller Einsatz (12 ms), langes Ausklingen bis Videoende
    "bloom": stereo(
        f"aevalsrc='min(1,t/0.012)*exp(-0.45*t)*(0.22*sin(2*PI*220*t)+0.17*sin(2*PI*277.18*t+1)+0.15*sin(2*PI*329.63*t+2)+0.12*sin(2*PI*440*t+0.5)+0.05*sin(2*PI*554.37*t+1.5))':d=4.8:s={SR},lowpass=f=3000"),
    # Schritt: weicher Absatz auf Stein
    "step": stereo(
        f"aevalsrc='0.6*sin(2*PI*85*t)*exp(-35*t)*min(1,t/0.003)':d=0.25:s={SR}[a];"
        f"anoisesrc=d=0.25:c=pink:r={SR}:a=0.5:s=331,lowpass=f=1400,highpass=f=200,{env('exp(-28*t)*min(1,t/0.003)')}[b];"
        "[a][b]amix=inputs=2:normalize=0"),
}


def flood_graph():
    """Nachrichtenflut 18,8–22,6 s: Glockentöne in immer dichterer Folge (deterministisch)."""
    n = 46
    parts = []
    for i in range(n):
        t0 = 3.75 * (i / n) ** 0.62
        f = [1318.5, 1567.98, 1760, 1174.66][i % 4]
        a = 0.16 + 0.1 * (i / n)
        parts.append(f"{a:.3f}*gte(t,{t0:.4f})*min(1,(t-{t0:.4f})/0.004)*sin(2*PI*{f}*(t-{t0:.4f}))*exp(-9*(t-{t0:.4f}))")
    return stereo(f"aevalsrc='{' + '.join(parts)}':d=3.8:s={SR},lowpass=f=4000")


def main():
    os.makedirs(OUT, exist_ok=True)
    items = dict(SOUNDS)
    items["flood"] = flood_graph()
    for name, graph in items.items():
        render(name, graph, os.path.join(OUT, f"{name}.wav"))
        print(name)


if __name__ == "__main__":
    main()
