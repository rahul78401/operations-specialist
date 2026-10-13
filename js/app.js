/* Router, sidebar, presentation mode and small helpers.
   Pages are <section class="page"> elements. A page with data-parent is a section of that module. */
(() => {
  const siteTitle = 'Operations Specialist';

  /* Insert module content (js/content/*.js) where <div data-include="name"> sits */
  document.querySelectorAll('[data-include]').forEach((el) => {
    const html = window.Ops && Ops.content && Ops.content[el.dataset.include];
    if (html) el.outerHTML = html;
  });

  const pages = Array.from(document.querySelectorAll('.page'));
  const byId = Object.fromEntries(pages.map((p) => [p.id, p]));
  const modOf = (p) => (p.dataset.parent ? byId[p.dataset.parent] : p);
  const nav = document.getElementById('nav');
  const btn = document.getElementById('nav-btn');
  const scrim = document.getElementById('scrim');

  /* Drop each illustration into its <figure data-fig="name" data-args='{...}'> */
  document.querySelectorAll('[data-fig]').forEach((el) => {
    const make = window.Ops && Ops.fig[el.dataset.fig];
    if (!make) return;
    let args;
    try { args = el.dataset.args ? JSON.parse(el.dataset.args) : undefined; } catch (e) { /* ignore */ }
    el.insertAdjacentHTML('afterbegin', make(args));
  });

  /* Images: try the local file first, then data-fallback (a remote copy). If both fail, show a note
     instead of a broken-image icon. To fix a missing image, save it into the images folder. */
  document.querySelectorAll('img[data-fallback]').forEach((img) => {
    const local = img.getAttribute('src');
    let tried = false;
    const fail = () => {
      if (!tried) { tried = true; img.src = img.dataset.fallback; return; }
      const note = document.createElement('div');
      note.className = 'img-missing';
      note.textContent = `Image not available. Save it as ${local} to show it here.`;
      img.replaceWith(note);
    };
    img.addEventListener('error', fail);
    if (img.complete && img.naturalWidth === 0) fail();
  });

  /* Colour JSON blocks: keys, text, numbers, true/false */
  const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  document.querySelectorAll('code[data-json]').forEach((el) => {
    el.innerHTML = esc(el.textContent).replace(
      /("(?:[^"\\]|\\.)*")(\s*:)?|\b(true|false|null)\b|-?\b\d+(?:\.\d+)?\b/g,
      (m, str, colon, word) =>
        str ? `<span class="${colon ? 'tk-v' : 'tk-s'}">${str}</span>${colon || ''}` :
        word ? `<span class="tk-st">${m}</span>` : `<span class="tk-n">${m}</span>`
    );
  });

  /* Everything before the first block is the page head (title slide). Add a Present button to it. */
  const playIcon = '<svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor" aria-hidden="true"><path d="M3 1.5v11l9-5.5z"/></svg>';
  pages.forEach((page) => {
    const head = document.createElement('div');
    head.className = 'page-head';
    while (page.firstElementChild && !page.firstElementChild.classList.contains('block')) head.appendChild(page.firstElementChild);
    const present = document.createElement('button');
    present.type = 'button';
    present.className = 'present-btn';
    present.innerHTML = `${playIcon}<span>Present</span>`;
    present.addEventListener('click', () => start());
    head.appendChild(present);
    page.prepend(head);
  });

  /* Sidebar: modules, with their sections underneath */
  const chev = '<svg class="ico" width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M5 2.5 9.5 7 5 11.5"/></svg>';
  const links = {};
  const mods = {};
  pages.filter((p) => !p.dataset.parent).forEach((page, i) => {
    if (i === 1) nav.insertAdjacentHTML('beforeend', '<div class="nav-label">Sessions</div>');
    const kids = pages.filter((p) => p.dataset.parent === page.id);
    const num = `<span class="nav-num">${page.dataset.number ?? ''}</span>`;
    if (!kids.length) {
      nav.insertAdjacentHTML('beforeend', `<a class="nav-link" href="#${page.id}" data-id="${page.id}">${num}<span>${page.dataset.title}</span></a>`);
      links[page.id] = nav.lastElementChild;
      return;
    }
    nav.insertAdjacentHTML('beforeend',
      `<div class="nav-mod" data-mod="${page.id}"><div class="nav-mod-row">` +
      `<a class="nav-link nav-mod-link" href="#${page.id}" data-id="${page.id}">${num}<span>${page.dataset.title}</span></a>` +
      `<button type="button" class="nav-chev" aria-label="Show sections" aria-expanded="false">${chev}</button></div>` +
      `<div class="nav-subs">${kids.map((k) => `<a class="nav-sub" href="#${k.id}" data-id="${k.id}"><span class="nav-subnum">${k.dataset.sub}</span><span>${k.dataset.title}</span></a>`).join('')}</div></div>`);
    const wrap = nav.lastElementChild;
    mods[page.id] = wrap;
    wrap.querySelectorAll('[data-id]').forEach((a) => { links[a.dataset.id] = a; });
    const toggle = wrap.querySelector('.nav-chev');
    toggle.addEventListener('click', () => {
      const open = wrap.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', String(open));
    });
  });

  /* Previous / Next, in page order */
  pages.forEach((page, i) => {
    const pager = document.createElement('div');
    pager.className = 'pager';
    if (i > 0) pager.insertAdjacentHTML('beforeend', `<a class="prev" href="#${pages[i - 1].id}"><small>Previous</small><span>${pages[i - 1].dataset.title}</span></a>`);
    if (i < pages.length - 1) pager.insertAdjacentHTML('beforeend', `<a class="next" href="#${pages[i + 1].id}"><small>Next</small><span>${pages[i + 1].dataset.title}</span></a>`);
    page.appendChild(pager);
  });

  const setNav = (open) => {
    document.body.classList.toggle('nav-open', open);
    btn.setAttribute('aria-expanded', String(open));
  };

  let current = pages[0];
  const setPage = (page) => {
    current = page;
    pages.forEach((p) => { p.hidden = p !== page; });
    Object.keys(links).forEach((k) => {
      const on = k === page.id;
      links[k].classList.toggle('is-active', on);
      if (on) links[k].setAttribute('aria-current', 'page'); else links[k].removeAttribute('aria-current');
    });
    const m = mods[modOf(page).id];
    if (m) { m.classList.add('is-open'); m.querySelector('.nav-chev').setAttribute('aria-expanded', 'true'); }
    document.title = page === pages[0] ? siteTitle : `${page.dataset.title} | ${siteTitle}`;
    setNav(false);
  };

  const show = () => {
    setPage(byId[location.hash.slice(1)] || pages[0]);
    window.scrollTo(0, 0);
  };

  /* Presentation mode: one section at a time (scroll to read it), Next opens the next section */
  const bar = document.getElementById('pres-bar');
  const barTitle = document.getElementById('pres-title');
  const barCount = document.getElementById('pres-count');
  const barPrev = document.getElementById('pres-prev');
  const barNext = document.getElementById('pres-next');
  let deck = [];
  let di = 0;
  let presenting = false;

  /* Each deck entry is a whole page (a module landing or one section). It scrolls normally. */
  const go = (i) => {
    di = Math.max(0, Math.min(deck.length - 1, i));
    const page = deck[di];
    if (page !== current) {
      setPage(page);
      history.replaceState(null, '', '#' + page.id);
    }
    page.scrollTop = 0;
    barTitle.textContent = page.dataset.sub ? `${page.dataset.sub} ${page.dataset.title}` : page.dataset.title;
    barCount.textContent = `${di + 1} / ${deck.length}`;
    barPrev.disabled = di === 0;
    barNext.disabled = di === deck.length - 1;
  };

  const start = () => {
    const mod = modOf(current);
    deck = pages.filter((p) => modOf(p) === mod);
    presenting = true;
    document.body.classList.add('presenting');
    bar.hidden = false;
    go(Math.max(0, deck.indexOf(current)));
  };

  const stop = () => {
    presenting = false;
    document.body.classList.remove('presenting');
    bar.hidden = true;
    window.scrollTo(0, 0);
  };

  barPrev.addEventListener('click', () => go(di - 1));
  barNext.addEventListener('click', () => go(di + 1));
  document.getElementById('pres-exit').addEventListener('click', stop);

  btn.addEventListener('click', () => setNav(!document.body.classList.contains('nav-open')));
  scrim.addEventListener('click', () => setNav(false));
  window.addEventListener('hashchange', () => { if (!presenting) show(); });

  document.addEventListener('keydown', (e) => {
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    const interactive = e.target.closest && e.target.closest('summary, button, a, input, textarea');
    if (presenting) {
      switch (e.key) {
        case 'ArrowRight': go(di + 1); break;
        case 'ArrowLeft': go(di - 1); break;
        case 'Home': go(0); break;
        case 'End': go(deck.length - 1); break;
        case 'Escape': stop(); break;
        default: return;
      }
      e.preventDefault();
      return;
    }
    if (e.shiftKey) return;
    if (e.key === 'p' || e.key === 'P') { start(); return; }
    if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
    const next = pages[pages.indexOf(current) + (e.key === 'ArrowRight' ? 1 : -1)];
    if (next) location.hash = next.id;
  });

  show();
})();
