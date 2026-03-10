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

// ── Alta Via 1: South → North
// Dag 1: Pramperet/Vazzoler ~1800 → Tissi 2262 → Coldai 2132
// Dag 2: Coldai 2132 → afdaling → Città di Fiume 1918
// Dag 3: Città di Fiume 1918 → stijging → rotsformaties → afdaling Cortina → Dibona 2083
// Dag 4: Dibona 2083 → Cinque Torri → Lagazuoi 2752 → Fanes-plateau → Lavarella 2042
// Dag 5: Lavarella 2042 → Fanes → Pederü → Braies 1496
renderElevationProfile('elev-altavia', [
  // Dag 1: Start (~1800) → Tissi (2262) → Coldai (2132)
  1800, 1900, 2050, 2200, 2262, 2200, 2132,
  // Dag 2: Coldai (2132) → daling → Città di Fiume (1918)
  2132, 2050, 1980, 1950, 1918,
  // Dag 3: Città di Fiume (1918) → stijging → rotsformaties → afdaling → Dibona (2083)
  1918, 2000, 2150, 2300, 2400, 2300, 2100, 1900, 1800, 2000, 2083,
  // Dag 4: Dibona (2083) → Cinque Torri → Lagazuoi (2752) → afdaling → Lavarella (2042)
  2083, 2200, 2350, 2500, 2752, 2600, 2400, 2200, 2042,
  // Dag 5: Lavarella (2042) → Fanes → daling → Braies (1496)
  2042, 2060, 2000, 1900, 1750, 1600, 1496
], [
  { at: 0, label: 'Ma' },
  { at: 7 / 39, label: 'Di' },
  { at: 12 / 39, label: 'Wo' },
  { at: 23 / 39, label: 'Do' },
  { at: 32 / 39, label: 'Vr' }
], [1300, 2900]);
