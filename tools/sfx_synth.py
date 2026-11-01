#!/usr/bin/env python3
"""Erzeugt lizenzfreie Soundeffekte und Klangflächen ausschließlich mit FFmpeg-Generatoren.

Kein fremdes Audiomaterial, keine Lizenzfrage: Alle Klänge entstehen aus Sinus-/Rauschgeneratoren
mit festen Seeds und sind daher bei jedem Aufruf bit-identisch (deterministisch).

  python3 tools/sfx_synth.py --out <verzeichnis> [--only boom,whoosh] [--drone-seconds 80]

Erzeugt 48-kHz-Stereo-WAV (32-bit float). Die Mischung (tools/audio_mix.py) referenziert sie als "gen:<name>".
"""

import argparse
import os
import subprocess
import sys

SR = 48000


def _env(expr):
    """volume-Filter mit zeitabhängiger Hüllkurve (eval=frame, deterministisch)."""
    return f"volume='{expr}':eval=frame"


# name -> (Dauer s, filter_complex mit Ausgang [out])
SOUNDS = {
    # kurzer Luftzug für Whip-Übergänge
    "whoosh": (0.7, (
        f"anoisesrc=d=0.7:c=pink:r={SR}:a=0.9:s=11,lowpass=f=2600,highpass=f=180,"
        f"{_env('pow(sin(PI*t/0.7),2)')},"
        "pan=stereo|c0=c0|c1=c0,"
        f"{_env('1')}[out]")),
    # tiefer Einschlag mit abfallender Tonhöhe
    "boom": (2.6, (
        f"aevalsrc='0.85*sin(2*PI*(42*t+4*(1-exp(-6*t))))*exp(-2.0*t)':d=2.6:s={SR}[a];"
        f"anoisesrc=d=2.6:c=brown:r={SR}:a=0.6:s=21,lowpass=f=320,{_env('exp(-3.2*t)')}[b];"
        "[a][b]amix=inputs=2:normalize=0,pan=stereo|c0=c0|c1=c0[out]")),
    # heller Aufprall/Treffer
    "hit": (0.6, (
        f"anoisesrc=d=0.6:c=white:r={SR}:a=0.7:s=31,bandpass=f=1400:width_type=o:w=1.5,{_env('exp(-9*t)')}[a];"
        f"aevalsrc='0.5*sin(2*PI*110*t)*exp(-7*t)':d=0.6:s={SR}[b];"
        "[a][b]amix=inputs=2:normalize=0,pan=stereo|c0=c0|c1=c0[out]")),
    # ansteigende Spannung (4 s), endet ohne Abriss
    "riser": (4.0, (
        f"aevalsrc='0.35*sin(2*PI*(180*t+60*t*t))*pow(t/4,2)':d=4:s={SR}[a];"
        f"anoisesrc=d=4:c=pink:r={SR}:a=0.5:s=41,highpass=f=800,{_env('pow(t/4,3)')}[b];"
        "[a][b]amix=inputs=2:normalize=0,pan=stereo|c0=c0|c1=c0[out]")),
    # kurzer, schneller Luftzug für harte Schnitte (Tonhöhe steigt, 0,45 s)
    "swoosh": (0.45, (
        f"anoisesrc=d=0.45:c=pink:r={SR}:a=0.9:s=13,highpass=f=300,lowpass=f=5200,"
        f"{_env('pow(sin(PI*pow(t/0.45,0.7)),3)')},"
        "pan=stereo|c0=0.9*c0|c1=0.6*c0[out]")),
    # tiefer Bass-Schlag: Sub-Drop 70→28 Hz + Rauschknall, lange Ausklingzeit (Schlüsselereignis)
    "impact": (3.2, (
        f"aevalsrc='0.95*sin(2*PI*(28*t+42*0.08*(1-exp(-t/0.08))))*exp(-1.1*t)*min(1,t/0.004)':d=3.2:s={SR}[a];"
        f"anoisesrc=d=3.2:c=brown:r={SR}:a=0.8:s=23,lowpass=f=220,{_env('exp(-2.4*t)*min(1,t/0.003)')}[b];"
        f"anoisesrc=d=3.2:c=white:r={SR}:a=0.5:s=29,bandpass=f=2200:width_type=o:w=2,{_env('exp(-18*t)')}[c];"
        "[a][b][c]amix=inputs=3:normalize=0,pan=stereo|c0=c0|c1=c0[out]")),
    # Grollen unter den Folgen (5 s, schwankend, weich ein- und ausgeblendet)
    "rumble": (5.0, (
        f"anoisesrc=d=5:c=brown:r={SR}:a=0.9:s=37,lowpass=f=140,"
        f"{_env('min(1,t/0.4)*min(1,(5-t)/0.8)*(0.75+0.25*sin(2*PI*1.7*t)*sin(2*PI*0.6*t))')}[a];"
        f"aevalsrc='0.35*sin(2*PI*33*t)*min(1,t/0.4)*min(1,(5-t)/0.8)':d=5:s={SR}[b];"
        "[a][b]amix=inputs=2:normalize=0,pan=stereo|c0=c0|c1=c0[out]")),
    # ---- Bibliothek Stil B (Systemüberarbeitung 2026-10-30). Einsatz ohne Vorlauf: Klang beginnt auf dem Frame des
    # Ereignisses (Ausnahme whoosh/riser: build_timeline.mjs legt sie so, dass die Spitze auf dem Schnitt liegt).
    # UI: kurzer, runder Plopp (HUD-Stufe, Gedankenblase, Symbol erscheint)
    "pop": (0.18, (
        f"aevalsrc='0.7*sin(2*PI*(380*t+2600*t*t))*exp(-38*t)*min(1,t/0.002)':d=0.18:s={SR},"
        "pan=stereo|c0=c0|c1=c0[out]")),
    # positiver Glockenton (Erfolg, Lösung, Gewinn)
    "ding": (1.4, (
        f"aevalsrc='(0.45*sin(2*PI*1318.5*t)+0.25*sin(2*PI*1975.5*t+0.4)+0.12*sin(2*PI*2637*t+1.1))*exp(-3.2*t)*min(1,t/0.003)':d=1.4:s={SR},"
        "pan=stereo|c0=c0|c1=c0[out]")),
    # Verlust-Impuls: digitaler Doppel-Ton mit fallender Tonhöhe + tiefer Stoß (HUD-Wert fällt)
    "loss": (1.2, (
        f"aevalsrc='0.42*sin(2*PI*(1320*t-1700*t*t))*exp(-26*t)*lt(t,0.2)"
        f" + 0.30*sin(2*PI*(990*(t-0.07)))*exp(-30*(t-0.07))*gte(t,0.07)*lt(t,0.25)':d=1.2:s={SR}[a];"
        f"aevalsrc='0.9*sin(2*PI*(46*t+5*(1-exp(-9*t))))*exp(-4.2*t)':d=1.2:s={SR}[b];"
        f"anoisesrc=d=1.2:c=white:r={SR}:a=0.5:s=61,bandpass=f=2400:width_type=o:w=1.2,{_env('exp(-60*t)')}[c];"
        "[a][b][c]amix=inputs=3:normalize=0,pan=stereo|c0=c0|c1=c0[out]")),
    # dumpfer Aufprall (Körper/Gegenstand fällt, Tür, Hinsetzen)
    "thud": (0.7, (
        f"aevalsrc='0.95*sin(2*PI*(62*t+18*(1-exp(-25*t))))*exp(-9*t)*min(1,t/0.002)':d=0.7:s={SR}[a];"
        f"anoisesrc=d=0.7:c=brown:r={SR}:a=0.7:s=91,lowpass=f=500,{_env('exp(-16*t)')}[b];"
        "[a][b]amix=inputs=2:normalize=0,pan=stereo|c0=c0|c1=c0[out]")),
    # Splittern/Krachen (Glas, Metall, Unfall)
    "crash": (1.6, (
        f"anoisesrc=d=1.6:c=white:r={SR}:a=0.45:s=93,highpass=f=1800,{_env('exp(-5*t)*(0.6+0.4*sin(2*PI*31*t))')}[a];"
        f"aevalsrc='0.3*sin(2*PI*(3100*t))*exp(-9*t)+0.2*sin(2*PI*4410*t+1)*exp(-11*t)+0.18*sin(2*PI*2230*t+2)*exp(-7*t)':d=1.6:s={SR}[b];"
        f"anoisesrc=d=1.6:c=brown:r={SR}:a=0.5:s=94,lowpass=f=260,{_env('exp(-6*t)')}[c];"
        "[a][b][c]amix=inputs=3:normalize=0,pan=stereo|c0=c0|c1=c0[out]")),
    # elektrisches Knistern (Stromschlag, Kurzschluss, Blitz nah)
    "zap": (0.6, (
        f"anoisesrc=d=0.6:c=white:r={SR}:a=0.8:s=95,bandpass=f=3200:width_type=o:w=2,"
        f"{_env('exp(-6*t)*gt(sin(2*PI*47*t)+sin(2*PI*71*t),0.2)')}[a];"
        f"aevalsrc='0.35*sin(2*PI*100*t)*exp(-5*t)':d=0.6:s={SR}[b];"
        "[a][b]amix=inputs=2:normalize=0,pan=stereo|c0=c0|c1=c0[out]")),
    # aufsteigendes Glitzern (Magie, Aufladen, Wunder)
    "shimmer": (1.6, (
        f"aevalsrc='0.22*(sin(2*PI*(900*t+700*t*t))+0.7*sin(2*PI*(1350*t+1050*t*t)+1)+0.5*sin(2*PI*(1800*t+1400*t*t)+2))"
        f"*min(1,t/0.15)*exp(-1.6*t)*(0.7+0.3*sin(2*PI*14*t))':d=1.6:s={SR},"
        "pan=stereo|c0=c0|c1=0.85*c0[out]")),
    # Handy vibriert (zwei kurze Summstöße)
    "buzz": (0.75, (
        f"aevalsrc='0.55*sin(2*PI*165*t)*(0.6+0.4*sin(2*PI*330*t))*(lt(t,0.28)+gte(t,0.42)*lt(t,0.7))':d=0.75:s={SR},"
        "lowpass=f=900,afade=t=in:d=0.005,pan=stereo|c0=c0|c1=c0[out]")),
    # Strom fällt aus: fallender Ton + Brummen bricht ab (Lichter gehen aus)
    "power_down": (1.8, (
        f"aevalsrc='0.6*sin(2*PI*(220*t-55*t*t))*exp(-1.4*t)+0.25*sin(2*PI*(110*t-27*t*t))*exp(-1.2*t)':d=1.8:s={SR}[a];"
        f"anoisesrc=d=1.8:c=pink:r={SR}:a=0.3:s=96,lowpass=f=700,{_env('exp(-2.5*t)')}[b];"
        "[a][b]amix=inputs=2:normalize=0,pan=stereo|c0=c0|c1=c0[out]")),
    # Aufladen/Erfolg: drei aufsteigende Töne (C-E-G), freundlich
    "charge": (1.1, (
        f"aevalsrc='0.4*sin(2*PI*523.25*t)*exp(-9*t)*lt(t,0.3)"
        f" + 0.4*sin(2*PI*659.25*(t-0.13))*exp(-9*(t-0.13))*gte(t,0.13)*lt(t,0.45)"
        f" + 0.45*sin(2*PI*783.99*(t-0.26))*exp(-4*(t-0.26))*gte(t,0.26)':d=1.1:s={SR},"
        "afade=t=in:d=0.003,pan=stereo|c0=c0|c1=c0[out]")),
    # tiefer, dezenter Ton beim Erscheinen (Countdown, neue Bedrohung)
    "appear": (2.6, (
        f"aevalsrc='(0.5*sin(2*PI*49*t)+0.25*sin(2*PI*98*t+0.6)+0.06*sin(2*PI*392*t+1.2)*sin(PI*t/2.6))"
        f"*min(1,t/0.12)*exp(-1.3*t)':d=2.6:s={SR},pan=stereo|c0=c0|c1=c0[out]")),
    # Herzschlag-artiger Doppelpuls (Anspannung)
    "heartbeat": (0.9, (
        f"aevalsrc='0.8*sin(2*PI*52*t)*exp(-14*t)*min(1,t/0.004)"
        f" + 0.55*sin(2*PI*48*(t-0.24))*exp(-16*(t-0.24))*gte(t,0.24)':d=0.9:s={SR},lowpass=f=300,"
        "pan=stereo|c0=c0|c1=c0[out]")),
    # Atmosphären (Betten, 90 s, weich): Stadt, Regen, Raumton
    "city": (90.0, (
        f"anoisesrc=d=90:c=brown:r={SR}:a=0.5:s=71,lowpass=f=420,{_env('0.8+0.2*sin(2*PI*0.05*t)')}[a];"
        f"anoisesrc=d=90:c=pink:r={SR}:a=0.08:s=72,highpass=f=1800,lowpass=f=6000,{_env('0.7+0.3*sin(2*PI*0.031*t+1)')}[b];"
        f"anoisesrc=d=90:c=pink:r={SR}:a=0.5:s=73,lowpass=f=420[c];"
        "[a][c]join=inputs=2:channel_layout=stereo[ac];"
        "[b]pan=stereo|c0=c0|c1=c0[bb];[ac][bb]amix=inputs=2:normalize=0[out]")),
    "rain": (90.0, (
        f"anoisesrc=d=90:c=pink:r={SR}:a=0.45:s=97,highpass=f=900,lowpass=f=9000,{_env('0.85+0.15*sin(2*PI*0.07*t)')}[a];"
        f"anoisesrc=d=90:c=pink:r={SR}:a=0.45:s=98,highpass=f=900,lowpass=f=9000,{_env('0.85+0.15*sin(2*PI*0.05*t+2)')}[b];"
        f"anoisesrc=d=90:c=brown:r={SR}:a=0.35:s=99,lowpass=f=300[c];"
        "[a][b]join=inputs=2:channel_layout=stereo[ab];[c]pan=stereo|c0=c0|c1=c0[cc];[ab][cc]amix=inputs=2:normalize=0[out]")),
    "room": (90.0, (
        f"anoisesrc=d=90:c=brown:r={SR}:a=0.25:s=101,lowpass=f=250[a];"
        f"anoisesrc=d=90:c=pink:r={SR}:a=0.03:s=102,lowpass=f=3000[b];"
        "[a][b]amix=inputs=2:normalize=0,pan=stereo|c0=c0|c1=c0[out]")),
    # ---- Ergänzt 2026-11-01 (what-if-one-argument-last-goodbye): Auto, Unfall, Familie, Friedhof ----
    # Anlasser + Motor springt an (Boxer-Klang: tiefe Grundfrequenz mit Obertönen, kurzer Gasstoß)
    "engine_start": (2.4, (
        f"anoisesrc=d=2.4:c=brown:r={SR}:a=0.8:s=111,lowpass=f=500,{_env('lt(t,0.55)*(0.55+0.45*sin(2*PI*12*t))')}[a];"
        "aevalsrc='gte(t,0.5)*min(1,(t-0.5)/0.05)*(0.75+0.25*sin(PI*(48*t+gte(t,0.6)*(52*0.9/PI)*(1-cos(PI*min(t-0.6,0.9)/0.9)))))"
        "*(0.5*sin(2*PI*(48*t+gte(t,0.6)*(52*0.9/PI)*(1-cos(PI*min(t-0.6,0.9)/0.9))))"
        "+0.3*sin(4*PI*(48*t+gte(t,0.6)*(52*0.9/PI)*(1-cos(PI*min(t-0.6,0.9)/0.9))))"
        f"+0.18*sin(6*PI*(48*t+gte(t,0.6)*(52*0.9/PI)*(1-cos(PI*min(t-0.6,0.9)/0.9)))))*min(1,(2.4-t)/0.6)':d=2.4:s={SR}[b];"
        "[a][b]amix=inputs=2:normalize=0,lowpass=f=1800,pan=stereo|c0=c0|c1=c0[out]")),
    # Hochdrehen/Beschleunigen (2,8 s, steigende Drehzahl)
    "rev": (2.8, (
        "aevalsrc='min(1,t/0.12)*min(1,(2.8-t)/0.5)*(0.75+0.25*sin(PI*(70*t+28*t*t)))"
        "*(0.45*sin(2*PI*(70*t+28*t*t))+0.3*sin(4*PI*(70*t+28*t*t))+0.2*sin(6*PI*(70*t+28*t*t))+0.1*sin(10*PI*(70*t+28*t*t)))'"
        f":d=2.8:s={SR}[a];"
        f"anoisesrc=d=2.8:c=pink:r={SR}:a=0.25:s=112,bandpass=f=900:width_type=o:w=2,{_env('min(1,t/0.2)*min(1,(2.8-t)/0.5)')}[b];"
        "[a][b]amix=inputs=2:normalize=0,lowpass=f=2600,pan=stereo|c0=c0|c1=c0[out]")),
    # Reifenquietschen (1,6 s): FM-Ton + Bandrauschen
    "screech": (1.6, (
        f"aevalsrc='0.32*sin(2*PI*1150*t+5*sin(2*PI*7*t))*min(1,t/0.05)*sqrt(max(0,1-t/1.6))':d=1.6:s={SR}[a];"
        f"anoisesrc=d=1.6:c=white:r={SR}:a=0.5:s=113,bandpass=f=1900:width_type=o:w=0.6,{_env('min(1,t/0.05)*sqrt(max(0,1-t/1.6))')}[b];"
        "[a][b]amix=inputs=2:normalize=0,pan=stereo|c0=c0|c1=0.85*c0[out]")),
    # Herz steht still: langer, leiser Dauerton, weich ausklingend (stilisiert)
    "flatline": (3.2, (
        f"aevalsrc='0.32*sin(2*PI*880*t)*min(1,t/0.02)*min(1,(3.2-t)/1.6)':d=3.2:s={SR},"
        "pan=stereo|c0=c0|c1=c0[out]")),
    # Papier raschelt (Zeichnung)
    "paper": (0.6, (
        f"anoisesrc=d=0.6:c=white:r={SR}:a=0.5:s=114,highpass=f=1800,lowpass=f=7000,"
        f"{_env('min(1,t/0.01)*exp(-4*t)*(0.35+0.65*gt(sin(2*PI*23*t+3*sin(2*PI*5*t)),0))')},"
        "pan=stereo|c0=c0|c1=0.9*c0[out]")),
    # Schlüsselbund klimpert
    "keys": (0.6, (
        "aevalsrc='0.22*sin(2*PI*3200*t)*exp(-14*t)+0.2*sin(2*PI*4100*(t-0.06))*exp(-16*(t-0.06))*gte(t,0.06)"
        "+0.18*sin(2*PI*2750*(t-0.13))*exp(-15*(t-0.13))*gte(t,0.13)+0.16*sin(2*PI*5200*(t-0.2))*exp(-18*(t-0.2))*gte(t,0.2)"
        f"+0.14*sin(2*PI*3650*(t-0.27))*exp(-18*(t-0.27))*gte(t,0.27)':d=0.6:s={SR},"
        "pan=stereo|c0=c0|c1=c0[out]")),
    # Tür knallt zu (tiefer Schlag + Rahmenklappern)
    "slam": (1.2, (
        f"aevalsrc='0.95*sin(2*PI*(55*t+20*(1-exp(-20*t))))*exp(-7*t)*min(1,t/0.002)':d=1.2:s={SR}[a];"
        f"anoisesrc=d=1.2:c=brown:r={SR}:a=0.8:s=115,lowpass=f=900,{_env('exp(-10*t)')}[b];"
        f"anoisesrc=d=1.2:c=white:r={SR}:a=0.4:s=116,bandpass=f=800:width_type=o:w=1,{_env('exp(-40*t)+0.3*exp(-30*abs(t-0.09))')}[c];"
        "[a][b][c]amix=inputs=3:normalize=0,pan=stereo|c0=c0|c1=c0[out]")),
    # Warnblinker (Klick alle 0,4 s)
    "blinker": (2.4, (
        f"aevalsrc='0.45*sin(2*PI*2300*t)*exp(-160*mod(t,0.4))+0.3*sin(2*PI*1700*(t-0.2))*exp(-160*mod(t+0.2,0.4))*gte(t,0.2)':d=2.4:s={SR},"
        "lowpass=f=5000,pan=stereo|c0=c0|c1=c0[out]")),
    # Sanfter, warmer Glockenakkord (Umarmung, letzte Botschaft)
    "warmth": (3.0, (
        "aevalsrc='(0.28*sin(2*PI*587.33*t)+0.22*sin(2*PI*739.99*t+0.5)+0.2*sin(2*PI*880*t+1.0)+0.08*sin(2*PI*1174.66*t+1.7))"
        f"*min(1,t/0.25)*exp(-0.9*t)':d=3.0:s={SR},"
        "pan=stereo|c0=c0|c1=0.92*c0[out]")),
    # Atmosphären: Wind im Freien (Friedhof), Fahrgeräusch (Reifen + Motorbrummen)
    "wind": (90.0, (
        f"anoisesrc=d=90:c=pink:r={SR}:a=0.95:s=117,highpass=f=120,lowpass=f=900,{_env('0.55+0.45*sin(2*PI*0.13*t)*sin(2*PI*0.07*t+1)')}[a];"
        f"anoisesrc=d=90:c=pink:r={SR}:a=0.95:s=118,highpass=f=120,lowpass=f=900,{_env('0.55+0.45*sin(2*PI*0.11*t+2)*sin(2*PI*0.05*t)')}[b];"
        "[a][b]join=inputs=2:channel_layout=stereo[out]")),
    "road": (90.0, (
        f"anoisesrc=d=90:c=brown:r={SR}:a=0.7:s=119,lowpass=f=380[a];"
        f"aevalsrc='0.22*sin(2*PI*68*t)*(0.8+0.2*sin(2*PI*34*t))+0.12*sin(2*PI*136*t)':d=90:s={SR}[b];"
        "[a][b]amix=inputs=2:normalize=0,pan=stereo|c0=c0|c1=c0[out]")),
    # Synchron-Marker: 3-kHz-Ton, 80 ms, weiche Flanken (5 ms)
    "tick": (0.08, (
        f"aevalsrc='0.6*sin(2*PI*3000*t)*min(1,min(t/0.005,(0.08-t)/0.005))':d=0.08:s={SR},"
        "pan=stereo|c0=c0|c1=c0[out]")),
}


def drone_graph(seconds):
    """Klangfläche: tiefer Akkord (A-Moll) mit langsamer Schwebung, leichtes Rauschen als Luft."""
    d = seconds
    tones = " + ".join(
        f"{a}*sin(2*PI*{f}*t+{p})*(0.8+0.2*sin(2*PI*{lfo}*t))"
        for a, f, p, lfo in [(0.22, 55, 0.0, 0.07), (0.18, 110, 1.3, 0.05), (0.12, 164.81, 2.1, 0.09),
                             (0.09, 220, 0.7, 0.04), (0.05, 261.63, 2.9, 0.11)]
    )
    return (f"aevalsrc='{tones}':d={d}:s={SR}[a];"
            f"anoisesrc=d={d}:c=pink:r={SR}:a=0.05:s=51,lowpass=f=1200[b];"
            "[a][b]amix=inputs=2:normalize=0,pan=stereo|c0=c0|c1=c0[out]")


def render(name, graph, path):
    cmd = ["ffmpeg", "-v", "error", "-y", "-filter_complex", graph, "-map", "[out]",
           "-ar", str(SR), "-ac", "2", "-c:a", "pcm_f32le", "-fflags", "+bitexact", "-flags:a", "+bitexact", path]
    p = subprocess.run(cmd, capture_output=True, text=True)
    if p.returncode != 0:
        raise SystemExit(f"{name}: ffmpeg-Fehler: {p.stderr[-800:]}")


def synth(out, only=None, drone_seconds=80.0):
    os.makedirs(out, exist_ok=True)
    made = {}
    items = dict(SOUNDS)
    for name, (dur, graph) in items.items():
        if only and name not in only:
            continue
        path = os.path.join(out, f"{name}.wav")
        render(name, graph, path)
        made[name] = path
    if not only or "drone" in only:
        path = os.path.join(out, "drone.wav")
        render("drone", drone_graph(drone_seconds), path)
        made["drone"] = path
    return made


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--out", required=True)
    ap.add_argument("--only", help="Komma-getrennte Namen")
    ap.add_argument("--drone-seconds", type=float, default=80.0)
    a = ap.parse_args()
    made = synth(a.out, set(a.only.split(",")) if a.only else None, a.drone_seconds)
    for k, v in made.items():
        print(f"{k}: {v}")


if __name__ == "__main__":
    sys.exit(main())
