/* Small HTML builders used by the content files in js/content/.
   A module is a landing page plus sections. Each section is a page made of blocks, and each block is one slide. */
(() => {
  const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const attr = (o) => esc(JSON.stringify(o)).replace(/"/g, '&quot;');

  /* One block = one slide. n adds a small number before the title. */
  const block = (title, line, body = '', n) =>
    `<div class="block"><h2>${n ? `<span class="n">${n}</span>` : ''}${title}</h2>${line ? `<p class="line">${line}</p>` : ''}${body}</div>`;

  /* A diagram from js/illustrations.js. args is passed to generic figures (flow, duplex, panels). */
  const fig = (name, caption, args) =>
    `<figure class="figure" data-fig="${name}"${args ? ` data-args="${attr(args)}"` : ''}>${caption ? `<figcaption>${caption}</figcaption>` : ''}</figure>`;

  /* Code block. Pass 'json' as the third argument to colour JSON. */
  const code = (text, label, kind) =>
    `<div class="code">${label ? `<div class="code-bar">${label}</div>` : ''}<pre><code${kind === 'json' ? ' data-json' : ''}>${esc(text)}</code></pre></div>`;

  const table = (head, rows) =>
    `<table class="tbl"><thead><tr>${head.map((c) => `<th>${c}</th>`).join('')}</tr></thead><tbody>${rows.map((r) => `<tr>${r.map((c) => `<td>${c}</td>`).join('')}</tr>`).join('')}</tbody></table>`;

  const list = (items) => `<ul class="topics">${items.map((i) => `<li>${i}</li>`).join('')}</ul>`;
  const steps = (items) => `<ol class="steps">${items.map((i) => `<li>${i}</li>`).join('')}</ol>`;

  /* Small boxes: [class, sample, label]. cols = 2, 3 or 4. */
  const legend = (items, cols = 3) =>
    `<div class="legend c${cols}">${items.map(([c, s, l]) => `<div><code class="${c || ''}">${esc(s)}</code><span>${l}</span></div>`).join('')}</div>`;

  const callout = (kind, title, body) =>
    `<div class="callout ${kind}">${title ? `<div class="callout-title">${title}</div>` : ''}<p>${body}</p></div>`;

  const two = (a, b) => `<div class="two">${a}${b}</div>`;

  const methods = (rows) =>
    `<div class="methods">${rows.map(([m, what, ex]) => `<div class="method m-${m.toLowerCase()}"><b>${m}</b><span>${what}</span><code>${esc(ex)}</code></div>`).join('')}</div>`;

  const groups = (rows) =>
    `<div class="codes">${rows.map(([g, name, cls]) => `<div class="code-group ${cls}"><b>${g}</b><span>${name}</span></div>`).join('')}</div>`;

  /* A task: the question is visible, the solution opens on click. */
  const task = (n, title, question, body, solution) =>
    `<div class="block"><h2><span class="n">Task ${n}</span>${title}</h2><p class="line">${question}</p>${body || ''}` +
    `<details class="task"><summary><span class="show">Show solution</span><span class="hide">Hide solution</span></summary><div class="solution">${solution}</div></details></div>`;

  const page = (o, blocks) => {
    const eyebrow = o.parent
      ? `<a href="#${o.parent}">${o.parentTitle}</a><span class="sep">/</span>${o.num}`
      : `${o.label}${o.tag || ''}`;
    return `<section class="page" id="${o.id}" data-title="${esc(o.title)}" ${o.parent ? `data-parent="${o.parent}" data-sub="${o.num}"` : `data-number="${o.num}"`} hidden>` +
      `<p class="eyebrow">${eyebrow}</p><h1 class="display">${o.title}</h1>${o.lead ? `<p class="lead">${o.lead}</p>` : ''}${blocks.join('')}</section>`;
  };

  /* A whole module: landing page (what you will learn + section cards) and one page per section.
     spec: { id, prefix, num, title, lead, tag, learn: [], subs: [{ key, title, lead, blocks: [] }], extra: [] } */
  const module = (spec) => {
    const subId = (s) => `${spec.prefix}-${s.key}`;
    const cards = spec.subs.map((s, i) =>
      `<a class="card" href="#${subId(s)}"><div class="card-top"><span class="card-num">${spec.num}.${i + 1}</span></div><h3>${s.title}</h3><p>${s.lead}</p></a>`
    ).join('');
    const landing = page({ id: spec.id, num: spec.num, title: spec.title, lead: spec.lead, label: `Session ${spec.num} `, tag: spec.tag }, [
      block('What you will learn', '', list(spec.learn)),
      block('Sections', '', `<div class="cards">${cards}</div>`),
      ...(spec.extra || []),
    ]);
    const subs = spec.subs.map((s, i) =>
      page({ id: subId(s), parent: spec.id, parentTitle: spec.title, num: `${spec.num}.${i + 1}`, title: s.title, lead: s.lead }, s.blocks)
    );
    return [landing, ...subs].join('\n');
  };

  window.Ops = window.Ops || {};
  Ops.content = Ops.content || {};
  Ops.h = { esc, block, fig, code, table, list, steps, legend, callout, two, methods, groups, task, page, module };
})();
