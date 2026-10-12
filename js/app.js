/* Router, sidebar and small helpers. Content lives in index.html, one <section class="page"> per page. */
(() => {
  const pages = Array.from(document.querySelectorAll('.page'));
  const nav = document.getElementById('nav');
  const btn = document.getElementById('nav-btn');
  const scrim = document.getElementById('scrim');
  const siteTitle = 'Operations Specialist';
  const links = {};

  /* Drop each illustration into its <figure data-fig="name"> */
  document.querySelectorAll('[data-fig]').forEach((el) => {
    const make = window.Ops && Ops.fig[el.dataset.fig];
    if (make) el.insertAdjacentHTML('afterbegin', make());
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

  /* Sidebar, built from the pages */
  pages.forEach((page, i) => {
    if (i === 1) {
      const label = document.createElement('div');
      label.className = 'nav-label';
      label.textContent = 'Sessions';
      nav.appendChild(label);
    }
    const a = document.createElement('a');
    a.className = 'nav-link';
    a.href = '#' + page.id;
    a.innerHTML = `<span class="nav-num">${page.dataset.number ?? ''}</span><span>${page.dataset.title}</span>`;
    nav.appendChild(a);
    links[page.id] = a;
  });

  /* Previous / Next */
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

  const show = () => {
    const id = location.hash.slice(1);
    const current = pages.find((p) => p.id === id) || pages[0];
    pages.forEach((p) => { p.hidden = p !== current; });
    Object.keys(links).forEach((k) => {
      links[k].classList.toggle('is-active', k === current.id);
      if (k === current.id) links[k].setAttribute('aria-current', 'page');
      else links[k].removeAttribute('aria-current');
    });
    document.title = current === pages[0] ? siteTitle : `${current.dataset.title} | ${siteTitle}`;
    setNav(false);
    window.scrollTo(0, 0);
  };

  btn.addEventListener('click', () => setNav(!document.body.classList.contains('nav-open')));
  scrim.addEventListener('click', () => setNav(false));
  window.addEventListener('hashchange', show);

  /* Left / right arrow keys move between pages (handy when presenting) */
  document.addEventListener('keydown', (e) => {
    if (e.ctrlKey || e.metaKey || e.altKey || e.shiftKey) return;
    if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
    const i = pages.findIndex((p) => !p.hidden);
    const next = pages[i + (e.key === 'ArrowRight' ? 1 : -1)];
    if (next) location.hash = next.id;
  });

  show();
})();
