// Zugriff der Szene auf Beats und Ereignisse aus timeline.json (erzeugt von tools/build_timeline.mjs aus beats.json).
// Eine Zeitquelle für Bild, Ton und HUD: Die Szene animiert auf ev('car_hit'), der Mix setzt den Klang auf
// dieselbe Zeit, der HUD blinkt auf derselben Zeit. Keine Zeiten doppelt in scene.js eintragen.
//
//   const B = beatClock(timeline);
//   B.beat('cafe')            → { id, from, to, place }
//   B.local(t, 'cafe')        → Sekunden seit Beginn des Beats (negativ davor)
//   B.ev('outlet_taken')      → absolute Zeit des Ereignisses (wirft, wenn unbekannt)
//   B.since(t, 'outlet_taken')→ t − Ereigniszeit
//   B.active(t)               → aktueller Beat
export function beatClock(timeline) {
  const beats = timeline.beats || [];
  if (!beats.length) throw new Error('beatClock: timeline.beats fehlt (timeline mit tools/build_timeline.mjs erzeugen)');
  const byId = new Map(beats.map((b) => [b.id, b]));
  const evs = new Map((timeline.events || []).filter((e) => e.id).map((e) => [e.id, e.t]));
  const beat = (id) => {
    const b = byId.get(id);
    if (!b) throw new Error(`Beat "${id}" unbekannt`);
    return b;
  };
  const ev = (id) => {
    if (!evs.has(id)) throw new Error(`Ereignis "${id}" unbekannt`);
    return evs.get(id);
  };
  return {
    beats,
    beat,
    ev,
    local: (t, id) => t - beat(id).from,
    since: (t, id) => t - ev(id),
    active(t) {
      let cur = beats[0];
      for (const b of beats) if (t >= b.from) cur = b;
      return cur;
    },
  };
}
