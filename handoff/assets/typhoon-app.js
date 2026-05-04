/* Typhoon — render layer.
   All renderers read from window.TYPHOON_DATA, sort by sortOrder, filter by visibility.
   Drop-in replacement target: a real backend / CMS feed of the same shape. */

(function () {
  const D = window.TYPHOON_DATA;
  if (!D) { console.warn('TYPHOON_DATA missing'); return; }

  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

  const visible = (arr) => arr
    .filter(x => x.visibility !== 'hidden')
    .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));

  const esc = (s) => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  // -------- Waveform --------
  function buildWaveform(el, opts = {}) {
    const seed = (opts.seed || 'wave').split('').reduce((a, c) => a + c.charCodeAt(0), 0);
    const rand = (i) => {
      const x = Math.sin(seed * 9.7 + i * 1.31) * 10000;
      return x - Math.floor(x);
    };
    const bars = opts.bars || 64;
    el.innerHTML = '';
    for (let i = 0; i < bars; i++) {
      const b = document.createElement('span');
      b.className = 'wave-bar';
      const r = rand(i);
      const h = 6 + Math.pow(r, 1.6) * 26;
      b.style.height = h + 'px';
      el.appendChild(b);
    }
  }

  $$('[data-waveform]').forEach(el => buildWaveform(el, { seed: el.dataset.seed, bars: el.dataset.bars ? +el.dataset.bars : 64 }));

  // -------- Audio Player (single song, demo mode) --------
  function initPlayer() {
    const card = $('#hero-player');
    if (!card) return;
    const playBtn = card.querySelector('[data-action=play]');
    if (!playBtn) return;
    const playIcon = playBtn.querySelector('[data-icon=play]');
    const pauseIcon = playBtn.querySelector('[data-icon=pause]');
    const wave = card.querySelector('[data-waveform]');
    const cur = card.querySelector('[data-current]');
    const dur = card.querySelector('[data-duration]');

    const total = D.featuredSong.durationSec || 252;
    if (dur) dur.textContent = D.featuredSong.duration;

    let playing = false; let pos = 0; let raf = 0; let last = 0;
    const bars = wave ? Array.from(wave.querySelectorAll('.wave-bar')) : [];

    function paint() {
      const ratio = pos / total;
      bars.forEach((b, i) => b.classList.toggle('played', i / bars.length <= ratio));
      if (cur) cur.textContent = formatTime(pos);
    }
    function tick(t) {
      if (!playing) return;
      if (last) pos += (t - last) / 1000;
      last = t;
      if (pos >= total) { pos = 0; playing = false; toggleUI(); paint(); return; }
      paint();
      raf = requestAnimationFrame(tick);
    }
    function toggleUI() {
      if (playIcon) playIcon.style.display = playing ? 'none' : '';
      if (pauseIcon) pauseIcon.style.display = playing ? '' : 'none';
    }
    playBtn.addEventListener('click', () => {
      playing = !playing; last = 0; toggleUI();
      if (playing) raf = requestAnimationFrame(tick);
      else cancelAnimationFrame(raf);
    });
    if (wave) {
      wave.addEventListener('click', (e) => {
        const r = wave.getBoundingClientRect();
        pos = Math.max(0, Math.min(total, ((e.clientX - r.left) / r.width) * total));
        paint();
      });
    }
    paint();
  }
  function formatTime(s) {
    s = Math.max(0, Math.floor(s));
    return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0');
  }

  // -------- Shows --------
  function renderShows() {
    const grids = ['#shows-grid', '#shows-grid-mobile'];
    grids.forEach(sel => {
      const grid = $(sel); if (!grid) return;
      const limit = grid.dataset.limit ? +grid.dataset.limit : null;
      let items = visible(D.shows);
      if (limit) items = items.slice(0, limit);
      grid.innerHTML = items.map(s => `
        <article class="show-card">
          <div class="show-date">
            <span class="day">${esc(s.day)}</span>
            <span class="month">${esc(s.month)}</span>
          </div>
          <div class="show-info">
            <div class="venue">${esc(s.venue)}</div>
            <div class="city">${esc(s.city)}</div>
            <div class="time">${esc(s.time)} Uhr</div>
          </div>
          ${s.ticketUrl ? `<a class="btn btn-secondary show-tickets" href="${esc(s.ticketUrl)}">Tickets</a>` : ''}
        </article>
      `).join('');
    });
  }

  // -------- Members --------
  function renderMembers() {
    ['#members-grid', '#members-grid-mobile'].forEach(sel => {
      const grid = $(sel); if (!grid) return;
      const limit = grid.dataset.limit ? +grid.dataset.limit : null;
      let items = visible(D.members);
      if (limit) items = items.slice(0, limit);
      grid.innerHTML = items.map(m => `
        <article class="member-card">
          <div class="member-photo"><img src="${esc(m.photo)}" alt="${esc(m.name)} – ${esc(m.role)}"></div>
          <div class="member-info">
            <div class="member-name">${esc(m.name)}</div>
            <div class="member-role">${esc(m.role)}</div>
          </div>
        </article>
      `).join('');
    });
  }

  // -------- Demo list --------
  function renderDemos() {
    ['#demo-list', '#demo-list-mobile'].forEach(sel => {
      const list = $(sel); if (!list) return;
      list.innerHTML = visible(D.songs).map((s, i) => `
        <div class="demo-row" data-song-id="${esc(s.id)}">
          <span class="demo-num">${String(i + 1).padStart(2, '0')}</span>
          <button class="demo-play" aria-label="Play ${esc(s.title)}">
            <svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
          </button>
          <span class="demo-title">${esc(s.title)}</span>
          <span class="waveform demo-mini-wave" data-waveform data-seed="${esc(s.id)}" data-bars="40"></span>
          <span class="demo-time">${esc(s.duration)}</span>
        </div>
      `).join('');
      list.querySelectorAll('[data-waveform]').forEach(el => buildWaveform(el, { seed: el.dataset.seed, bars: 40 }));
    });
  }

  // -------- Gallery --------
  function renderGallery() {
    ['#media-grid', '#media-grid-mobile'].forEach(sel => {
      const grid = $(sel); if (!grid) return;
      const limit = grid.dataset.limit ? +grid.dataset.limit : null;
      let items = visible(D.gallery);
      if (limit) items = items.slice(0, limit);
      grid.innerHTML = items.map(g => `
        <a class="media-tile" href="#" data-kind="${esc(g.kind)}">
          <img src="${esc(g.src)}" alt="${esc(g.alt || '')}">
          ${g.kind === 'video' ? `<span class="play-ind"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg></span>` : ''}
        </a>
      `).join('');
    });
  }

  // -------- News --------
  function renderNews() {
    const desk = $('#news-grid');
    if (desk) {
      const limit = desk.dataset.limit ? +desk.dataset.limit : null;
      let items = visible(D.news);
      if (limit) items = items.slice(0, limit);
      desk.innerHTML = items.map(n => `
        <article class="news-card">
          <div class="news-thumb"><img src="${esc(n.thumb)}" alt=""></div>
          <div>
            <div class="news-tag">${esc(n.tag)}</div>
            <h3 class="news-title">${esc(n.title)}</h3>
            <p class="news-excerpt">${esc(n.excerpt)}</p>
            <div class="news-date">${esc(n.date)}</div>
          </div>
        </article>
      `).join('');
    }
    const mob = $('#news-list-mobile');
    if (mob) {
      mob.innerHTML = visible(D.news).map(n => `
        <article class="news-item">
          <div class="news-thumb-m"><img src="${esc(n.thumb)}" alt=""></div>
          <div>
            <div class="news-tag">${esc(n.tag)}</div>
            <div class="news-h">${esc(n.title)}</div>
            <div class="news-x">${esc(n.excerpt)}</div>
            <div class="news-d">${esc(n.date)}</div>
          </div>
          <div class="news-arrow">›</div>
        </article>
      `).join('');
    }
  }

  // -------- Booking form (frontend-only validation) --------
  function initBookingForms() {
    $$('form[id^=booking-form]').forEach(form => {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        // honeypot
        if (form.querySelector('input[name=hp_field]')?.value) return;
        const data = Object.fromEntries(new FormData(form).entries());
        if (!data.name || !data.email || !data.message) {
          showToast(form, 'Bitte fülle alle Pflichtfelder aus.', 'error'); return;
        }
        if (!data.consent) {
          showToast(form, 'Bitte stimme der Datenschutzerklärung zu.', 'error'); return;
        }
        // TODO: replace with backend POST when wired up (e.g. /api/booking)
        // await fetch('/api/booking', { method: 'POST', body: JSON.stringify(data) })
        showToast(form, 'Danke! Wir melden uns innerhalb 48h.', 'success');
        form.reset();
      });
    });
  }
  function showToast(form, msg, kind) {
    let t = form.querySelector('.form-toast');
    if (!t) {
      t = document.createElement('div');
      t.className = 'form-toast';
      t.style.cssText = 'grid-column:1/-1; padding:10px 14px; border-radius:6px; font-size:12px; letter-spacing:0.04em;';
      form.appendChild(t);
    }
    t.style.background = kind === 'success' ? 'rgba(199,154,75,0.14)' : 'rgba(180,70,50,0.18)';
    t.style.border = '1px solid ' + (kind === 'success' ? 'rgba(232,201,130,0.45)' : 'rgba(220,120,90,0.4)');
    t.style.color = kind === 'success' ? '#e8c982' : '#f4c8b3';
    t.textContent = msg;
  }

  // -------- Mobile burger --------
  function initBurger() {
    const burger = $('#burger'); const drawer = $('#drawer');
    if (!burger || !drawer) return;
    burger.addEventListener('click', () => {
      const open = drawer.classList.toggle('open');
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
      document.body.style.overflow = open ? 'hidden' : '';
    });
    drawer.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
      drawer.classList.remove('open');
      burger.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    }));
  }

  document.addEventListener('DOMContentLoaded', () => {
    renderShows();
    renderMembers();
    renderDemos();
    renderGallery();
    renderNews();
    initPlayer();
    initBookingForms();
    initBurger();
  });
})();
