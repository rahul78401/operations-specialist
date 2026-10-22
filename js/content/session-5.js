/* Session 5: Debugging and Troubleshooting. */
(() => {
  const { block, fig, code, table, list, steps, legend, callout, two, task } = Ops.h;
  const subs = [];

  /* ---------- 5.1 Mindset ---------- */
  subs.push({
    key: 'mindset', title: 'The Troubleshooting Mindset', lead: 'Find where it broke before you change anything.',
    blocks: [
      block('Evidence first', 'Guessing and changing things can make a problem worse. Collect facts, then decide.',
        fig('flow', '', {
          items: [{ t: 'Understand', s: 'the report' }, { t: 'Collect', s: 'evidence' }, { t: 'Find the layer', s: 'where it broke' }, { t: 'Find the cause' }, { t: 'Fix or escalate', c: 'amber' }, { t: 'Confirm', s: 'it works', c: 'green' }],
          opts: { w: 124, gap: 18 },
        })),
      block('Start with five questions', '', steps([
        'What exactly is not working?',
        'Who is affected: one customer or many?',
        'When did it start? What changed?',
        'Can you make it happen again?',
        'What does the system say: error message, code, log?',
      ])),
      block('Do and don\'t', '',
        fig('panels', '', {
          left: { c: 'green', title: 'DO', items: ['Ask for time and IDs', 'Check logs before guessing', 'Change one thing at a time'] },
          right: { c: 'amber', title: 'DON\'T', items: ['Change things at random', 'Ask for passwords or keys', 'Say "fixed" before you check'] },
          arrow: false,
        })),
    ],
  });

  /* ---------- 5.2 Find the layer ---------- */
  subs.push({
    key: 'layer', title: 'Find the Layer', lead: 'Is it the frontend, the backend, the database or another company?',
    blocks: [
      block('The chain', 'A problem lives in one link. Find which one.',
        fig('flow', '', {
          items: [{ t: 'Frontend', s: 'What users see', c: 'green' }, { t: 'Backend', s: 'Logic and rules', c: 'amber' }, { t: 'Database', s: 'Stored data', c: 'gray' }, { t: 'Third party', s: 'Payments, email', c: 'gray' }],
          opts: { w: 150, gap: 44, bidir: true },
        })),
      block('Signs for each layer', '',
        table(['Layer', 'Signs'], [
          ['Frontend', 'Page looks broken, button does nothing, no request is sent'],
          ['Backend', 'Request sent, but the answer is an error (often 5xx)'],
          ['Database', 'Slow answers, "cannot connect", "duplicate" or "locked" messages'],
          ['Third party', 'Error mentions another company, or their status page shows a problem'],
        ])),
      block('Quick tests', '', list([
        'Does it fail for everyone or only one customer?',
        'Does it fail in the app and in Postman?',
        'Is the other company reporting an outage?',
        'Did anything change recently: release, key, setting?',
      ])),
    ],
  });

  /* ---------- 5.3 Logs and stack traces ---------- */
  subs.push({
    key: 'logs', title: 'Reading Logs and Stack Traces', lead: 'Logs are the system\'s diary. Learn to read one line.',
    blocks: [
      block('One log line', '',
        code('2026-10-12 14:32:07  ERROR  [req_8f21]  POST /orders/123/pay  500  Timeout calling payment provider (30s)', 'A log line') +
        table(['Part', 'Meaning'], [
          ['<code>2026-10-12 14:32:07</code>', 'When it happened'],
          ['<code>ERROR</code>', 'How serious it is'],
          ['<code>req_8f21</code>', 'Request ID: follow this one request'],
          ['<code>POST /orders/123/pay</code>', 'What was asked'],
          ['<code>500</code>', 'The result'],
          ['Message', 'The reason, in words'],
        ])),
      block('Log levels', '',
        table(['Level', 'Meaning'], [
          ['INFO', 'Normal activity'],
          ['WARN', 'Something odd, but it still worked'],
          ['ERROR', 'Something failed'],
        ])),
      block('A stack trace', 'It shows the path the code took when it failed. Read from the top.',
        code('Error: Cannot read property "email" of null\n    at sendReceipt (receipts.js:42)\n    at processOrder (orders.js:88)\n    at handler (routes.js:15)', 'Stack trace') +
        list([
          'The first line says what went wrong',
          'The next line says where it happened',
          'The lines below show how it got there',
          'Copy the first lines into your report. You do not need to fix the code',
        ])),
    ],
  });

  /* ---------- 5.4 HTTP vs database errors ---------- */
  subs.push({
    key: 'errors', title: 'HTTP Errors and Database Errors', lead: 'Two kinds of error messages, and what each one tells you.',
    blocks: [
      block('Two kinds', '',
        fig('panels', '', {
          left: { c: 'amber', title: 'HTTP ERROR', sub: 'About the request and reply', items: ['400, 401, 403, 404', '429 too many requests', '500, 502, 503, 504'] },
          right: { c: 'gray', title: 'DATABASE ERROR', sub: 'About stored data', items: ['Cannot connect', 'Duplicate record', 'Timeout or lock'] },
          arrow: false,
        })),
      block('Database messages in plain words', '',
        table(['Message says', 'It means'], [
          ['Connection refused or timeout', 'The app cannot reach the database'],
          ['Duplicate key or unique violation', 'The record already exists'],
          ['Deadlock or lock wait', 'Two actions are blocking each other'],
          ['Too many connections', 'The database is overloaded'],
          ['Query timeout', 'A question took too long to answer'],
        ])),
      block('One problem, two messages', 'A user may only see an HTTP 500. The log may show the database reason behind it.',
        fig('flow', 'Always look for the deeper message in the logs.', {
          items: [{ t: 'User sees', s: '500 error', c: 'green' }, { t: 'Backend log', s: 'Query timeout', c: 'amber' }, { t: 'Database', s: 'Slow and busy', c: 'gray' }],
          opts: { w: 160, gap: 56 },
        })),
    ],
  });

  /* ---------- 5.5 Request IDs, timestamps, payloads ---------- */
  subs.push({
    key: 'evidence', title: 'Request IDs, Timestamps and Payloads', lead: 'The three things that let you follow one request.',
    blocks: [
      block('Follow one request', 'The same request ID appears in every system it touches.',
        fig('flow', '', {
          items: [{ t: 'App log', s: 'req_8f21', c: 'green' }, { t: 'Backend log', s: 'req_8f21', c: 'amber' }, { t: 'Provider log', s: 'req_8f21', c: 'gray' }],
          opts: { w: 160, gap: 56, bidir: true },
        })),
      block('What to collect', '',
        table(['Item', 'Why it helps'], [
          ['Request ID', 'Find that exact request'],
          ['Time, with timezone', 'Find the right moment in the logs'],
          ['Payload (with secrets removed)', 'See what was actually sent'],
          ['Customer or order ID', 'See who was affected'],
          ['Status code and error message', 'See what went wrong'],
        ])),
      block('Be careful with data', '',
        two(callout('green', 'Safe to share', 'Request IDs, timestamps, error messages, order IDs.'),
          callout('amber', 'Remove first', 'Passwords, secret keys, full card numbers, personal details.'))),
    ],
  });

  /* ---------- 5.6 Timeouts and slow queries ---------- */
  subs.push({
    key: 'slow', title: 'Timeouts and Slow Queries', lead: 'Slow is also a problem. Learn what it means.',
    blocks: [
      block('Two words', '',
        table(['Word', 'Meaning'], [
          ['Slow (latency)', 'It works, but takes a long time'],
          ['Timeout', 'The caller stopped waiting'],
        ])),
      block('A timeout is not a failure', 'The work may have been done even if the answer never arrived.',
        fig('lostResponse') + callout('amber', 'Next step', 'Check the real status of the item before trying again.')),
      block('Why things are slow', '', table(['Cause', 'Sign'], [
        ['Slow database question', 'Only certain screens or reports are slow'],
        ['Too much data at once', 'Slower as the list grows'],
        ['Busy other company', 'Their status page shows delays'],
        ['Too many users at once', 'Slow at busy times of day'],
        ['Network problem', 'Random, short failures'],
      ])),
    ],
  });

  /* ---------- 5.7 Reproduce with Postman ---------- */
  subs.push({
    key: 'reproduce', title: 'Reproduce the Problem', lead: 'If you can make it happen again, you can find the cause.',
    blocks: [
      block('Why reproduce?', 'It proves the problem is real, shows what triggers it, and lets you check the fix.'),
      block('Steps', '',
        fig('flow', '', {
          items: [{ t: 'Copy', s: 'the failing request' }, { t: 'Remove', s: 'secrets' }, { t: 'Send it', s: 'in Postman, test mode' }, { t: 'Compare', s: 'with the report' }, { t: 'Change one thing', c: 'amber' }],
          opts: { w: 150, gap: 24 },
        })),
      block('Stay safe', '', list([
        'Use a test or sandbox environment when you can',
        'Never repeat a payment or refund on live data to "see what happens"',
        'Use your own test credentials, not the customer\'s',
        'Write down what you sent and what came back',
      ])),
    ],
  });

  /* ---------- 5.8 Investigating an HTTP 500 ---------- */
  subs.push({
    key: 'http500', title: 'Investigating an HTTP 500', lead: 'A worked example, step by step.',
    blocks: [
      block('What a 500 means', 'The server hit an unexpected problem. It does not say what. The logs do.'),
      block('The steps', '',
        fig('flow', '', {
          items: ['Get the details', 'Check scope', 'Find the log line', 'Read the cause', 'Reproduce', 'Fix or escalate'].map((t, i) => ({ t, c: i === 5 ? 'green' : '' })),
          opts: { w: 124, gap: 18 },
        })),
      block('In detail', '', steps([
        'Get the endpoint, time, request ID and what the user was doing',
        'Is it one customer, or everyone? Did it start after a change?',
        'Search the logs for the request ID, then read the error line and stack trace',
        'Decide the layer: our code, database or a third party?',
        'Try to reproduce it safely in a test environment',
        'Fix it if it is yours to fix. Otherwise escalate with the evidence',
        'Tell the customer in plain words, and confirm it works afterwards',
      ])),
      block('An escalation note', 'Short, specific and easy to act on.',
        code('Summary:   POST /orders/123/pay returns 500\nTime:      2026-10-12 14:32 UTC\nRequest:   req_8f21\nAffected:  about 12 customers since 14:20\nFound:     log says "Timeout calling payment provider (30s)"\nChecked:   provider status page is normal, no recent release\nAsk:       Please check the provider connection and timeout setting', 'Template')),
    ],
  });

  /* ---------- 5.9 Tasks ---------- */
  subs.push({
    key: 'tasks', title: 'Tasks', lead: 'Try each task first. Open the solution only after you have an answer.',
    blocks: [
      task(1, 'An HTTP 500', 'An endpoint returns HTTP 500. Explain how you investigate step by step, without changing code.', '',
        steps(['Get the endpoint, time, request ID and the user\'s action', 'Check how many users are affected, and when it started', 'Find the log lines for that request ID', 'Read the error message and stack trace', 'Decide the layer: backend, database or third party', 'Reproduce safely if you can', 'Fix it if it is yours, or escalate with the evidence'])),
      task(2, 'Which layer?', 'Name the likely layer. (a) A button does nothing and no request is sent. (b) The reply says "payment provider unavailable". (c) Reports are slow only when searching old orders.', '',
        table(['Case', 'Likely layer'], [
          ['(a)', 'Frontend: nothing was sent'],
          ['(b)', 'Third party: the payment provider'],
          ['(c)', 'Database: a slow question over lots of data'],
        ])),
      task(3, 'Read the log line', 'Read this line. What happened, when, and to which request?',
        code('2026-10-12 14:32:07  ERROR  [req_8f21]  POST /orders/123/pay  500  Timeout calling payment provider (30s)', 'Log line'),
        '<p><strong>When:</strong> 12 October 2026, 14:32:07.</p><p><strong>Which request:</strong> <code>req_8f21</code>, a payment for order 123.</p><p><strong>What happened:</strong> our server waited 30 seconds for the payment provider, got no answer, and returned a 500.</p><p><strong>Layer:</strong> the connection to a third party. Check their status page and the connection.</p>'),
      task(4, 'HTTP or database?', 'Is each message an HTTP error or a database error? (a) 503 (b) Deadlock detected (c) 429 (d) Duplicate key', '',
        table(['Message', 'Kind'], [
          ['503', 'HTTP: service unavailable'],
          ['Deadlock detected', 'Database: two actions blocked each other'],
          ['429', 'HTTP: too many requests'],
          ['Duplicate key', 'Database: the record already exists'],
        ])),
      task(5, 'What do you collect?', 'A customer says "checkout is broken". List five things you collect before escalating.', '',
        list(['The time, with timezone', 'The request ID or order ID', 'The exact error message', 'What the customer did, step by step', 'Whether others are affected'])),
      task(6, 'The timeout', 'A payment request timed out. The customer wants to click Pay again. What do you tell them?', '',
        '<p>Please do not click again yet. The first payment may have gone through. We will check its real status first. If it did not go through, we will tell you and you can try again.</p><p>Then check the real status in the provider, and only retry if no payment exists.</p>'),
      task(7, 'Safe to share?', 'Which can you put in a ticket? (a) Request ID (b) Secret key (c) Error message (d) Full card number (e) Timestamp', '',
        table(['Item', 'Share?'], [
          ['Request ID', 'Yes'],
          ['Secret key', 'No. Never'],
          ['Error message', 'Yes'],
          ['Full card number', 'No. Never'],
          ['Timestamp', 'Yes'],
        ])),
      task(8, 'Write the escalation', 'Many users get errors on a payment page since 14:20. Logs say "Timeout calling payment provider". Write a short note for the engineers.', '',
        code('Summary:   Payment page errors since 14:20 UTC\nAffected:  many customers\nFound:     logs say "Timeout calling payment provider"\nChecked:   provider status page, recent releases\nExample:   req_8f21\nAsk:       Please check the provider connection and timeout', 'Sample note')),
    ],
  });

  Ops.content['session-5'] = Ops.h.module({
    id: 'session-5', prefix: 's5', num: 5, title: 'Debugging and Troubleshooting',
    lead: 'When something breaks, find where it broke before you change anything. Collect evidence, then act.',
    learn: [
      'Reading application logs and stack traces',
      'HTTP errors versus database errors',
      'Reproducing bugs using Postman',
      'Checking request IDs, timestamps and payloads',
      'Understanding timeouts and slow queries',
      'Separating frontend, backend and third-party API issues',
    ],
    subs,
  });
})();
