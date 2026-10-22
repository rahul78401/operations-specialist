/* Session 4: API Integrations and Webhooks. */
(() => {
  const { block, fig, code, table, list, steps, legend, callout, task } = Ops.h;
  const subs = [];

  /* ---------- 4.1 How applications exchange data ---------- */
  subs.push({
    key: 'exchange', title: 'How Applications Exchange Data', lead: 'Products are built from many apps that talk to each other.',
    blocks: [
      block('What is an integration?', 'An integration connects two apps so they can share data. For example, an online store, a payment provider and an email service.',
        fig('flow', 'Each app uses the API of the others.', {
          items: [{ t: 'Online store', s: 'Your app', c: 'green' }, { t: 'Payment provider', s: 'Takes the money', c: 'amber' }, { t: 'Email service', s: 'Sends receipts', c: 'gray' }],
          opts: { bidir: true, w: 170, gap: 50 },
        })),
      block('One request, step by step', 'Every call follows the same path.',
        fig('flow', '', {
          items: [{ t: 'Build', s: 'the request' }, { t: 'Send', s: 'to the other app' }, { t: 'Check', s: 'who is calling' }, { t: 'Process', s: 'the work', c: 'amber' }, { t: 'Reply', s: 'with a response' }, { t: 'Read', s: 'the reply', c: 'green' }],
          opts: { w: 124, gap: 18 },
        })),
      block('Where it can go wrong', 'Each step can fail in its own way.',
        table(['Step', 'What can go wrong'], [
          ['Build', 'Missing or wrong data in the request'],
          ['Send', 'Network problem, wrong address'],
          ['Check', 'Wrong or expired key, no permission'],
          ['Process', 'The other app has a problem, or says no'],
          ['Reply', 'Slow reply, lost reply'],
          ['Read', 'Our app misreads the answer'],
        ])),
    ],
  });

  /* ---------- 4.2 Webhooks vs polling ---------- */
  subs.push({
    key: 'webhooks', title: 'Webhooks and Polling', lead: 'Two ways to find out that something happened.',
    blocks: [
      block('Ask, or be told', '', fig('webhookVsPolling')),
      block('Compare them', '',
        table(['', 'Polling', 'Webhook'], [
          ['Who starts it', 'Your app keeps asking', 'The provider calls you'],
          ['Speed', 'Only as fast as your next check', 'Almost at once'],
          ['Wasted work', 'Many checks find nothing new', 'Only runs when something happens'],
          ['Risk', 'Checking too often can hit rate limits', 'A missed call can mean a missed event'],
        ])),
      block('Most providers use both', 'Webhooks tell you quickly. A check later confirms nothing was missed.',
        callout('green', 'Good habit', 'If a webhook looks missing, ask the provider for the current status of the item. Do not just wait.')),
    ],
  });

  /* ---------- 4.3 Payment example ---------- */
  subs.push({
    key: 'payment', title: 'Example: A Payment Notification', lead: 'How a payment provider tells your system that a payment worked.',
    blocks: [
      block('The path', '',
        fig('flow', '', {
          items: [{ t: 'Customer pays', c: 'green' }, { t: 'Provider', s: 'confirms the payment', c: 'amber' }, { t: 'Webhook', s: 'sent to your system' }, { t: 'Your system', s: 'checks it is real' }, { t: 'Order', s: 'marked as paid', c: 'green' }],
          opts: { w: 150, gap: 24 },
        })),
      block('Why not just trust the customer\'s browser?', 'A customer can close the page, lose signal, or fake a message. The provider\'s notification is the reliable source.'),
      block('What your system should do', '', list([
        'Check the message really came from the provider',
        'Check the data makes sense',
        'Update the order once',
        'Reply quickly with "received"',
      ])),
      block('What can go wrong', '',
        table(['Problem', 'What you see'], [
          ['Notification never arrives', 'Customer paid, order still unpaid'],
          ['Notification arrives twice', 'Two emails, or stock reduced twice'],
          ['Notification fails the check', 'Rejected, order not updated'],
          ['Your system is down', 'Provider keeps retrying, then gives up'],
        ])),
    ],
  });

  /* ---------- 4.4 Checking the data ---------- */
  subs.push({
    key: 'payload', title: 'Checking the Data', lead: 'Before using data from another app, make sure it is right.',
    blocks: [
      block('What is validation?', 'Checking that the data is complete and sensible before using it. This protects your system from bad or broken data.'),
      block('What to check', '',
        legend([
          ['', 'Present', 'Are the needed fields there?'],
          ['', 'Right type', 'A number where a number is expected'],
          ['', 'Sensible', 'An amount that is not negative'],
          ['', 'Right owner', 'It belongs to this customer'],
          ['', 'Trusted', 'It really came from the provider'],
          ['', 'Not old', 'It is not a stale or repeated message'],
        ])),
      block('A bad example', 'The amount is text, the currency is missing and the order ID is empty.',
        code('{\n  "order_id": "",\n  "amount": "fifteen",\n  "status": "paid"\n}', 'Payload that should be rejected', 'json')),
      block('What you notice in practice', '',
        table(['Sign', 'Likely cause'], [
          ['Many rejected messages after a release', 'The provider changed the format'],
          ['One customer\'s messages always fail', 'Strange data in that customer\'s record'],
          ['A field is empty', 'Not provided, or not applicable'],
        ])),
    ],
  });

  /* ---------- 4.5 Pagination ---------- */
  subs.push({
    key: 'pagination', title: 'Large Lists and Pagination', lead: 'Big lists arrive in pieces. Make sure you get all pieces.',
    blocks: [
      block('Why pages?', 'Sending a million records at once would be slow. APIs send a page at a time.',
        fig('flow', 'The reply says whether there is a next page.', {
          items: [{ t: 'Page 1', s: 'first 100' }, { t: 'Page 2', s: 'next 100' }, { t: 'Page 3', s: 'next 100' }, { t: 'Last page', s: 'no more', c: 'green' }],
          opts: { w: 140, gap: 36 },
        })),
      block('What goes wrong', '',
        table(['Problem', 'Result'], [
          ['Only the first page is read', 'Records look missing'],
          ['A page is read twice', 'Duplicate records'],
          ['Too many requests too fast', 'Rate limit error (429)'],
          ['Data changes while paging', 'Some items skipped or repeated'],
        ])),
      block('When records look missing', '', steps([
        'Did the system read every page?',
        'Is the last page marked as the last?',
        'Did a filter or date range hide the record?',
        'Is it the right account and the right mode (test or live)?',
      ])),
    ],
  });

  /* ---------- 4.6 Duplicates and idempotency ---------- */
  subs.push({
    key: 'duplicates', title: 'Duplicates and Idempotency', lead: 'The same request or event must not be processed twice.',
    blocks: [
      block('Why duplicates happen', 'Networks are not perfect. A request may be sent again, or a notification delivered twice.',
        fig('lostResponse', 'The server did the work, but the answer was lost. The app may try again.')),
      block('Idempotency in simple words', 'Doing the same thing twice has the same result as doing it once.',
        fig('panels', '', {
          left: { c: 'amber', title: 'WITHOUT PROTECTION', sub: 'The retry is treated as new', items: ['Customer charged twice', 'Two orders created', 'Two receipts sent'] },
          right: { c: 'green', title: 'WITH PROTECTION', sub: 'The retry is recognised', items: ['One charge', 'One order', 'One receipt'] },
          arrow: false,
        })),
      block('How systems protect themselves', '',
        table(['Method', 'How it works'], [
          ['Idempotency key', 'The sender adds a unique key. The same key returns the same result'],
          ['Event ID', 'The receiver remembers each event ID and skips repeats'],
          ['Status check', 'Look at the current status before doing the work again'],
        ])),
      block('How to spot a duplicate', '', list([
        'Same customer, same amount, seconds apart',
        'Same event ID seen twice in the logs',
        'Two orders with one payment ID',
      ])),
    ],
  });

  /* ---------- 4.7 Retries and failed integrations ---------- */
  subs.push({
    key: 'retries', title: 'Retries and Failed Integrations', lead: 'What to do when a connection between two apps fails.',
    blocks: [
      block('Try again, but wisely', 'Wait a little, then wait longer after each failure.', fig('backoff')),
      block('Which failures are worth retrying?', '',
        table(['Failure', 'Retry?'], [
          ['Timeout, 502, 503, 504', 'Yes, after waiting'],
          ['429 Too Many Requests', 'Yes, after the wait time given'],
          ['400 Bad Request', 'No. Fix the request first'],
          ['401 or 403', 'No. Fix the key or permission first'],
        ]) + callout('amber', 'Never retry blindly', 'The first try may have worked. Check the real status before sending again.')),
      block('When all retries fail', '', steps([
        'Note which items failed and when',
        'Find the cause: network, key, data or the other app',
        'Fix the cause',
        'Send the failed items again, once each',
        'Confirm the final result matches on both sides',
      ])),
    ],
  });

  /* ---------- 4.8 Tasks ---------- */
  subs.push({
    key: 'tasks', title: 'Tasks', lead: 'Try each task first. Open the solution only after you have an answer.',
    blocks: [
      task(1, 'Pay, then notify', 'Explain how a payment provider tells your system that a payment worked, and how you stop it being processed twice.', '',
        steps(['The customer pays. The provider confirms the payment', 'The provider sends a webhook to your system', 'Your system checks the message is real', 'Your system updates the order', 'It saves the event ID. If the same ID comes again, it skips it', 'It replies "received" so the provider stops retrying'])),
      task(2, 'Polling or webhook?', 'Which is better when you need to know quickly that a payment succeeded? Why?', '',
        '<p><strong>A webhook.</strong> The provider tells you at once, so there is no waiting and no wasted checks. It is wise to confirm the status later, in case a webhook was missed.</p>'),
      task(3, 'Paid, but unpaid', 'A customer paid, but your system shows the order unpaid. What do you check?', '',
        steps(['Does the provider show the payment as successful?', 'Did the provider send a webhook? Check its delivery attempts', 'What did our system reply? An error means the delivery failed', 'Was the message rejected by the check (wrong secret, wrong mode)?', 'Fix the cause, resend the event, and confirm the order updates once'])),
      task(4, 'Records look missing', 'A report from an API shows 100 orders, but you expected 450. What could explain it?', '',
        list(['Only the first page was read', 'A filter or date range hid records', 'Wrong account or wrong mode (test or live)', 'A rate limit stopped the reading part way'])),
      task(5, 'Charged twice', 'A customer says they were charged twice. How do you investigate?', '',
        steps(['Find both payments. Compare time, amount and customer', 'Check the request IDs. Were they two separate requests?', 'Look for a timeout or retry just before the second payment', 'Check whether a protection key was used', 'If it is a true duplicate, refund one and report the cause to the team'])),
      task(6, 'Should we retry?', 'Decide: retry or not? (a) 503 error (b) 401 error (c) timeout on a payment (d) 400 error.', '',
        table(['Case', 'Retry?', 'Why'], [
          ['503', 'Yes, after waiting', 'The other app is busy for a moment'],
          ['401', 'No', 'The key is wrong. Fix it first'],
          ['Timeout on a payment', 'Check first', 'It may have worked. Look at the real status, then retry only with protection'],
          ['400', 'No', 'The request is wrong. Fix it first'],
        ])),
      task(7, 'Spot the bad data', 'Why should this message be rejected? <code>order_id: ""</code>, <code>amount: "fifteen"</code>, no currency.', '',
        list(['The order ID is empty, so we cannot find the order', 'The amount is text, not a number', 'The currency is missing, so the amount has no meaning'])),
      task(8, 'Explain it simply', 'Explain idempotency to a new colleague in two sentences.', '',
        callout('green', 'Sample answer', 'Idempotency means that doing the same request twice has the same result as doing it once. It stops a retry or a repeated message from charging a customer twice.')),
    ],
  });

  Ops.content['session-4'] = Ops.h.module({
    id: 'session-4', prefix: 's4', num: 4, title: 'API Integrations and Webhooks',
    lead: 'Products are made of several apps that exchange data. Learn how that works, and what to do when it fails.',
    learn: [
      'How two different applications exchange data',
      'API request and response lifecycle',
      'Webhooks versus polling',
      'JSON payload validation',
      'Pagination when fetching large datasets',
      'Duplicate requests and idempotency',
      'Retry logic and handling failed integrations',
    ],
    subs,
  });
})();
