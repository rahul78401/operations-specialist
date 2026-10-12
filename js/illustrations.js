/* Small SVG illustrations ("visualizers"). Transparent background, theme colours:
   green = client side, amber = server side / attention, gray = data and infrastructure.
   Each figure returns an SVG string. Place one in a page with:
     <figure class="figure" data-fig="name"><figcaption>Optional caption</figcaption></figure>
   and add the figure to the `fig` list at the bottom of this file. */
(() => {
  let uid = 0;
  const COLORS = { '': ['#ffffff', '#0d0d0d'], green: ['#e7f3ec', '#1e7a4c'], amber: ['#fbf0db', '#b8741a'], gray: ['#f3f3f1', '#b9b9b5'] };
  const X = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');
  const FONT = 'font-family="Inter, system-ui, -apple-system, Segoe UI, Arial, sans-serif"';
  const MONO = 'font-family="ui-monospace, SF Mono, Consolas, Liberation Mono, monospace"';
  const nd = (n) => (typeof n === 'string' ? { t: n } : n);

  const svg = (W, H, inner, label) =>
    `<svg class="illus" viewBox="0 0 ${W} ${H}" width="${W}" style="max-width:100%;height:auto" role="img" aria-label="${X(label || 'Diagram')}" ${FONT}>${inner}</svg>`;

  const marker = (id) =>
    `<defs><marker id="${id}" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="10" markerHeight="10" markerUnits="userSpaceOnUse" orient="auto-start-reverse"><path d="M2 1.5 L8.5 5 L2 8.5" fill="none" stroke="#0d0d0d" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></marker></defs>`;

  const box = (x, y, w, h, n) => {
    const [f, s] = COLORS[n.c || ''];
    const cx = x + w / 2, cy = y + h / 2;
    let o = `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="12" fill="${f}" stroke="${s}" stroke-width="1.5"/>`;
    if (n.s) {
      o += `<text x="${cx}" y="${cy - 3}" text-anchor="middle" font-size="13.5" font-weight="600" fill="#0d0d0d">${X(n.t)}</text>`;
      o += `<text x="${cx}" y="${cy + 14}" text-anchor="middle" font-size="11" fill="#6b6b6b">${X(n.s)}</text>`;
    } else {
      o += `<text x="${cx}" y="${cy + 5}" text-anchor="middle" font-size="13.5" font-weight="600" fill="#0d0d0d">${X(n.t)}</text>`;
    }
    return o;
  };

  const text = (x, y, t, o = {}) =>
    `<text x="${x}" y="${y}" text-anchor="${o.anchor || 'middle'}" font-size="${o.size || 12}" font-weight="${o.weight || 600}" fill="${o.fill || '#0d0d0d'}" ${o.mono ? MONO : ''}>${X(t)}</text>`;

  /* A row (or column) of boxes joined by arrows. opts: dir 'v', bidir, w, gap. */
  function flow(items, o = {}) {
    const id = 'ar' + ++uid;
    const nodes = items.map(nd);
    const v = o.dir === 'v';
    const hasSub = nodes.some((n) => n.s);
    const w = o.w || (v ? 230 : 112), h = hasSub ? 60 : 46, gap = o.gap || (v ? 34 : 40), pad = 8, n = nodes.length;
    const W = v ? w + pad * 2 : n * w + (n - 1) * gap + pad * 2;
    const H = v ? n * h + (n - 1) * gap + pad * 2 : h + pad * 2;
    let out = marker(id);
    nodes.forEach((node, i) => {
      const x = v ? pad : pad + i * (w + gap), y = v ? pad + i * (h + gap) : pad;
      out += box(x, y, w, h, node);
      if (i < n - 1) {
        const ends = `marker-end="url(#${id})" ${o.bidir ? `marker-start="url(#${id})"` : ''}`;
        if (v) {
          const cx = x + w / 2;
          out += `<line x1="${cx}" y1="${y + h + 3}" x2="${cx}" y2="${y + h + gap - 3}" stroke="#0d0d0d" stroke-width="1.6" ${ends}/>`;
        } else {
          const cy = y + h / 2;
          out += `<line x1="${x + w + 3}" y1="${cy}" x2="${x + w + gap - 3}" y2="${cy}" stroke="#0d0d0d" stroke-width="1.6" ${ends}/>`;
        }
      }
    });
    return svg(W, H, out, o.label || nodes.map((x) => x.t).join(' to '));
  }

  /* Two boxes with a request arrow going right and a response arrow coming back. */
  function duplex(left, right, req, res) {
    const id = 'ar' + ++uid;
    let out = marker(id);
    out += box(8, 12, 120, 96, nd(left)) + box(392, 12, 120, 96, nd(right));
    out += text(260, 40, req, { weight: 500 });
    out += `<line x1="136" y1="48" x2="384" y2="48" stroke="#0d0d0d" stroke-width="1.6" marker-end="url(#${id})"/>`;
    out += text(260, 82, res, { weight: 500, fill: '#1e7a4c' });
    out += `<line x1="384" y1="90" x2="136" y2="90" stroke="#1e7a4c" stroke-width="1.6" stroke-dasharray="5 4" marker-end="url(#${id})"/>`;
    return svg(520, 120, out, `${req} and ${res}`);
  }

  /* Phone -> router (wireless, dashed) -> cables -> server. */
  function journey() {
    const id = 'ar' + ++uid;
    let o = marker(id);
    const edge = (x1, x2, label, sub, dashed) => {
      const y = 66;
      let e = `<line x1="${x1}" y1="${y}" x2="${x2}" y2="${y}" stroke="${dashed ? '#b8741a' : '#0d0d0d'}" stroke-width="1.6" ${dashed ? 'stroke-dasharray="5 4"' : ''} marker-start="url(#${id})" marker-end="url(#${id})"/>`;
      e += text((x1 + x2) / 2, y - 9, label, { fill: dashed ? '#85500f' : '#0d0d0d' });
      if (sub) e += text((x1 + x2) / 2, y + 20, sub, { size: 11, weight: 500, fill: '#85500f' });
      return e;
    };
    o += box(8, 30, 112, 72, { t: 'Your phone', s: 'Client', c: 'green' });
    o += box(210, 30, 112, 72, { t: 'Router', s: 'Nearest point', c: 'gray' });
    o += box(412, 30, 128, 72, { t: 'Cables', s: 'Even under the sea', c: 'gray' });
    o += box(630, 30, 112, 72, { t: 'Server', s: 'In a data centre', c: 'amber' });
    o += edge(124, 206, 'Wireless', 'last few metres', true);
    o += edge(326, 408, 'Cable');
    o += edge(544, 626, 'Cable');
    return svg(750, 130, o, 'A phone connects wirelessly to a router for the last few metres. After that the data travels on cables to a server.');
  }

  /* Different devices, one set of rules. */
  function rules() {
    let o = '';
    const hub = { x: 160, y: 66, w: 200, h: 58 };
    [[8, 12, 'Phone', 'green', 1], [8, 138, 'Laptop', 'green', 1], [392, 12, 'Server', 'amber', 0], [392, 138, 'Router', 'gray', 0]].forEach(([x, y, , , left]) => {
      o += `<line x1="${left ? x + 120 : x}" y1="${y + 22}" x2="${left ? hub.x : hub.x + hub.w}" y2="${hub.y + hub.h / 2}" stroke="#9b9b9b" stroke-width="1.5"/>`;
    });
    [[8, 12, 'Phone', 'green'], [8, 138, 'Laptop', 'green'], [392, 12, 'Server', 'amber'], [392, 138, 'Router', 'gray']].forEach(([x, y, t, c]) => {
      o += box(x, y, 120, 44, { t, c });
    });
    o += box(hub.x, hub.y, hub.w, hub.h, { t: 'TCP/IP', s: 'Same rules for everyone', c: 'green' });
    return svg(520, 190, o, 'Phone, laptop, server and router all follow the same rules, called TCP/IP');
  }

  /* A photo cut into packets, sent along different routes, put back together. */
  function packets() {
    const id = 'ar' + ++uid;
    let o = marker(id);
    const route = (y) => (y === 95 ? 'M104 95 H614' : `M104 95 C136 95 130 ${y} 166 ${y} L552 ${y} C588 ${y} 582 95 614 95`);
    [30, 95, 160].forEach((y) => { o += `<path d="${route(y)}" fill="none" stroke="#b9b9b5" stroke-width="2" marker-end="url(#${id})"/>`; });
    o += box(8, 60, 92, 70, { t: 'Photo', s: 'Big file', c: 'green' });
    o += box(622, 60, 92, 70, { t: 'Photo', s: 'Whole again', c: 'green' });
    [[1, 220, 30], [4, 440, 30], [2, 340, 95], [3, 520, 160]].forEach(([n, x, y]) => {
      o += `<rect x="${x - 15}" y="${y - 12}" width="30" height="24" rx="6" fill="#fbf0db" stroke="#b8741a" stroke-width="1.4"/>`;
      o += text(x, y + 4.5, n, { size: 12.5 });
    });
    o += text(60, 198, 'Cut into packets');
    o += text(360, 198, 'Each packet takes its own route');
    o += text(668, 198, 'Put back together');
    return svg(720, 210, o, 'A photo is cut into numbered packets, each packet travels its own route, and the packets are put back together');
  }

  /* Frontend on one side, backend on the other. */
  function split() {
    const id = 'ar' + ++uid;
    let o = marker(id);
    const panel = (x, c, title, sub, items) => {
      const [f, s] = COLORS[c];
      let p = `<rect x="${x}" y="8" width="326" height="196" rx="16" fill="${f}" stroke="${s}" stroke-width="1.5"/>`;
      p += text(x + 24, 38, title, { anchor: 'start', size: 14 });
      p += text(x + 24, 56, sub, { anchor: 'start', size: 11.5, weight: 400, fill: '#6b6b6b' });
      items.forEach((t, i) => {
        p += `<rect x="${x + 24}" y="${76 + i * 40}" width="278" height="32" rx="10" fill="#fff" stroke="${s}" stroke-width="1.2"/>`;
        p += text(x + 40, 97 + i * 40, t, { anchor: 'start', size: 13, weight: 500 });
      });
      return p;
    };
    o += panel(8, 'green', 'FRONTEND', 'What the user sees and touches', ['Pages', 'Buttons', 'Images']);
    o += panel(386, 'amber', 'BACKEND', 'What works behind the scenes', ['Stores data', 'Checks logins', 'Handles payments']);
    o += `<line x1="342" y1="106" x2="378" y2="106" stroke="#0d0d0d" stroke-width="1.6" marker-start="url(#${id})" marker-end="url(#${id})"/>`;
    return svg(720, 212, o, 'Frontend: pages, buttons, images. Backend: stores data, checks logins, handles payments');
  }

  /* HTTP sends readable text, HTTPS sends scrambled text. */
  function https() {
    const id = 'ar' + ++uid;
    let o = marker(id);
    const row = (y0, secure) => {
      const [pf, ps] = COLORS[secure ? 'green' : 'amber'];
      let r = `<rect x="8" y="${y0}" width="158" height="24" rx="12" fill="${pf}" stroke="${ps}" stroke-width="1.2"/>`;
      r += text(87, y0 + 16, secure ? 'HTTPS: encrypted' : 'HTTP: plain text');
      r += box(8, y0 + 40, 108, 52, { t: 'Phone', s: 'Client', c: 'green' });
      r += box(612, y0 + 40, 108, 52, { t: 'Server', s: 'Backend', c: 'amber' });
      r += `<line x1="122" y1="${y0 + 66}" x2="606" y2="${y0 + 66}" stroke="#0d0d0d" stroke-width="1.6" marker-end="url(#${id})"/>`;
      const cw = secure ? 176 : 156, cx = 364 - cw / 2;
      r += `<rect x="${cx}" y="${y0 + 50}" width="${cw}" height="32" rx="8" fill="#fff" stroke="#0d0d0d" stroke-width="1.3"/>`;
      if (secure) {
        r += `<rect x="${cx + 12}" y="${y0 + 62}" width="14" height="11" rx="2" fill="#1e7a4c"/><path d="M${cx + 15} ${y0 + 62} v-3 a4 4 0 0 1 8 0 v3" fill="none" stroke="#1e7a4c" stroke-width="1.8"/>`;
        r += text(cx + 100, y0 + 71, 'a8F#2k!9xQz', { mono: true, size: 13, weight: 500 });
      } else {
        r += text(364, y0 + 71, 'password: 1234', { mono: true, size: 13, weight: 500 });
      }
      r += `<line x1="364" y1="${y0 + 84}" x2="364" y2="${y0 + 102}" stroke="${secure ? '#9b9b9b' : '#b8741a'}" stroke-width="1.4" stroke-dasharray="3 3"/>`;
      r += `<rect x="239" y="${y0 + 104}" width="250" height="30" rx="10" fill="${secure ? '#f3f3f1' : '#fbf0db'}" stroke="${secure ? '#b9b9b5' : '#b8741a'}" stroke-dasharray="4 3" stroke-width="1.3"/>`;
      r += text(364, y0 + 123, secure ? 'Anyone on the network sees only noise' : 'Anyone on the network can read it', { size: 11.5, weight: 500, fill: secure ? '#2b2b2b' : '#85500f' });
      return r;
    };
    o += row(8, false) + row(170, true);
    return svg(728, 312, o, 'With HTTP a password travels as readable text. With HTTPS it travels scrambled.');
  }

  const fig = {
    roleMap: () => flow([
      { t: 'Customer app', s: 'Frontend', c: 'green' },
      { t: 'API', s: 'The messenger' },
      { t: 'Backend', s: 'Logic and logins', c: 'amber' },
      { t: 'Database', s: 'Stored data', c: 'gray' },
    ], { bidir: true, w: 150, gap: 44, label: 'Customer app, API, backend and database' }),
    howItWorks: () => flow([{ t: 'Introduction' }, { t: 'What you will learn' }, { t: 'Practice', c: 'amber' }], { w: 170, gap: 44 }),
    journey,
    rules,
    packets,
    clientServer: () => duplex({ t: 'Client', s: 'Your phone', c: 'green' }, { t: 'Server', s: 'Instagram', c: 'amber' }, 'Request: open a profile', 'Response: the profile data'),
    split,
    api: () => flow([
      { t: 'Frontend', s: 'Instagram app', c: 'green' },
      { t: 'API', s: 'Passes messages' },
      { t: 'Backend', s: 'Saves the like', c: 'amber' },
    ], { bidir: true, w: 160, gap: 56, label: 'Frontend, API and backend' }),
    https,
    fullPicture: () => flow([
      { t: 'Phone', s: 'Client + frontend', c: 'green' },
      { t: 'API', s: 'HTTPS + JSON' },
      { t: 'Backend', s: 'Logic and logins', c: 'amber' },
      { t: 'Database', s: 'Profiles and posts', c: 'gray' },
    ], { bidir: true, w: 160, gap: 44, label: 'Phone, API, backend and database' }),
  };

  window.Ops = { fig };
})();
