/* Session 2: Stripe. */
(() => {
  const { block, fig, code, table, list, steps, legend, callout, groups, task } = Ops.h;
  const raw = String.raw;
  const subs = [];

  /* ---------- 2.1 Overview and API basics ---------- */
  subs.push({
    key: 'overview', title: 'Overview and API Basics', lead: 'What Stripe does, and what its API looks like.',
    blocks: [
      block('What Stripe does', 'Payment infrastructure. Businesses use Stripe\'s APIs and tools to accept payments, manage customers and issue refunds.',
        fig('flow', '', {
          items: [{ t: 'Customer', s: 'Pays', c: 'green' }, { t: 'Business', s: 'Website or app', c: 'green' }, { t: 'Stripe', s: 'API + Dashboard', c: 'amber' }, { t: 'Banks', s: 'Card networks and banks', c: 'gray' }],
          opts: { bidir: true, w: 160, gap: 40 },
        })),
      block('Four areas to learn', '', legend([
        ['', '1. API', 'Endpoints, keys, parameters, JSON, test mode'],
        ['', '2. Payments', 'Create, confirm, authorize, capture, succeed or fail'],
        ['', '3. Webhooks', 'How a business learns what happened'],
        ['', '4. Operations', 'Failures, duplicates, refunds, disputes'],
      ], 2)),
      block('The API at a glance', '',
        table(['What', 'Detail'], [
          ['Base URL', '<code>https://api.stripe.com/v1</code>'],
          ['Authentication', 'Secret key (HTTP Basic, or Bearer)'],
          ['Requests', 'Form-encoded, not JSON'],
          ['Responses', 'JSON'],
          ['Amounts', 'Smallest currency unit'],
          ['Modes', 'Test and live: separate keys and data'],
        ])),
      block('Amounts', 'Stripe amounts are whole numbers in the smallest unit of the currency.',
        table(['Amount', 'Currency', 'Means'], [
          ['<code>1500</code>', '<code>usd</code>', '$15.00'],
          ['<code>1500</code>', '<code>inr</code>', '&#8377;15.00 (not &#8377;1,500)'],
          ['<code>1500</code>', '<code>jpy</code>', '&yen;1,500 (no decimals)'],
        ]) + callout('amber', 'Always check the currency', 'The same number means different money in different currencies.')),
      block('Object IDs', 'The prefix tells you what an ID is.', legend([
        ['', 'pi_', 'PaymentIntent'], ['', 'cus_', 'Customer'], ['', 'pm_', 'PaymentMethod'], ['', 'ch_', 'Charge'],
        ['', 're_', 'Refund'], ['', 'evt_', 'Event'], ['', 'dp_', 'Dispute'], ['', 'req_', 'API request'],
      ], 4)),
      block('Your first call', 'Use a test key. The colon after the key means "no password".',
        code(raw`curl https://api.stripe.com/v1/payment_intents/pi_123 \
  -u sk_test_YOUR_KEY:`, 'Retrieve a PaymentIntent (test mode)') +
        '<p class="line">Official docs: <a href="https://docs.stripe.com/api" target="_blank" rel="noopener">API reference</a> and <a href="https://docs.stripe.com/payments" target="_blank" rel="noopener">Payments</a>.</p>'),
    ],
  });

  /* ---------- 2.2 Payments and PaymentIntent ---------- */
  subs.push({
    key: 'payments', title: 'Payments and PaymentIntent', lead: 'One object follows a payment from start to finish.',
    blocks: [
      block('How a payment is made', '',
        fig('flow', '', {
          items: [{ t: 'Create', s: 'PaymentIntent (server)', c: 'amber' }, { t: 'Collect', s: 'Customer enters details', c: 'green' }, { t: 'Confirm', s: 'Stripe.js or an SDK', c: 'green' }, { t: 'Process', s: 'Stripe and the bank' }, { t: 'Result', s: 'succeeded or failed' }],
          opts: { w: 150, gap: 24 },
        })),
      block('The PaymentIntent', 'It tracks the whole payment. Its status tells you where it is.',
        fig('intentLifecycle', 'Not every payment goes through every status.')),
      block('Statuses', '',
        table(['Status', 'Meaning'], [
          ['<code>requires_payment_method</code>', 'Needs a way to pay (also after a failed attempt)'],
          ['<code>requires_confirmation</code>', 'Has a method, not yet confirmed'],
          ['<code>requires_action</code>', 'Customer must do something, such as 3D Secure'],
          ['<code>processing</code>', 'Being processed'],
          ['<code>requires_capture</code>', 'Authorized. Money not yet taken'],
          ['<code>succeeded</code>', 'Paid'],
          ['<code>canceled</code>', 'Cancelled before it succeeded'],
        ])),
      block('Stages are separate', '',
        table(['Stage', 'Meaning'], [
          ['Create', 'The PaymentIntent exists, with amount and currency'],
          ['Confirm', 'Payment details are submitted'],
          ['Authorize', 'The bank agrees to hold the money'],
          ['Capture', 'The money is actually taken'],
          ['Succeed or fail', 'The final outcome'],
        ]) + callout('amber', 'Automatic or manual capture', 'Capture is usually automatic. With manual capture you capture later, and an old authorization can expire.')),
      block('Create one (test mode)', '',
        code(raw`curl https://api.stripe.com/v1/payment_intents \
  -u sk_test_YOUR_KEY: \
  -d amount=1500 \
  -d currency=usd \
  -d "automatic_payment_methods[enabled]=true"`, 'POST /v1/payment_intents')),
    ],
  });

  /* ---------- 2.3 Payment methods ---------- */
  subs.push({
    key: 'methods', title: 'Payment Methods', lead: 'How customers pay, and how to test it.',
    blocks: [
      block('Ways to pay', 'What is available depends on country, currency and account settings.', legend([
        ['', 'Cards', 'Credit and debit'], ['', 'Wallets', 'Apple Pay, Google Pay'], ['', 'Bank debits', 'And bank transfers'],
        ['', 'Buy now, pay later', 'Pay in instalments'], ['', 'Local methods', 'Vary by country'], ['', 'More', 'See the docs'],
      ])),
      block('PaymentMethod', 'A way to pay is a <code>PaymentMethod</code> (<code>pm_...</code>). With Stripe\'s tools, such as Checkout and Elements, Stripe collects the card details so your server never handles raw card numbers.'),
      block('3D Secure', 'Some payments need the customer to verify with their bank. The PaymentIntent waits in <code>requires_action</code> until they do.'),
      block('Test cards', 'Test mode only. Use any future expiry date and any CVC.',
        table(['Card number', 'Result'], [
          ['<code>4242 4242 4242 4242</code>', 'Succeeds'],
          ['<code>4000 0000 0000 0002</code>', 'Declined'],
          ['<code>4000 0000 0000 9995</code>', 'Declined: insufficient funds'],
          ['<code>4000 0025 0000 3155</code>', 'Needs authentication (3D Secure)'],
        ])),
    ],
  });

  /* ---------- 2.4 Keys, permissions, test vs live ---------- */
  subs.push({
    key: 'keys', title: 'Keys, Permissions and Modes', lead: 'Which key does what, and which mode you are in.',
    blocks: [
      block('API keys', '',
        table(['Key', 'Starts with', 'Use'], [
          ['Publishable', '<code>pk_</code>', 'Safe in browsers and apps'],
          ['Secret', '<code>sk_</code>', 'Server only. Never share'],
          ['Restricted', '<code>rk_</code>', 'Limited permissions'],
          ['Webhook signing secret', '<code>whsec_</code>', 'Verify webhook signatures'],
        ]) + callout('amber', 'Never paste a live secret key', 'Not into tickets, chats, screenshots or code repositories.')),
      block('Access errors', '',
        fig('panels', '', {
          left: { c: 'green', title: '401: KEY PROBLEM', sub: 'Stripe cannot accept the key', items: ['No key sent', 'Typo, or a deleted key', 'Key was rolled or revoked'] },
          right: { c: 'amber', title: '403: PERMISSION PROBLEM', sub: 'Valid key, but not allowed', items: ['Restricted key lacks a permission', 'Read-only key used to write', 'Action not allowed for this key'] },
          arrow: false,
        })),
      block('Test vs live', '',
        fig('panels', '', {
          left: { c: 'green', title: 'TEST MODE', sub: 'Fake money. Safe to try.', items: ['Keys start sk_test_', 'Test cards such as 4242...', 'No real charges'] },
          right: { c: 'amber', title: 'LIVE MODE', sub: 'Real money and real customers', items: ['Keys start sk_live_', 'Real cards', 'Real charges and refunds'] },
          arrow: false,
        }) + callout('green', 'Check the mode first', 'An object exists in one mode only. A "no such payment" error is often just the wrong mode, or the wrong account.')),
    ],
  });

  /* ---------- 2.5 Payment failures ---------- */
  subs.push({
    key: 'failures', title: 'Payment Failures', lead: 'Tell a declined card from an API error.',
    blocks: [
      block('Two kinds of failure', '',
        fig('panels', '', {
          left: { c: 'amber', title: 'CARD DECLINED', sub: 'The bank said no (card_error)', items: ['Insufficient funds', 'Expired card', 'Wrong security code'] },
          right: { c: 'gray', title: 'REQUEST OR API ERROR', sub: 'The request itself had a problem', items: ['Missing or invalid parameter', 'Bad or missing key', 'Rate limit, or an error on Stripe\'s side'] },
          arrow: false,
        })),
      block('The error object', '',
        code('{\n  "error": {\n    "type": "card_error",\n    "code": "card_declined",\n    "decline_code": "insufficient_funds",\n    "message": "Your card has insufficient funds."\n  }\n}', 'Error response (trimmed)', 'json') +
        table(['Field', 'Meaning'], [
          ['<code>type</code>', 'The kind of error'],
          ['<code>code</code>', 'A short machine-readable reason'],
          ['<code>decline_code</code>', 'Why the bank declined (card errors)'],
          ['<code>message</code>', 'A human-readable explanation'],
          ['<code>param</code>', 'Which parameter was wrong, if any'],
        ])),
      block('Error types', '',
        table(['Type', 'Meaning'], [
          ['<code>card_error</code>', 'The card was declined or invalid'],
          ['<code>invalid_request_error</code>', 'Invalid parameters or request'],
          ['<code>api_error</code>', 'Something went wrong on Stripe\'s side'],
          ['<code>idempotency_error</code>', 'An idempotency key was misused'],
        ])),
      block('Status codes Stripe uses', '',
        table(['Code', 'Meaning'], [
          ['<code>200</code>', 'OK'],
          ['<code>400</code>', 'Bad request, often a missing parameter'],
          ['<code>401</code>', 'No valid API key'],
          ['<code>402</code>', 'Parameters were valid but the request failed, such as a card decline'],
          ['<code>403</code>', 'The key lacks permission'],
          ['<code>404</code>', 'The resource does not exist'],
          ['<code>409</code>', 'Conflicts with another request, for example a reused idempotency key'],
          ['<code>429</code>', 'Too many requests'],
          ['<code>5xx</code>', 'An error on Stripe\'s end'],
        ])),
      block('What to tell the customer', '',
        table(['Code', 'In plain English'], [
          ['<code>generic_decline</code>', 'The bank declined it. Try another card, or call the bank'],
          ['<code>insufficient_funds</code>', 'Not enough balance or credit'],
          ['<code>expired_card</code>', 'The card has expired'],
          ['<code>incorrect_cvc</code>', 'The security code is wrong'],
          ['<code>authentication_required</code>', 'The customer must verify with their bank'],
        ])),
      block('Investigate a failure', '',
        fig('flow', '', {
          items: [{ t: 'Find the ID', s: 'pi_...' }, { t: 'Read the error', s: 'last_payment_error' }, { t: 'Check the codes', s: 'code, decline_code' }, { t: 'Explain', s: 'in plain words' }, { t: 'Next step', s: 'retry, other card', c: 'green' }],
          opts: { w: 140, gap: 30 },
        })),
    ],
  });

  /* ---------- 2.6 Webhooks ---------- */
  subs.push({
    key: 'webhooks', title: 'Webhooks', lead: 'How Stripe tells a business what happened.',
    blocks: [
      block('Ask, or be told', 'Payments finish after your request returns, so Stripe sends an event when the status changes.',
        fig('webhookVsPolling')),
      block('The path of an event', '',
        fig('flow', '', {
          items: [{ t: 'Stripe event', s: 'payment_intent.succeeded', c: 'amber' }, { t: 'Your endpoint', s: 'POST /webhooks', c: 'green' }, { t: 'Verify', s: 'Stripe-Signature' }, { t: 'Process once', s: 'skip repeats' }, { t: 'Reply 2xx', s: 'quickly', c: 'green' }],
          opts: { w: 150, gap: 24 },
        })),
      block('Events you will see', '',
        table(['Event', 'Means'], [
          ['<code>payment_intent.succeeded</code>', 'A payment succeeded'],
          ['<code>payment_intent.payment_failed</code>', 'A payment attempt failed'],
          ['<code>charge.refunded</code>', 'A charge was refunded'],
          ['<code>charge.dispute.created</code>', 'A customer disputed a charge'],
        ])),
      block('What an event looks like', '',
        code('{\n  "id": "evt_123",\n  "type": "payment_intent.succeeded",\n  "data": {\n    "object": {\n      "id": "pi_123",\n      "status": "succeeded"\n    }\n  }\n}', 'Event (trimmed)', 'json')),
      block('Rules for the receiver', '', list([
        'Verify the <code>Stripe-Signature</code> header with your endpoint secret (<code>whsec_...</code>)',
        'Reply 2xx quickly, then do the slow work',
        'Events can arrive more than once: store the <code>evt_</code> ID and skip repeats',
        'Events can arrive out of order: fetch the current object when unsure',
        'Stripe retries failed deliveries (in live mode, for up to three days)',
      ])),
      block('A webhook is missing', 'Check in this order:', steps([
        'Is an endpoint registered, with the right URL?',
        'Is it the right mode, test or live?',
        'Is this event type selected for the endpoint?',
        'What did your server reply? Anything other than 2xx counts as failed',
        'Is the signing secret correct?',
        'Look at the delivery attempts in the Dashboard',
      ])),
      block('Test on your computer', 'The Stripe CLI forwards events to a local server.',
        code('stripe listen --forward-to localhost:4242/webhook\nstripe trigger payment_intent.succeeded', 'Stripe CLI')),
    ],
  });

  /* ---------- 2.7 Refunds ---------- */
  subs.push({
    key: 'refunds', title: 'Refunds', lead: 'Money going back to the customer.',
    blocks: [
      block('Life of a refund', '',
        fig('flow', '', {
          items: [{ t: 'Requested', s: 'Dashboard or API' }, { t: 'Refund created', s: 're_...', c: 'amber' }, { t: 'Status', s: 'pending, then succeeded' }, { t: 'Customer\'s bank', s: 'Takes time to show', c: 'gray' }],
          opts: { w: 160, gap: 40 },
        })),
      block('Refund statuses', '',
        table(['Status', 'Meaning'], [
          ['<code>pending</code>', 'Being processed'],
          ['<code>requires_action</code>', 'Needs action to continue'],
          ['<code>succeeded</code>', 'Refund sent'],
          ['<code>failed</code>', 'The refund could not be completed'],
          ['<code>canceled</code>', 'The refund was cancelled'],
        ])),
      block('Create a refund', 'Leave out <code>amount</code> to refund everything. Partial refunds are allowed.',
        code(raw`curl https://api.stripe.com/v1/refunds \
  -u sk_test_YOUR_KEY: \
  -d payment_intent=pi_123 \
  -d amount=500`, 'POST /v1/refunds')),
      block('When a refund will not work', '', list([
        'The payment has not succeeded or been captured',
        'It has already been fully refunded',
        'The amount is more than what is left',
        'The refund failed, for example because the card was closed',
      ]) + callout('amber', 'Do not promise a date', 'A succeeded refund does not mean the money is on the customer\'s statement yet. Banks need time.')),
    ],
  });

  /* ---------- 2.8 Disputes ---------- */
  subs.push({
    key: 'disputes', title: 'Disputes and Chargebacks', lead: 'When a customer asks their bank to reverse a payment.',
    blocks: [
      block('Refund or dispute?', '',
        fig('panels', '', {
          left: { c: 'green', title: 'REFUND', sub: 'You choose to return money', items: ['Started by the business', 'Money goes back to the customer', 'No evidence needed'] },
          right: { c: 'amber', title: 'DISPUTE', sub: 'The customer\'s bank reverses it', items: ['Started by the customer\'s bank', 'The amount is withdrawn at once', 'You respond with evidence'] },
          arrow: false,
        })),
      block('Life of a dispute', '',
        fig('flow', '', {
          items: [{ t: 'Customer disputes', s: 'Asks their bank' }, { t: 'You are notified', s: 'charge.dispute.created', c: 'amber' }, { t: 'Money held', s: 'A fee may apply' }, { t: 'You respond', s: 'Evidence, by the deadline', c: 'green' }, { t: 'Bank decides', s: 'Won or lost', c: 'gray' }],
          opts: { w: 150, gap: 24 },
        })),
      block('Dispute statuses', '',
        table(['Status', 'Meaning'], [
          ['<code>needs_response</code>', 'You need to submit evidence'],
          ['<code>under_review</code>', 'The bank is reviewing it'],
          ['<code>won</code>', 'Decided in your favour'],
          ['<code>lost</code>', 'Decided in the customer\'s favour'],
        ])),
      block('What to do', '', steps([
        'Note the response deadline',
        'Gather evidence: receipt, proof of delivery, customer messages, your policy',
        'Submit it before the deadline',
        'Watch the status',
      ]) + callout('amber', 'Deadline', 'Missing the deadline usually means losing the dispute.')),
    ],
  });

  /* ---------- 2.9 Idempotency ---------- */
  subs.push({
    key: 'idempotency', title: 'Idempotency', lead: 'Retry safely without charging twice.',
    blocks: [
      block('The problem', 'A timeout does not prove the payment failed. Without protection, a retry could charge the customer twice.',
        fig('lostResponse')),
      block('The fix', 'Send an idempotency key. Stripe recognises the retry as the same operation.',
        fig('idempotency')),
      block('Send the key', '',
        code(raw`curl https://api.stripe.com/v1/payment_intents \
  -u sk_test_YOUR_KEY: \
  -H "Idempotency-Key: order-1042-attempt-1" \
  -d amount=1500 \
  -d currency=usd`, 'Idempotency-Key header')),
      block('Rules', '', list([
        'Same key and same request: the same result is returned',
        'Same key with different parameters: an error',
        'A new operation needs a new key, such as a UUID',
        'GET and DELETE do not need keys. They are already idempotent',
        'Stripe keeps a key for at least 24 hours',
      ])),
    ],
  });

  /* ---------- 2.10 Logs and request IDs ---------- */
  subs.push({
    key: 'logs', title: 'Logs and Request IDs', lead: 'Investigate with evidence, not guesses.',
    blocks: [
      block('Every request has an ID', 'It starts with <code>req_</code>. Find it in the response headers, the Dashboard logs, or your own logs.',
        code('Request-Id: req_abc123', 'Response header')),
      block('The investigation path', '',
        fig('flow', '', {
          items: ['Customer report', 'Find the IDs', 'Open the logs', 'Read the error', 'Check events', 'Compare records', 'Explain or escalate'].map((t, i) => ({ t, c: i === 6 ? 'green' : '' })),
          opts: { w: 112, gap: 14 },
        })),
      block('What to collect', '',
        table(['Item', 'Why'], [
          ['Time, with timezone', 'To find the request'],
          ['Payment or request ID', 'To trace it'],
          ['Endpoint and method', 'To reproduce it'],
          ['Status code and error code', 'To find the cause'],
          ['Test or live mode', 'To look in the right place'],
          ['Account', 'To look in the right account'],
        ]) + callout('amber', 'Never collect', 'Secret keys, full card numbers or passwords.')),
      block('An escalation note', 'Short, specific, and easy to act on.',
        code('Summary:   Payment pi_123 is stuck in requires_action\nMode:      live\nTime:      2026-10-12 14:32 UTC\nRequest:   req_abc123\nError:     none (status 200, waiting for 3D Secure)\nChecked:   Dashboard logs, event history, webhook deliveries\nImpact:    1 customer, order 1042\nAsk:       Is the 3D Secure step expiring early?', 'Template')),
    ],
  });

  /* ---------- 2.11 Reconciliation ---------- */
  subs.push({
    key: 'reconciliation', title: 'Reconciliation', lead: 'Make your records and Stripe\'s records agree.',
    blocks: [
      block('Compare two sets of records', '',
        fig('panels', 'Match on payment ID, amount, currency, status and date.', {
          left: { c: 'green', title: 'YOUR RECORDS', sub: 'Orders and payments', items: ['Order 1042: paid', 'Amount: 1500', 'Payment ID: pi_123'] },
          right: { c: 'amber', title: 'STRIPE', sub: 'PaymentIntent', items: ['pi_123: succeeded', 'Amount: 1500 usd', 'Created: same day'] },
        })),
      block('Common mismatches', '',
        table(['Mismatch', 'Likely cause', 'Check'], [
          ['Paid in Stripe, unpaid in your system', 'A missed or failed webhook', 'Webhook delivery attempts'],
          ['In your system, not in Stripe', 'Never created, or wrong mode or account', 'Mode and account'],
          ['Duplicate payments', 'A retry without an idempotency key', 'Request logs and keys'],
          ['Amount differs', 'Currency unit, partial refund, or fees', 'Currency and refunds'],
        ])),
      block('Where the money goes', '', legend([
        ['', 'Balance transactions', 'Each movement in your Stripe balance'],
        ['', 'Payouts', 'Balance sent to your bank'],
      ], 2)),
    ],
  });

  /* ---------- 2.12 Customer communication ---------- */
  subs.push({
    key: 'communication', title: 'Customer Communication', lead: 'Explain technical problems in simple English.',
    blocks: [
      block('A simple formula', '',
        fig('flow', '', {
          items: [{ t: 'Acknowledge', s: 'I see the problem' }, { t: 'Explain', s: 'in plain words' }, { t: 'Say what you found', s: 'the facts' }, { t: 'Next step', s: 'and when', c: 'green' }],
          opts: { w: 160, gap: 40 },
        })),
      block('Say it simply', '',
        table(['Technical', 'Say instead'], [
          ['The API returned 402 card_declined (insufficient_funds).', 'Your bank declined the payment because the balance was too low. Please try another card.'],
          ['The webhook failed, so the order was not updated.', 'Your payment went through, but our system was slow to update your order. We are fixing it.'],
          ['The request timed out.', 'We are checking whether the payment was taken, so you are not charged twice.'],
          ['The refund is pending.', 'We have sent the refund. Your bank needs a few days to show it.'],
        ])),
      block('Do and don\'t', '',
        fig('panels', '', {
          left: { c: 'green', title: 'DO', items: ['Use plain words', 'Say what happens next', 'Share only redacted details'] },
          right: { c: 'amber', title: 'DON\'T', items: ['Blame the customer or the bank', 'Ask for full card numbers or keys', 'Promise exact bank timings'] },
          arrow: false,
        })),
    ],
  });

  /* ---------- 2.13 SQL ---------- */
  subs.push({
    key: 'sql', title: 'SQL and Operational Analysis', lead: 'Check your own records, when your role allows it.',
    blocks: [
      block('Paid in Stripe, not marked paid', 'Table and column names are examples. Use your own.',
        code("SELECT o.id, o.status, p.stripe_payment_intent_id\nFROM orders o\nJOIN payments p ON p.order_id = o.id\nWHERE p.status = 'succeeded'\n  AND o.status <> 'paid';", 'Mismatch check')),
      block('Duplicate webhook events', '',
        code('SELECT stripe_event_id, COUNT(*) AS times\nFROM webhook_events\nGROUP BY stripe_event_id\nHAVING COUNT(*) > 1;', 'Find repeats')),
      block('Monthly revenue', 'Amounts are stored in the smallest unit, so divide by 100 for two-decimal currencies.',
        code("SELECT DATE_TRUNC('month', created_at) AS month,\n       SUM(amount) / 100.0 AS revenue\nFROM payments\nWHERE status = 'succeeded'\nGROUP BY 1\nORDER BY 1;", 'PostgreSQL') +
        callout('amber', 'Only with authorisation', 'Use read-only access, and keep personal data out of tickets and chats.')),
    ],
  });

  /* ---------- 2.14 Tasks ---------- */
  subs.push({
    key: 'tasks', title: 'Tasks', lead: 'Try each task first. Open the solution only after you have an answer.',
    blocks: [
      task(1, 'The 3D Secure path', 'A card needs 3D Secure. List the PaymentIntent statuses in order.', '',
        steps(['<code>requires_payment_method</code>: created, waiting for a card', '<code>requires_confirmation</code>: only if it is not confirmed straight away', '<code>requires_action</code>: the customer verifies with their bank', '<code>processing</code>', '<code>succeeded</code>']) +
        '<p>If the customer fails verification, the PaymentIntent goes back to <code>requires_payment_method</code>.</p>'),
      task(2, '401 or 403?', 'One request returns 401 and another returns 403. What do you check for each?', '',
        table(['Code', 'Meaning', 'Check'], [
          ['401', 'Stripe cannot accept the key', 'Is a key sent? Typo? Deleted, rolled or revoked?'],
          ['403', 'Valid key, but not allowed', 'Is it a restricted key? Does it have this permission, and write access?'],
        ])),
      task(3, '"No such payment"', 'The API says the PaymentIntent does not exist, but the customer shows you the ID. Why?', '',
        list(['Wrong mode: the payment is live and you used a test key, or the reverse', 'Wrong account', 'A typo or a truncated ID', 'It belongs to a different Stripe account, such as a connected account'])),
      task(4, 'Read the error', 'Read this error. What happened, and what do you tell the customer?',
        code('HTTP 402\n{\n  "error": {\n    "type": "card_error",\n    "code": "card_declined",\n    "decline_code": "insufficient_funds",\n    "message": "Your card has insufficient funds."\n  }\n}', 'Error', 'json'),
        '<p><strong>What happened:</strong> a card error. The bank declined because of insufficient funds. It is not a bug in the API.</p><p><strong>Say:</strong> "Your bank declined the payment because the balance was too low. Please try another card."</p>'),
      task(5, 'Paid, but the order is unpaid', 'A customer paid, but the order still shows unpaid. How do you investigate?', '',
        steps(['Find the PaymentIntent and confirm it is <code>succeeded</code>', 'Look at the events and webhook delivery attempts for that payment', 'Check what your endpoint replied. A non-2xx reply means the delivery failed', 'Check the signing secret, mode and event types', 'Resend the event, or fix your system, then confirm the order updates once only'])),
      task(6, 'The timeout', 'Creating a payment timed out. How do you retry safely?', '',
        steps(['Do not assume it failed. Check whether the payment exists', 'Retry the same request with the <strong>same</strong> <code>Idempotency-Key</code>', 'If the first attempt worked, Stripe returns that result. No second charge'])),
      task(7, 'Delivered twice', 'The same webhook arrived twice. How do you avoid processing it twice?', '',
        list(['Store each <code>evt_</code> ID, with a unique constraint', 'If the ID is already stored, skip the work', 'Still reply 2xx so Stripe stops retrying', 'Keep the handler safe to run more than once'])),
      task(8, '"Where is my refund?"', 'A refund shows <code>succeeded</code> but the customer sees no money. What do you say?', '',
        '<p>Stripe has sent the refund, but the customer\'s bank needs time to show it. Do not promise an exact date.</p>' +
        table(['Status', 'What to do'], [
          ['<code>succeeded</code>', 'Explain that the bank needs a few days'],
          ['<code>pending</code>', 'Wait, and check again later'],
          ['<code>failed</code>', 'Find the reason, for example a closed card, and arrange another way to refund'],
        ])),
      task(9, 'A dispute arrives', 'You get <code>charge.dispute.created</code>. What are your steps?', '',
        steps(['Note the response deadline', 'Collect evidence: receipt, proof of delivery, customer messages, policy', 'Submit it before the deadline', 'Watch the status: <code>under_review</code>, then <code>won</code> or <code>lost</code>'])),
      task(10, 'Write the reply', 'A customer\'s card was declined with <code>insufficient_funds</code>. Write a short reply.', '',
        callout('green', 'Sample reply', 'Hi Rahul, thanks for letting us know. Your bank declined the payment because the available balance was too low. No money was taken. Please try again with another card, or contact your bank. Tell me if it still does not work and I will look into it.')),
      task(11, 'How much money?', 'What do these mean? (a) <code>amount=2500, currency=usd</code> (b) <code>amount=2500, currency=jpy</code> (c) <code>amount=2500, currency=inr</code>', '',
        table(['Amount and currency', 'Money'], [
          ['<code>2500 usd</code>', '$25.00'],
          ['<code>2500 jpy</code>', '&yen;2,500 (yen has no decimals)'],
          ['<code>2500 inr</code>', '&#8377;25.00'],
        ])),
    ],
  });

  Ops.content['stripe'] = Ops.h.module({
    id: 'session-2', prefix: 's2', num: 2, title: 'Stripe',
    lead: 'Payment infrastructure. Learn how a payment works, how it fails, and how to investigate it step by step.',
    learn: [
      'Stripe overview and API basics',
      'Payments API and PaymentIntent',
      'Payment methods',
      'Authentication, keys and permissions',
      'Test mode vs live mode',
      'Payment failures and declines',
      'Webhooks',
      'Refunds',
      'Disputes and chargebacks',
      'Idempotency',
      'Logs and request IDs',
      'Reconciliation',
      'Customer communication',
      'SQL and operational analysis',
    ],
    subs,
  });
})();
