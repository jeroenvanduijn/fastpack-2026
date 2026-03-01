// ── Intersection Observer voor reveal animaties
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

// ── Active nav link
const sections = document.querySelectorAll('[id]');
const navLinks = document.querySelectorAll('.nav-option');

const navObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      navLinks.forEach(l => l.classList.remove('active'));
      const link = document.querySelector(`.nav-option[href="#${entry.target.id}"]`);
      if (link) link.classList.add('active');
    }
  });
}, { threshold: 0.3 });

sections.forEach(s => navObserver.observe(s));

// ── SVG Line Elevation Profiles
function renderElevationProfile(containerId, elevations, daySplits, altRange) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const W = 900, H = 160;
  const padL = 42, padR = 12, padT = 20, padB = 28;
  const plotW = W - padL - padR;
  const plotH = H - padT - padB;
  const [minAlt, maxAlt] = altRange;
  const altSpan = maxAlt - minAlt;

  // Convert elevation to points
  const points = elevations.map((alt, i) => {
    const x = padL + (i / (elevations.length - 1)) * plotW;
    const y = padT + plotH - ((alt - minAlt) / altSpan) * plotH;
    return { x, y };
  });

  // Smooth path using catmull-rom → cubic bezier
  function smoothPath(pts) {
    if (pts.length < 2) return '';
    let d = `M ${pts[0].x},${pts[0].y}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[Math.max(i - 1, 0)];
      const p1 = pts[i];
      const p2 = pts[i + 1];
      const p3 = pts[Math.min(i + 2, pts.length - 1)];
      const tension = 0.3;
      const cp1x = p1.x + (p2.x - p0.x) * tension;
      const cp1y = p1.y + (p2.y - p0.y) * tension;
      const cp2x = p2.x - (p3.x - p1.x) * tension;
      const cp2y = p2.y - (p3.y - p1.y) * tension;
      d += ` C ${cp1x},${cp1y} ${cp2x},${cp2y} ${p2.x},${p2.y}`;
    }
    return d;
  }

  const linePath = smoothPath(points);
  const fillPath = linePath + ` L ${points[points.length - 1].x},${padT + plotH} L ${points[0].x},${padT + plotH} Z`;

  // Build SVG
  let svg = `<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">`;

  // Defs: gradient fill
  svg += `<defs>
    <linearGradient id="grad-${containerId}" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="rgba(212,175,55,0.35)"/>
      <stop offset="100%" stop-color="rgba(212,175,55,0.02)"/>
    </linearGradient>
  </defs>`;

  // Y-axis grid lines & labels
  const ySteps = 4;
  for (let i = 0; i <= ySteps; i++) {
    const alt = minAlt + (altSpan / ySteps) * i;
    const y = padT + plotH - (i / ySteps) * plotH;
    svg += `<line x1="${padL}" y1="${y}" x2="${W - padR}" y2="${y}" stroke="rgba(240,235,226,0.08)" stroke-width="1"/>`;
    svg += `<text x="${padL - 4}" y="${y + 3}" fill="rgba(240,235,226,0.35)" font-family="DM Mono, monospace" font-size="9" text-anchor="end">${Math.round(alt)}m</text>`;
  }

  // Fill area
  svg += `<path d="${fillPath}" fill="url(#grad-${containerId})"/>`;

  // Line
  svg += `<path d="${linePath}" fill="none" stroke="#d4af37" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>`;

  // Day separator lines
  daySplits.forEach(split => {
    const x = padL + split.at * plotW;
    svg += `<line x1="${x}" y1="${padT - 2}" x2="${x}" y2="${padT + plotH + 2}" stroke="rgba(240,235,226,0.25)" stroke-width="1" stroke-dasharray="4,3"/>`;
    svg += `<text x="${x}" y="${H - 4}" fill="#d4af37" font-family="DM Mono, monospace" font-size="10" text-anchor="middle" letter-spacing="0.1em">${split.label}</text>`;
  });

  // Start/end altitude markers
  const startAlt = elevations[0];
  const endAlt = elevations[elevations.length - 1];
  svg += `<circle cx="${points[0].x}" cy="${points[0].y}" r="3" fill="#d4af37"/>`;
  svg += `<circle cx="${points[points.length - 1].x}" cy="${points[points.length - 1].y}" r="3" fill="#d4af37"/>`;

  // Peak marker
  let peakIdx = 0;
  elevations.forEach((a, i) => { if (a > elevations[peakIdx]) peakIdx = i; });
  svg += `<circle cx="${points[peakIdx].x}" cy="${points[peakIdx].y}" r="3.5" fill="#e74c3c" stroke="#1a1a17" stroke-width="1.5"/>`;
  svg += `<text x="${points[peakIdx].x}" y="${points[peakIdx].y - 8}" fill="#e74c3c" font-family="DM Mono, monospace" font-size="9" text-anchor="middle">${elevations[peakIdx]}m</text>`;

  svg += `</svg>`;
  container.innerHTML = svg;
}

// ── Tour des Muverans: Fuli (480→1500) | Dag 1 Sorniot→Rambert→Fenestral | Dag 2 Fenestral→Tourche→Pont de Nant | Dag 3 Pont de Nant→Derborence→Sorniot
renderElevationProfile('elev-muverans', [
  // Wo: Fuli 480 → 1500
  480, 600, 750, 900, 1050, 1200, 1350, 1500,
  // Do: Sorniot 1500 → Rambert 2580 → col → Fenestral 2453
  1500, 1700, 1900, 2100, 2300, 2580, 2500, 2453,
  // Vr: Fenestral 2453 → col 2700 → Tourche 2198 → col 2400 → Pont de Nant 1253
  2453, 2550, 2700, 2500, 2198, 2300, 2400, 2000, 1600, 1253,
  // Za: Pont de Nant 1253 → Anzeindaz 2000 → col 2300 → Derborence 1449 → col 2000 → Sorniot 1500
  1253, 1500, 1800, 2000, 2300, 2100, 1449, 1700, 2000, 1800, 1500
], [
  { at: 0, label: 'Wo' },
  { at: 8 / 37, label: 'Do' },
  { at: 16 / 37, label: 'Vr' },
  { at: 26 / 37, label: 'Za' }
], [400, 2800]);

// ── TMB: Fuli | Et.4 Bertone→Peule | Et.5 Peule→Champex | Et.6 Champex→Tré-le-Champ | Et.7 Tré-le-Champ→Les Houches
renderElevationProfile('elev-tmb', [
  // Wo: Fuli 480 → 1500
  480, 700, 950, 1200, 1500,
  // Do: Et.4 Courmayeur 1224 → Bertone 2000 → Bonatti 2025 → Malatra 2930 → La Peule 2071
  1224, 1600, 2000, 2025, 2200, 2600, 2930, 2600, 2071,
  // Vr: Et.5 La Peule 2071 → Grand Col Ferret 2537 → afdaling → Champex 1467
  2071, 2300, 2537, 2300, 2000, 1700, 1467,
  // Za: Et.6 Champex 1467 → Bovine 1987 → Forclaz 1527 → Fen. d'Arpette 2665 → Tré-le-Champ 1417
  1467, 1700, 1987, 1750, 1527, 1800, 2100, 2400, 2665, 2200, 1800, 1417,
  // Zo: Et.7 Tré-le-Champ 1417 → Flégère 1877 → Brévent 2525 → Les Houches 1010
  1417, 1600, 1877, 2100, 2350, 2525, 2200, 1800, 1400, 1010
], [
  { at: 0, label: 'Wo' },
  { at: 5 / 43, label: 'Do' },
  { at: 14 / 43, label: 'Vr' },
  { at: 21 / 43, label: 'Za' },
  { at: 33 / 43, label: 'Zo' }
], [400, 3000]);

// ── Monte Rosa: Fuli | Et.6 Zermatt→Teodulo | Et.7+8 Teodulo→Frachey→Gabiet | Et.9+10 Gabiet→Pastore→Macugnaga | Et.1+2 Macugnaga→Oberto→Saas-Fee
renderElevationProfile('elev-monterosa', [
  // Wo: Fuli 480 → 1500
  480, 700, 950, 1200, 1500,
  // Do: Et.6 Zermatt 1620 → Gandegghütte 3030 → Teodulo 3317
  1620, 2000, 2400, 2800, 3030, 3200, 3317,
  // Vr: Et.7+8 Teodulo 3317 → Breuil 2006 → Col Nana 2775 → Frachey 1612 → Pinter 2250 → Gabiet 2375
  3317, 3000, 2500, 2006, 2200, 2775, 2400, 1612, 1900, 2250, 2375,
  // Za: Et.9+10 Gabiet 2375 → Col d'Olen 2881 → Pastore 1575 → Monte Moro 2868 → Macugnaga 1327
  2375, 2600, 2881, 2500, 1900, 1575, 1800, 2200, 2600, 2868, 2400, 1800, 1327,
  // Zo: Et.1+2 Macugnaga 1327 → Oberto 2796 → Monte Moro 2868 → Saas-Fee 1803
  1327, 1700, 2100, 2500, 2796, 2868, 2500, 2100, 1803
], [
  { at: 0, label: 'Wo' },
  { at: 5 / 46, label: 'Do' },
  { at: 12 / 46, label: 'Vr' },
  { at: 23 / 46, label: 'Za' },
  { at: 36 / 46, label: 'Zo' }
], [400, 3500]);

// ── Alta Via 1: Dag 1+2 Braies→Fanes→Dibona | Dag 3+4 Dibona→Croda→Coldai | Dag 5 Coldai→Carestiato | Dag 6+7 Carestiato→Pian de Fontana→La Pissa
renderElevationProfile('elev-altavia', [
  // Wo: Dag 1+2 Braies 1496 → Seekofel 2327 → Fanes 2060 → Lagazuoi 2752 → Dibona 2083
  1496, 1700, 2000, 2327, 2200, 2060, 2200, 2500, 2752, 2400, 2083,
  // Do: Dag 3+4 Dibona 2083 → Nuvolau 2575 → Croda 2046 → Pelmo pass 2239 → Coldai 2132
  2083, 2300, 2575, 2300, 2046, 2100, 2239, 2132,
  // Vr: Dag 5 Coldai 2132 → Civetta traverse 2200 → Carestiato 1834
  2132, 2200, 2100, 1950, 1834,
  // Za: Dag 6+7 Carestiato 1834 → Col 2100 → Pramperet 1857 → Pian de Fontana 1632 → Cereda 1369 → La Pissa 780
  1834, 2000, 2100, 1857, 1632, 1500, 1369, 1100, 900, 780
], [
  { at: 0, label: 'Wo' },
  { at: 11 / 34, label: 'Do' },
  { at: 19 / 34, label: 'Vr' },
  { at: 24 / 34, label: 'Za' }
], [700, 2900]);

// ── Vote
const votes = { 1: 0, 2: 0, 3: 0, 4: 0 };
function vote(n) {
  votes[n]++;
  document.querySelectorAll('.vote-btn').forEach((btn, i) => {
    btn.style.opacity = votes[i + 1] > 0 ? '1' : '0.5';
  });
  const names = { 1: 'Fuli + Muverans', 2: 'Fuli + Mont Blanc', 3: 'Monte Rosa', 4: 'Alta Via 1' };
  document.getElementById('vote-result').textContent = `Stemmen: ${Object.entries(votes).map(([k, v]) => `Opt.${k}: ${v}`).join(' · ')}`;
}

// ── Smooth nav scroll compensation for sticky nav
document.querySelectorAll('.nav-option').forEach(link => {
  link.addEventListener('click', e => {
    e.preventDefault();
    const target = document.querySelector(link.getAttribute('href'));
    if (target) {
      const offset = document.querySelector('.options-nav').offsetHeight + 20;
      window.scrollTo({ top: target.offsetTop - offset, behavior: 'smooth' });
    }
  });
});
