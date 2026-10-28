/* Quiz: Advanced Stripe Concepts. A sub-section of the Quiz (6.11) that explains instead of asking.
   Its six topic pages (quiz-adv-1.js to quiz-adv-3.js) sit under it, like cURL Theory sits under Set Three.
   quiz.js adds Ops.advStripe to the Quiz module. */
(() => {
  const { block, steps, callout } = Ops.h;
  const topics = Ops.advTopics || [];
  const parent = 'adv-stripe';
  /* The twelve question sets before this one are 6.1 to 6.12, so this section is 6.13 */
  const num = '6.13';

  const cards = topics.map((t, i) =>
    `<a class="card" href="#s6-${t.key}"><div class="card-top"><span class="card-num">${num}.${i + 1}</span></div><h3>${t.title}</h3><p>${t.lead}</p></a>`).join('');

  Ops.advStripe = [
    { key: parent, title: 'Advanced Stripe Concepts',
      lead: 'Stripe explained, not quizzed: how money is counted, how requests, errors and retries work, how payments, refunds, disputes and payouts move, and the numbers to remember. Every fact shows the Stripe docs page it came from.',
      blocks: [
        block('How to use this section', 'The question sets above test you. These pages teach the ideas behind them.',
          steps([
            'Read one topic from top to bottom. Each block explains one idea, usually with a table or a short list',
            'Open the <strong>Source</strong> link under a block to see the exact Stripe docs page the fact came from',
            'Finish with <strong>Check yourself</strong>: say each answer out loud in your own words, then go back to the block if you got stuck',
            'Then try the question sets above and the docs practice sets',
          ]) +
          callout('amber', 'Checked on 2026-10-28', 'Every fact was read from docs.stripe.com on that date. Limits, timings and names can change, so open the source before you quote a number to a customer.')),
        block('Topics', '', `<div class="cards">${cards}</div>`),
      ] },
    ...topics.map((t, i) => ({
      key: t.key, under: parent, num: `${num}.${i + 1}`, noCard: true, title: t.title, lead: t.lead,
      head: `<div class="theory-actions"><a class="theory-btn" href="#s6-${parent}">Back to Advanced Stripe Concepts</a></div>`,
      blocks: t.blocks,
    })),
  ];
})();
