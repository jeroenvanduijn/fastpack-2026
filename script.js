// ── Intersection Observer voor reveal animaties
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

// ── SVG Line Elevation Profiles
function renderElevationProfile(containerId, elevations, daySplits, altRange) {
  const container = document.getElementById(containerId);
  if (!container) return;
  const W = 1000, H = 180, PAD = 30;
  const [minAlt, maxAlt] = altRange;

  function x(i) { return PAD + (i / (elevations.length - 1)) * (W - 2 * PAD); }
  function y(alt) { return H - PAD - ((alt - minAlt) / (maxAlt - minAlt)) * (H - 2 * PAD); }

  const pts = elevations.map((alt, i) => [x(i), y(alt)]);

  // Smooth path using catmull-rom → cubic bezier
  function smoothPath(pts) {
    if (pts.length < 2) return '';
    let d = `M${pts[0][0]},${pts[0][1]}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[Math.max(i - 1, 0)];
      const p1 = pts[i];
      const p2 = pts[i + 1];
      const p3 = pts[Math.min(i + 2, pts.length - 1)];
      const cp1x = p1[0] + (p2[0] - p0[0]) / 6;
      const cp1y = p1[1] + (p2[1] - p0[1]) / 6;
      const cp2x = p2[0] - (p3[0] - p1[0]) / 6;
      const cp2y = p2[1] - (p3[1] - p1[1]) / 6;
      d += ` C${cp1x},${cp1y} ${cp2x},${cp2y} ${p2[0]},${p2[1]}`;
    }
    return d;
  }

  const linePath = smoothPath(pts);
  const fillPath = linePath + ` L${pts[pts.length - 1][0]},${H - PAD} L${pts[0][0]},${H - PAD} Z`;

  let svg = `<svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">`;
  svg += `<defs><linearGradient id="grad-${containerId}" x1="0" y1="0" x2="0" y2="1">`;
  svg += `<stop offset="0%" stop-color="#c9a84c" stop-opacity="0.3"/>`;
  svg += `<stop offset="100%" stop-color="#c9a84c" stop-opacity="0.02"/>`;
  svg += `</linearGradient></defs>`;
  svg += `<path d="${fillPath}" fill="url(#grad-${containerId})"/>`;
  svg += `<path d="${linePath}" fill="none" stroke="#c9a84c" stroke-width="2"/>`;

  // Day split lines + labels
  daySplits.forEach(split => {
    const sx = PAD + split.at * (W - 2 * PAD);
    svg += `<line x1="${sx}" y1="${PAD - 10}" x2="${sx}" y2="${H - PAD}" stroke="rgba(240,235,226,0.15)" stroke-width="1" stroke-dasharray="4,4"/>`;
    svg += `<text x="${sx}" y="${PAD - 14}" fill="#c9a84c" font-family="'DM Mono',monospace" font-size="11" text-anchor="middle">${split.label}</text>`;
  });

  // Alt axis labels
  const steps = 4;
  for (let i = 0; i <= steps; i++) {
    const alt = minAlt + (maxAlt - minAlt) * (i / steps);
    const yy = y(alt);
    svg += `<text x="${PAD - 6}" y="${yy + 3}" fill="rgba(240,235,226,0.3)" font-family="'DM Mono',monospace" font-size="9" text-anchor="end">${Math.round(alt)}</text>`;
    svg += `<line x1="${PAD}" y1="${yy}" x2="${W - PAD}" y2="${yy}" stroke="rgba(240,235,226,0.05)" stroke-width="1"/>`;
  }

  svg += `</svg>`;
  container.innerHTML = svg;
}

// ── Alta Via 1: South → North (~100 km)
// Dag 1: Pramperet 1857 → Vazzoler 1714 → Tissi 2262 → Coldai 2132  (23 km)
// Dag 2: Coldai 2132 → afdaling → Città di Fiume 1918  (13 km)
// Dag 3: Città di Fiume 1918 → rotsformaties → Cortina area → Dibona 2083  (26 km)
// Dag 4: Dibona 2083 → Cinque Torri → Lagazuoi 2752 → Fanes → Lavarella 2042  (18 km)
// Dag 5: Lavarella 2042 → Fanes → Pederü → Braies 1496  (20 km)

// Overall profile
renderElevationProfile('elev-altavia', [
  // Dag 1: Pramperet (1857) → door dal → Vazzoler (1714) → stijging → Tissi (2262) → Coldai (2132)
  1857, 1800, 1750, 1714, 1750, 1850, 2000, 2150, 2262, 2200, 2132,
  // Dag 2: Coldai (2132) → geleidelijk dalen → Città di Fiume (1918)
  2132, 2080, 2020, 1970, 1918,
  // Dag 3: Città di Fiume (1918) → op en neer → rotsformaties → Dibona (2083)
  1918, 2000, 2150, 2300, 2400, 2300, 2100, 1900, 1800, 2000, 2083,
  // Dag 4: Dibona (2083) → Cinque Torri → Lagazuoi (2752) → afdaling → Lavarella (2042)
  2083, 2200, 2350, 2500, 2752, 2600, 2400, 2200, 2042,
  // Dag 5: Lavarella (2042) → Fanes → daling → Braies (1496)
  2042, 2060, 2000, 1900, 1750, 1600, 1496
], [
  { at: 0, label: 'Ma' },
  { at: 11 / 42, label: 'Di' },
  { at: 16 / 42, label: 'Wo' },
  { at: 27 / 42, label: 'Do' },
  { at: 36 / 42, label: 'Vr' }
], [1300, 2900]);

// ── Per-dag elevation profiles

// Dag 1: Pramperet → Vazzoler → Tissi → Coldai (23 km, 800m stijging, 300m daling)
renderElevationProfile('elev-dag1', [
  1857, 1830, 1800, 1770, 1740, 1714, 1730, 1780, 1850, 1920, 2000, 2080, 2150, 2220, 2262, 2240, 2200, 2170, 2132
], [], [1600, 2400]);

// Dag 2: Coldai → Città di Fiume (13 km, 300m stijging, 700m daling)
renderElevationProfile('elev-dag2', [
  2132, 2150, 2180, 2160, 2120, 2080, 2040, 2000, 1980, 1960, 1940, 1918
], [], [1800, 2300]);

// Dag 3: Città di Fiume → Dibona (26 km, 900m stijging, 1100m daling)
renderElevationProfile('elev-dag3', [
  1918, 1960, 2020, 2100, 2200, 2300, 2400, 2350, 2250, 2150, 2050, 1950, 1850, 1780, 1750, 1800, 1900, 2000, 2083
], [], [1600, 2500]);

// Dag 4: Dibona → Cinque Torri → Lagazuoi → Lavarella (18 km, 900m stijging, 700m daling)
renderElevationProfile('elev-dag4', [
  2083, 2120, 2180, 2250, 2350, 2450, 2550, 2650, 2752, 2700, 2600, 2500, 2400, 2300, 2200, 2100, 2042
], [], [1900, 2900]);

// Dag 5: Lavarella → Fanes → Pederü → Braies (20 km, 400m stijging, 900m daling)
renderElevationProfile('elev-dag5', [
  2042, 2060, 2080, 2060, 2020, 1980, 1940, 1900, 1850, 1800, 1750, 1700, 1650, 1600, 1550, 1496
], [], [1400, 2200]);

