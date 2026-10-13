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
  /* Two side-by-side panels. Each side: { c, title, sub, items: [] }. a.arrow === false hides the middle arrow. */
  function panels(L, R, o = {}) {
    const id = 'ar' + ++uid;
    let out = marker(id);
    const n = Math.max(L.items.length, R.items.length);
    const h = 116 + (n - 1) * 40;
    const panel = (x, p) => {
      const [f, s] = COLORS[p.c || ''];
      let r = `<rect x="${x}" y="8" width="326" height="${h}" rx="16" fill="${f}" stroke="${s}" stroke-width="1.5"/>`;
      r += text(x + 24, 38, p.title, { anchor: 'start', size: 14 });
      if (p.sub) r += text(x + 24, 56, p.sub, { anchor: 'start', size: 11.5, weight: 400, fill: '#6b6b6b' });
      p.items.forEach((t, i) => {
        r += `<rect x="${x + 24}" y="${76 + i * 40}" width="278" height="32" rx="10" fill="#fff" stroke="${s}" stroke-width="1.2"/>`;
        r += text(x + 40, 97 + i * 40, t, { anchor: 'start', size: 13, weight: 500 });
      });
      return r;
    };
    out += panel(8, L) + panel(386, R);
    if (o.arrow !== false) out += `<line x1="342" y1="${8 + h / 2}" x2="378" y2="${8 + h / 2}" stroke="#0d0d0d" stroke-width="1.6" marker-start="url(#${id})" marker-end="url(#${id})"/>`;
    return svg(720, h + 16, out, `${L.title} and ${R.title}`);
  }

  function split() {
    return panels(
      { c: 'green', title: 'FRONTEND', sub: 'What the user sees and touches', items: ['Pages', 'Buttons', 'Images'] },
      { c: 'amber', title: 'BACKEND', sub: 'What works behind the scenes', items: ['Stores data', 'Checks logins', 'Handles payments'] }
    );
  }

  /* A URL split into colour-coded parts, with a key underneath. */
  function urlParts() {
    const CW = 9, X0 = 20, Y = 34;
    const segs = [
      ['https://', 'Protocol', '#6b6b6b'],
      ['api.example.com', 'Host: the server', '#6b6b6b'],
      ['/orders', 'Path: the resource', '#0d0d0d'],
      ['/123', 'Path parameter: which one', '#1e7a4c'],
      ['?status=paid&limit=10', 'Query parameters: how to filter', '#b8741a'],
    ];
    let o = '', x = X0;
    segs.forEach(([s, , c]) => {
      o += `<text x="${x}" y="${Y}" font-size="15" font-weight="600" fill="${c}" ${MONO} textLength="${s.length * CW}" lengthAdjust="spacingAndGlyphs">${X(s)}</text>`;
      o += `<rect x="${x}" y="${Y + 8}" width="${s.length * CW - 2}" height="3" rx="1.5" fill="${c}"/>`;
      x += s.length * CW;
    });
    segs.forEach(([s, label, c], i) => {
      const y = 82 + i * 28;
      o += `<circle cx="28" cy="${y - 4}" r="5" fill="${c}"/>`;
      o += text(44, y, s, { anchor: 'start', size: 12.5, mono: true, weight: 500 });
      o += text(250, y, label, { anchor: 'start', size: 13, weight: 500, fill: '#2b2b2b' });
    });
    return svg(560, 218, o, 'A URL split into protocol, host, path, path parameter and query parameters');
  }

  /* Retry waits that double each time. */
  function backoff() {
    let o = `<line x1="30" y1="150" x2="500" y2="150" stroke="#9b9b9b" stroke-width="1.5"/>`;
    [[60, 20, 'Wait 1s', 'Retry 1'], [170, 40, 'Wait 2s', 'Retry 2'], [280, 80, 'Wait 4s', 'Retry 3'], [390, 140, 'Wait 8s', 'Retry 4']].forEach(([x, h, l, r]) => {
      o += `<rect x="${x}" y="${150 - h}" width="70" height="${h}" rx="8" fill="#fbf0db" stroke="#b8741a" stroke-width="1.4"/>`;
      o += text(x + 35, 170, l, { size: 12.5 });
      o += text(x + 35, 150 - h - 8, r, { size: 11.5, weight: 500, fill: '#6b6b6b' });
    });
    return svg(530, 184, o, 'Exponential backoff: wait 1, 2, 4 and 8 seconds between retries');
  }

  /* The server did the work, but the reply never arrived. */
  function lostResponse() {
    const id = 'ar' + ++uid;
    let o = marker(id);
    o += box(8, 14, 120, 112, { t: 'Client', s: 'Sees a timeout', c: 'gray' });
    o += box(392, 14, 120, 112, { t: 'Server', s: 'Payment created', c: 'amber' });
    o += text(260, 44, 'Request: create a payment', { weight: 500 });
    o += `<line x1="136" y1="52" x2="384" y2="52" stroke="#0d0d0d" stroke-width="1.6" marker-end="url(#${id})"/>`;
    o += `<line x1="384" y1="96" x2="136" y2="96" stroke="#b8741a" stroke-width="1.6" stroke-dasharray="5 4" marker-end="url(#${id})"/>`;
    o += `<circle cx="260" cy="96" r="10" fill="#fbf0db" stroke="#b8741a" stroke-width="1.5"/><path d="M256 92 l8 8 M264 92 l-8 8" stroke="#b8741a" stroke-width="1.8" stroke-linecap="round"/>`;
    o += text(260, 124, 'Response lost on the way', { weight: 500, fill: '#85500f' });
    return svg(520, 142, o, 'The server created the payment but the response was lost, so the client sees a timeout');
  }

  /* Polling: keep asking. Webhook: get told. */
  function webhookVsPolling() {
    const id = 'ar' + ++uid;
    let o = marker(id);
    const tag = (y, t, c) => {
      const [f, s] = COLORS[c];
      return `<rect x="8" y="${y}" width="130" height="24" rx="12" fill="${f}" stroke="${s}" stroke-width="1.2"/>` + text(73, y + 16, t);
    };
    // Row 1: polling
    o += tag(8, 'Polling', 'gray');
    o += box(8, 44, 112, 64, { t: 'Your app', c: 'green' }) + box(508, 44, 112, 64, { t: 'Provider', c: 'amber' });
    o += text(314, 62, 'Any news?', { weight: 500 });
    o += `<line x1="128" y1="70" x2="500" y2="70" stroke="#0d0d0d" stroke-width="1.6" marker-end="url(#${id})"/>`;
    o += text(314, 104, 'Not yet... ask again in a few seconds', { weight: 500, fill: '#6b6b6b' });
    o += `<line x1="500" y1="84" x2="128" y2="84" stroke="#6b6b6b" stroke-width="1.4" stroke-dasharray="5 4" marker-end="url(#${id})"/>`;
    // Row 2: webhook
    o += tag(136, 'Webhook', 'green');
    o += box(8, 172, 112, 64, { t: 'Provider', c: 'amber' }) + box(508, 172, 112, 64, { t: 'Your app', c: 'green' });
    o += text(314, 192, 'Event: payment.succeeded', { weight: 500, mono: true, size: 12 });
    o += `<line x1="128" y1="204" x2="500" y2="204" stroke="#1e7a4c" stroke-width="1.6" marker-end="url(#${id})"/>`;
    o += text(314, 226, 'The provider calls you when it happens', { weight: 500, fill: '#135238' });
    return svg(628, 246, o, 'Polling means your app keeps asking. A webhook means the provider tells your app when something happens.');
  }

  /* Same idempotency key: the retry does not create a second payment. */
  function idempotency() {
    const id = 'ar' + ++uid;
    let o = marker(id);
    o += box(8, 14, 112, 196, { t: 'Your server', s: 'Sends requests', c: 'green' });
    o += box(520, 14, 112, 196, { t: 'Stripe', s: 'Creates payments', c: 'amber' });
    // first attempt
    o += text(320, 44, 'POST /v1/payment_intents', { weight: 600, mono: true, size: 12 });
    o += text(320, 60, 'Idempotency-Key: abc123', { weight: 500, mono: true, size: 11.5, fill: '#6b6b6b' });
    o += `<line x1="128" y1="68" x2="512" y2="68" stroke="#0d0d0d" stroke-width="1.6" marker-end="url(#${id})"/>`;
    o += `<line x1="512" y1="90" x2="128" y2="90" stroke="#1e7a4c" stroke-width="1.6" stroke-dasharray="5 4" marker-end="url(#${id})"/>`;
    o += text(320, 108, 'New payment created', { weight: 500, fill: '#135238' });
    // retry
    o += `<line x1="150" y1="124" x2="490" y2="124" stroke="#dcdcdc" stroke-width="1" stroke-dasharray="2 4"/>`;
    o += text(320, 142, 'Retry after a timeout', { weight: 600 });
    o += text(320, 158, 'Idempotency-Key: abc123 (same key)', { weight: 500, mono: true, size: 11.5, fill: '#6b6b6b' });
    o += `<line x1="128" y1="166" x2="512" y2="166" stroke="#0d0d0d" stroke-width="1.6" marker-end="url(#${id})"/>`;
    o += `<line x1="512" y1="188" x2="128" y2="188" stroke="#1e7a4c" stroke-width="1.6" stroke-dasharray="5 4" marker-end="url(#${id})"/>`;
    o += text(320, 206, 'Same result. No second charge.', { weight: 600, fill: '#135238' });
    return svg(640, 224, o, 'A retry with the same idempotency key returns the same result and does not create a second payment');
  }

  /* PaymentIntent statuses. */
  function intentLifecycle() {
    const id = 'ar' + ++uid;
    let o = marker(id);
    const W = 148, G = 24, H = 64;
    const main = [
      { t: 'Created', s: 'requires_payment_method' },
      { t: 'Method added', s: 'requires_confirmation' },
      { t: 'Extra step', s: 'requires_action', c: 'amber' },
      { t: 'Processing', s: 'processing' },
      { t: 'Paid', s: 'succeeded', c: 'green' },
    ];
    main.forEach((n, i) => {
      const x = 8 + i * (W + G);
      o += box(x, 8, W, H, n);
      if (i < main.length - 1) o += `<line x1="${x + W + 3}" y1="${8 + H / 2}" x2="${x + W + G - 3}" y2="${8 + H / 2}" stroke="#0d0d0d" stroke-width="1.6" marker-end="url(#${id})"/>`;
    });
    o += text(8, 112, 'Also possible', { anchor: 'start', size: 12, fill: '#6b6b6b' });
    o += box(8, 124, 240, 56, { t: 'requires_capture', s: 'Authorized, money not taken yet', c: 'amber' });
    o += box(268, 124, 240, 56, { t: 'Payment fails', s: 'Back to requires_payment_method', c: 'amber' });
    o += box(528, 124, 240, 56, { t: 'canceled', s: 'Stopped before success', c: 'gray' });
    return svg(852, 190, o, 'PaymentIntent statuses from requires_payment_method to succeeded, plus requires_capture, failure and canceled');
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
    howItWorks: () => flow([{ t: 'Read the sections' }, { t: 'Present them' }, { t: 'Try the tasks', c: 'amber' }], { w: 190, gap: 44 }),

    /* Generic figures. Use data-args='{...}' to pass the options. */
    flow: (a) => flow(a.items, a.opts || {}),
    duplex: (a) => duplex(a.left, a.right, a.req, a.res),
    panels: (a) => panels(a.left, a.right, a),
    urlParts,
    backoff,
    lostResponse,
    webhookVsPolling,
    idempotency,
    intentLifecycle,
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

  window.Ops = window.Ops || {};
  Ops.fig = fig;
})();
