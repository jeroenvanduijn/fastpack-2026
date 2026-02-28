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

// ── Fake elevation profiles
function generateElevation(seed, count) {
  const bars = [];
  let h = 30 + (seed * 7) % 30;
  for (let i = 0; i < count; i++) {
    h += (Math.sin(i * 0.4 + seed) * 15);
    h = Math.max(10, Math.min(95, h));
    bars.push(h);
  }
  return bars;
}

[1, 2, 3, 4].forEach(n => {
  const el = document.getElementById('elev' + n);
  if (!el) return;

  let heights = [];
  if (n === 2) {
    // Realistic TMB Profile (Etappes 4-7)
    heights = [
      50, 55, 62, 70, 76, 70, 62, 55, 52, 50, // E4
      48, 45, 42, 38, 35, 32, 28, 25, 24, 26, // E5 
      28, 32, 40, 55, 70, 85, 75, 60, 45, 30, // E6 fenetre d'arpette
      35, 45, 55, 65, 60, 50, 40, 35, 32, 30, // E6 col de balme
      35, 45, 55, 68, 78, 85, 88, 85, 75, 65, // E7 brevent
      55, 45, 35, 25, 20, 15, 12, 10, 10, 10  // E7 finish
    ];
  } else {
    heights = generateElevation(n * 3.7, 60);
  }

  heights.forEach(h => {
    const bar = document.createElement('div');
    bar.className = 'elevation-bar';
    bar.style.height = h + '%';
    el.appendChild(bar);
  });
});

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
