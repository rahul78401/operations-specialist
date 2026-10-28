/* Quiz: Advanced Stripe Concepts, topics 3 and 4 (keys, errors and retries; payments, declines and webhooks).
   These pages explain; they do not ask. Every fact shows the Stripe docs page it was read from (checked 2026-10-28).
   Defined after quiz-adv-1.js, which sets Ops.adv and Ops.advTopics. */
(() => {
  const { block, table, list, steps, callout, code, source } = Ops.h;
  const { D, ref, check } = Ops.adv;
  const raw = String.raw;

  /* ---------- Topic 3: keys, errors and retries ---------- */
  Ops.advTopics.push({
    key: 'adv-errors', title: 'Keys, Errors and Retries',
    lead: 'Which key does what, how to read an error, and how to retry a request without doing the work twice.',
    blocks: [
      block('Keys: which one is safe to expose?', 'Stripe has several kinds of key. Only one may appear in a browser or app.',
        table(['Key', 'Starts with', 'Safe to expose?', 'Note'], [
          ['Publishable', '<code>pk_</code>', 'Yes', 'Front end and apps. It cannot create charges or read account data'],
          ['Restricted', '<code>rk_</code>', 'No', 'Permissions you choose. Stripe recommends these for server code'],
          ['Secret', '<code>sk_</code>', 'No', 'Unrestricted on all APIs. Stripe suggests moving to restricted keys'],
          ['Organisation', '<code>sk_org_</code>', 'No', 'Works across the accounts of an organisation'],
          ['Webhook signing secret', '<code>whsec_</code>', 'No', 'Not an API key. One per webhook endpoint, found in the Webhooks section'],
        ]) +
        callout('amber', 'Things that catch people out', 'A live secret key is shown <strong>once</strong>: "you can\'t retrieve it later". If it is lost or leaked, rotate it. A key not used for transfers or payouts for over 180 days can have its access limited. Keys belong in a secrets vault or an environment variable, never in source code or chat.') +
        source([[`${D}/keys`, 'API keys']])),

      block('If a key leaks', 'Rotating revokes the key and creates a replacement that works at once.',
        steps([
          'In the Dashboard API keys page, rotate the key. Choosing expiry <strong>Now</strong> deletes the old key immediately. A longer expiry keeps both keys working for up to 7 days, which suits a planned rotation, not a leak',
          'Put the new key in a secrets vault or an environment variable, never in source code or chat',
          'Open the old key\'s request logs to see what it was used for',
          'Tell your security owner. Access policies on live keys (IP address, country, network) block and report unexpected use',
        ]) +
        source([[`${D}/keys`, 'API keys, "Rotate an API key" and "Access policies"']])),

      block('Sandbox, test mode and live mode', 'Two separate worlds. An object made in one is not visible in the other.',
        table(['', 'Sandbox (test)', 'Live mode'], [
          ['Keys', '<code>pk_test_</code>, <code>rk_test_</code>, <code>sk_test_</code>', '<code>pk_live_</code>, <code>rk_live_</code>, <code>sk_live_</code>'],
          ['Money', 'Card networks and providers do not process payments. Responses are simulated', 'Real payments and real objects'],
          ['Cards', 'Test cards only. Real payment methods cannot be accepted', 'Real cards'],
          ['Webhook secret', 'Different from live, even for the same endpoint', 'Different from test'],
          ['Rate limit', '25 requests per second', '100 requests per second'],
        ]) +
        callout('green', '"No such customer", but the ID is right', 'Check the <strong>mode</strong> (and the account) first. A customer made with an <code>sk_test_</code> key does not exist for an <code>sk_live_</code> key, and the other way round. Then look for a typo in the ID, or an object that belongs to a different Stripe account.') +
        callout('amber', 'Wording to know', 'The docs now say <strong>sandbox</strong> where older material says <strong>test mode</strong>. The keys still start with <code>_test_</code>. Both words mean the same safe environment.') +
        source([[`${D}/keys`, 'API keys, "Sandbox versus live mode"'], [`${D}/rate-limits`, 'Rate limits'], [`${D}/webhooks`, 'Webhooks, "Retrieving your endpoint\'s secret"']])),

      block('HTTP codes and what to check first', '<code>2xx</code> is success. <code>4xx</code> means the request failed given the information provided. <code>5xx</code> means a problem on Stripe\'s side, and it is rare.',
        table(['Code', 'Stripe\'s meaning', 'Check first'], [
          ['<code>400</code>', 'Unacceptable request, often a missing required parameter', 'The <code>param</code> and <code>message</code> in the error'],
          ['<code>401</code>', 'No valid API key provided', 'Is a key sent? A typo, or an expired or revoked key?'],
          ['<code>402</code>', 'Parameters were valid but the request failed', 'A card decline: read <code>decline_code</code>'],
          ['<code>403</code>', 'The key lacks permission', 'Is it a restricted key without this permission?'],
          ['<code>404</code>', 'The resource does not exist', 'Mode, account, and a typo in the ID'],
          ['<code>409</code>', 'Conflicts with another request, for example the same idempotency key', 'Is the first request still running? Wait, retry the same key and parameters'],
          ['<code>424</code>', 'A dependency outside Stripe failed', 'Open the request in the Dashboard logs, then retry later'],
          ['<code>429</code>', 'Too many requests', 'The <code>Stripe-Rate-Limited-Reason</code> header; back off with jitter'],
          ['<code>500</code>, <code>502</code>, <code>503</code>, <code>504</code>', 'A problem on Stripe\'s side (rare)', 'The result is unknown. Reconcile before you repeat the action'],
        ]) +
        table(['Error type', 'Meaning'], [
          ['<code>card_error</code>', 'The most common. A card that cannot be charged'],
          ['<code>invalid_request_error</code>', 'Invalid parameters in the request'],
          ['<code>idempotency_error</code>', 'An <code>Idempotency-Key</code> reused on a request that does not match the first one'],
          ['<code>api_error</code>', 'Any other problem, such as a temporary one on Stripe\'s servers. Extremely uncommon'],
        ]) +
        callout('amber', '401 and 403 are not the same', '<strong>401</strong>: no valid key was provided. <strong>403</strong>: the key is valid but lacks permission, which usually means a restricted key missing a permission. The keys page adds that a request with no valid key gets an invalid request error, and one with an expired key gets an authentication error.') +
        source([[`${D}/api/errors`, 'API Reference: Errors'], [`${D}/error-low-level`, 'Advanced error handling'], [`${D}/keys`, 'API keys']])),

      block('Reading the error object', 'Start with <code>type</code>, <code>code</code> and <code>message</code>. For a declined card also read <code>decline_code</code>.',
        table(['Field', 'What it tells you'], [
          ['<code>code</code>', 'A short string you can handle in code'],
          ['<code>decline_code</code>', 'The card issuer\'s reason for a decline, if it gave one'],
          ['<code>message</code>', 'Human-readable. For card errors it can be shown to the user'],
          ['<code>param</code>', 'The parameter related to the error, for example to mark a form field'],
          ['<code>advice_code</code>', 'For issuer declines, how to proceed, if the issuer gives advice'],
          ['<code>request_log_url</code>', 'A link to the request in your Dashboard logs'],
          ['<code>doc_url</code>', 'A page with more information about the code'],
        ]) +
        callout('green', 'A 402 card_declined is not a bug', 'The parameters were valid and the bank said no. Read <code>decline_code</code> to see why, then tell the customer the next step (see Payments, Declines and Webhooks).') +
        source([[`${D}/api/errors`, 'API Reference: Errors, "Attributes"'], [`${D}/declines/codes`, 'Decline codes']])),

      block('Idempotency: retry without doing it twice', 'A network error can leave you not knowing whether Stripe did the work. An idempotency key lets you send the same request again safely.',
        code(raw`curl https://api.stripe.com/v1/payment_intents \
  -u sk_test_YOUR_KEY: \
  -H "Idempotency-Key: order-1042-attempt-1" \
  -d amount=1500 \
  -d currency=usd`, 'A unique value in the Idempotency-Key header of a POST') +
        '<p class="line">Stripe saves the status code and body of the first request, after the endpoint starts executing. A retry with the same key returns that saved response (even a 500) instead of doing the work again.</p>' +
        table(['Rule', 'Detail'], [
          ['The key', 'One per operation. A V4 UUID or another random string. Up to <strong>255 characters</strong>. Do not use sensitive data such as an email address'],
          ['How long it is kept', 'Keys can be removed once they are <strong>at least 24 hours old</strong>. Reuse after that is treated as a new request'],
          ['Same key, different parameters', 'An error (<code>idempotency_error</code>). A key is tied to its first request'],
          ['What is not saved', 'Requests that fail validation, or conflict with one still running. Nothing was executed, so you can retry them'],
          ['Which methods', 'All POSTs in API v1. <code>GET</code> and <code>DELETE</code> are idempotent already, so a key has no effect'],
        ]) +
        source([[`${D}/api/idempotent_requests`, 'API Reference: Idempotent requests'], [`${D}/api/errors`, 'API Reference: Errors']])),

      block('After a timeout, or a 500', 'The wrong move is to assume the request failed. Decide from what you actually know.',
        table(['Situation', 'What you know', 'What to do'], [
          ['A timeout or dropped connection', 'Nothing. Stripe may or may not have processed it', 'Retry with the <strong>same</strong> key and the same parameters, within the first 24 hours. After that, stop and reconcile'],
          ['A <code>500</code> on a POST', 'The outcome is unknown. The operation might already have had side effects', 'Do not retry with a new key yet. Retrieve the object, inspect the request in the Dashboard, and watch for webhook events. With the same key you get the cached 500 back'],
          ['A <code>409</code>', 'Another request with the same key is still running', 'Wait, then retry with that key and the same parameters. A new key could start a second operation'],
          ['A <code>4xx</code> before execution (bad key, invalid parameters, rate limit)', 'Nothing was executed, so no result is cached', 'Fix the problem and retry'],
        ]) +
        callout('amber', 'Reconciling', 'Retrieve the relevant object, inspect the request in the Dashboard and use webhook events. If you still cannot tell what happened, contact Stripe support before repeating the action. Stripe SDKs can generate keys and retry automatically, with exponential backoff.') +
        source([[`${D}/error-low-level`, 'Advanced error handling']])),

      block('Response headers that help', 'Four headers are worth knowing.',
        table(['Header', 'What it tells you'], [
          ['<code>Request-Id</code>', 'The <code>req_...</code> ID of this API request'],
          ['<code>Idempotent-Replayed: true</code>', 'This response is being replayed from an earlier request with the same key'],
          ['<code>Stripe-Should-Retry</code>', '<code>true</code>: retry with exponential backoff. <code>false</code>: do not retry. Absent: decide from the status code'],
          ['<code>Stripe-Rate-Limited-Reason</code>', 'Why a 429 happened: <code>global-rate</code>, <code>endpoint-rate</code>, <code>global-concurrency</code>, <code>endpoint-concurrency</code> or <code>resource-specific</code>'],
        ]) +
        source([[`${D}/api/request_ids`, 'API Reference: Request IDs'], [`${D}/error-low-level`, 'Advanced error handling'], [`${D}/rate-limits`, 'Rate limits']])),

      block('Rate limits and the 429', 'A 429 means the integration is sending too many requests. Do not retry in a tight loop.',
        table(['Limit', 'Value'], [
          ['Global, live mode', '100 requests per second'],
          ['Global, sandbox', '25 requests per second'],
          ['One endpoint', '25 requests per second, unless noted'],
          ['Concurrency, live', '50 requests in progress'],
        ]) +
        list([
          '<strong>Retry with exponential backoff and a little randomness</strong>, so retries do not arrive all at once, and lower the request volume',
          'Common causes: a big migration or analysis running in a loop, a flash sale, or many slow list and expand calls',
          'For a big event, contact Stripe Support in advance. For a large increase, at least 6 weeks',
        ]) +
        callout('amber', 'A 429 with no Stripe-Rate-Limited-Reason header', 'This can be a <strong>lock timeout</strong> (code <code>lock_timeout</code>): another request or Stripe process was using the same object. Retry on a backoff schedule (the SDKs do this for you) and queue changes to the same object so they run one after another. Stripe did not process the request, so it has no request ID.') +
        source([[`${D}/rate-limits`, 'Rate limits']])),

      block('Request IDs: tracing one call', 'Every API request has an ID starting with <code>req_</code>. It is how you find one exact call.',
        list([
          'It is in the <code>Request-Id</code> response header, and in the URL of each request log in the Dashboard',
          'The error object can also carry a <code>request_log_url</code> that links straight to the log',
          'Give the request ID to Stripe whenever you contact them about a specific request. It is the fastest way to resolve it',
        ]) +
        source([[`${D}/api/request_ids`, 'API Reference: Request IDs'], [`${D}/api/errors`, 'API Reference: Errors, "Attributes"']])),

      check([
        'Which Stripe keys are safe to expose in a browser or app?',
        'A colleague pasted a live secret key into a chat. What do you do?',
        'The customer ID is correct but the API says "No such customer". What do you check first?',
        'What is the difference between a 401 and a 403?',
        'Walk through Stripe\'s HTTP status codes and the four error types.',
        'A request returns 402 with card_declined. Is that a bug?',
        'What is an idempotency key? How long is it kept, and what if you reuse it with different parameters?',
        'A payment request times out. Do you retry? What if it returns a 500?',
        'What is a 429, and how do you handle it? What if it has no Stripe-Rate-Limited-Reason header?',
        'How do you find the exact API call behind a customer\'s failed payment?',
      ]),
    ],
  });

  /* ---------- Topic 4: payments, declines and webhooks ---------- */
  Ops.advTopics.push({
    key: 'adv-payments', title: 'Payments, Declines and Webhooks',
    lead: 'How one payment moves through its statuses, when it is held or declined, and how Stripe tells your system what happened.',
    blocks: [
      block('PaymentIntent: one object follows the payment', 'The PaymentIntent tracks a customer\'s checkout from start to finish. It triggers extra authentication when it is needed (3D Secure, Radar rules, redirect-based methods), and each attempt to collect money creates a <strong>Charge</strong>.',
        list([
          'Create it as soon as you know the amount to charge, so Stripe records every attempted payment',
          'Reuse the same PaymentIntent when the customer retries, so one purchase stays on one object',
          'Stripe now recommends the Checkout Sessions API with the Payment Element for most integrations. The PaymentIntent still tracks the payment underneath',
        ]) +
        table(['PaymentIntent and Charge', 'What to remember'], [
          ['<code>latest_charge</code>', 'The most recent Charge on a PaymentIntent'],
          ['Every attempt', 'List charges with the <code>payment_intent</code> parameter to see all attempts, including failed ones'],
          ['Refunds', 'Refunding the PaymentIntent is the same as refunding its underlying charge'],
          ['Later changes', 'Refunds and disputes show on the Charge. The PaymentIntent can stay <code>succeeded</code> while the Dashboard shows Refunded or Disputed'],
        ]) +
        source([[`${D}/payments/paymentintents/lifecycle`, 'How Payment Intents and Setup Intents work'], [`${D}/payments/payment-intents/verifying-status`, 'Payment status updates'], [`${D}/refunds`, 'Refund and cancel payments']])),

      block('PaymentIntent statuses', 'After a failed attempt (for example a decline) the PaymentIntent goes <strong>back to <code>requires_payment_method</code></strong>, so the payment can be retried.',
        table(['Status', 'Meaning', 'Dashboard shows'], [
          ['<code>requires_payment_method</code>', 'Needs a payment method. Also where it returns after a failed attempt', 'Incomplete'],
          ['<code>requires_confirmation</code>', 'Has payment details, ready to confirm. Most integrations skip this state', 'Incomplete'],
          ['<code>requires_action</code>', 'Needs the customer to do something, such as 3D Secure', 'Incomplete'],
          ['<code>processing</code>', 'Waiting on an asynchronous method, such as a bank debit, which can take days', 'Pending'],
          ['<code>requires_capture</code>', 'Authorized, with funds held, waiting for you to capture', 'Uncaptured, or Partial capture'],
          ['<code>succeeded</code>', 'The payment flow is complete. The funds are in your account. Fulfil the order', 'Succeeded'],
          ['<code>canceled</code>', 'Cancelled. It cannot be used again, and the cancel cannot be undone', 'Cancelled'],
        ]) +
        callout('amber', 'The Dashboard summary is not the whole truth', 'Edge cases can show Failed, Partially paid or Waiting on funding. To see the exact status, open the payment and look at the PaymentIntent JSON in the Workbench Inspector.') +
        source([[`${D}/payments/paymentintents/lifecycle`, 'How Payment Intents and Setup Intents work'], [`${D}/payments/payment-intents/verifying-status`, 'Payment status updates, "Payment statuses and PaymentIntent statuses"']])),

      block('Ship from the webhook, not the browser', 'Fulfil an order from the <code>payment_intent.succeeded</code> webhook. The customer can leave the page after paying but before your page runs the fulfilment code, so the browser cannot be trusted to do it.',
        list([
          'Polling the PaymentIntent also works, but it is much less reliable and can hit rate limits',
          '<code>payment_intent.payment_failed</code> is the event for a failed payment',
          '<code>payment_intent.amount_capturable_updated</code> says a payment is authorized and ready to capture',
        ]) +
        source([[`${D}/payments/payment-intents/verifying-status`, 'Payment status updates, "Monitor a PaymentIntent with webhooks"']])),

      block('Authorize now, capture later', 'Create the PaymentIntent with <code>capture_method=manual</code>. The card is <strong>authorized</strong>: the money is held, and the PaymentIntent waits in <code>requires_capture</code>. You <strong>capture</strong> later to take it. If you do not capture before the hold expires, the funds are released and the payment becomes <code>canceled</code>.',
        table(['Hold', 'How long'], [
          ['Online card payment', 'Usually <strong>7 days</strong>. Visa merchant-initiated payments: 5 days'],
          ['In person, terminal', '2 days (Visa 5 days)'],
          ['Japanese accounts, JPY', 'Up to <strong>30 days</strong> for Visa, Mastercard, JCB, Diners Club and Discover. American Express and non-JPY payments use the normal windows'],
        ]) +
        list([
          'The charge\'s <code>capture_before</code> field shows the exact expiry',
          'Capture less with <code>amount_to_capture</code>. The rest is released automatically. For most payments you can capture only once',
        ]) +
        source([[`${D}/payments/place-a-hold-on-a-payment-method`, 'Place a hold on a payment method']])),

      block('Cancel or refund?', 'A payment that is only authorized cannot be refunded. With status <code>requires_capture</code> the charge is uncaptured, so <strong>cancel the PaymentIntent</strong> instead. That releases the held funds.',
        list([
          'You can cancel in <code>requires_payment_method</code>, <code>requires_confirmation</code>, <code>requires_action</code> and <code>requires_capture</code> (and in <code>processing</code> for a few bank-debit methods)',
          'You cannot cancel after <code>succeeded</code>. A cancel cannot be undone, and later operations on that PaymentIntent fail',
          'Cost tip from the docs: if you refund a lot soon after the sale, manual capture lets you cancel or capture a smaller amount instead of paying for refunds',
        ]) +
        source([[`${D}/refunds`, 'Refund and cancel payments, "Cancel a payment" and "Cost optimisation"'], [`${D}/payments/paymentintents/lifecycle`, 'How Payment Intents and Setup Intents work']])),

      block('3D Secure and SCA', '<strong>3D Secure (3DS)</strong> adds a step where the cardholder proves it is them to their bank, usually with a password, a one-time code or biometrics. <strong>SCA</strong> (Strong Customer Authentication) is the rule that can require it. The PaymentIntent waits in <code>requires_action</code> until the customer finishes.',
        list([
          'SCA applies under PSD2 in the EEA, and similar rules in the UK, India, Japan and Australia. Elsewhere 3DS is optional and reduces fraud risk',
          'If the attempt then fails, the PaymentIntent returns to <code>requires_payment_method</code>',
          'Test card <code>4000 0025 0000 3155</code> needs authentication',
        ]) +
        source([[`${D}/payments/3d-secure`, '3D Secure authentication'], [`${D}/payments/paymentintents/lifecycle`, 'How Payment Intents and Setup Intents work']])),

      block('Why a payment fails: three families', 'Look at the Charge\'s <code>outcome</code>. It gives the type, the reason and the risk level.',
        table(['Family', '<code>outcome.type</code>', 'What it means'], [
          ['Issuer decline', '<code>issuer_declined</code>', 'The card issuer\'s systems said no. Stripe passes on a decline code and reason'],
          ['Blocked payment', '<code>blocked</code>', 'Stripe Radar (or Adaptive Acceptance, for IC+ pricing) stopped it before the issuer was asked'],
          ['Invalid API call', '<code>invalid</code>', 'The request itself was wrong. Usually no payment appears in the Dashboard'],
        ]) +
        callout('amber', 'Blocked, but the customer sees a pending charge', 'Stripe blocked the payment <strong>before it asked the card issuer</strong>, so the customer was not charged. For some cards the issuer\'s authorization for the amount can still show on the statement. It is not a charge, and the issuer typically removes it within a few days. If a Radar rule blocked a payment you know is genuine, find it in the Dashboard and click <strong>Add to allow list</strong>. That does not retry the payment. It stops your rules blocking future attempts that match the same attribute.') +
        source([[`${D}/declines`, 'Declines']])),

      block('Decline codes in plain English', 'For a bank decline that gives no reason, the customer has to contact their card issuer. Use the docs\' "next steps", in plain words.',
        table(['Decline code', 'In plain English'], [
          ['<code>insufficient_funds</code>', 'The balance is too low. Please use another payment method'],
          ['<code>expired_card</code>', 'The card has expired. Please use another card'],
          ['<code>incorrect_cvc</code>', 'The security code is wrong. Please try again with the right one'],
          ['<code>incorrect_number</code>, <code>invalid_number</code>', 'The card number is wrong. Please try again with the right number'],
          ['<code>authentication_required</code>', 'The bank wants to verify you. Please complete the check (3D Secure) and try again'],
          ['<code>processing_error</code>', 'An error happened while processing. Please try again. If it keeps happening, contact your bank'],
          ['<code>generic_decline</code>, <code>call_issuer</code>, <code>do_not_honor</code>', 'The bank declined for a reason we cannot see. Please contact your bank'],
        ]) +
        callout('amber', 'Do not explain these four', 'For <code>fraudulent</code>, <code>lost_card</code>, <code>stolen_card</code> and <code>merchant_blacklist</code>, <strong>do not give the real reason</strong>. Show the customer the same message as a <code>generic_decline</code>.') +
        callout('green', 'duplicate_transaction', 'A payment with identical amount and card details was submitted very recently. Check whether a recent payment already exists before you ask the customer to pay again.') +
        source([[`${D}/declines/codes`, 'Stripe decline codes']])),

      block('Test cards', 'Sandbox only. Use any valid future expiry (the docs suggest <code>12/34</code>) and any 3-digit CVC (4 digits for American Express).',
        table(['Card number', 'Result'], [
          ['<code>4242 4242 4242 4242</code>', 'Succeeds'],
          ['<code>4000 0000 0000 0002</code>', 'Generic decline'],
          ['<code>4000 0000 0000 9995</code>', 'Declined: <code>insufficient_funds</code>'],
          ['<code>4000 0000 0000 9987</code>', 'Declined: <code>lost_card</code>'],
          ['<code>4000 0000 0000 9979</code>', 'Declined: <code>stolen_card</code>'],
          ['<code>4000 0000 0000 0069</code>', 'Declined: <code>expired_card</code>'],
          ['<code>4000 0000 0000 0127</code>', 'Declined: <code>incorrect_cvc</code>'],
          ['<code>4000 0000 0000 0119</code>', 'Declined: <code>processing_error</code>'],
          ['<code>4000 0025 0000 3155</code>', '3D Secure needed for off-session payments unless the card is set up'],
          ['<code>4000 0027 6000 3184</code>', '3D Secure on every transaction'],
        ]) +
        callout('amber', 'Two traps', 'Stripe skips the CVC check if you leave the CVC out, so include one when you test CVC behaviour. And never use real card details: the Stripe Services Agreement prohibits testing in live mode with real payment details.') +
        source([[`${D}/testing`, 'Test your integration']])),

      block('Webhooks: Stripe tells you', 'A webhook is a <strong>push notification</strong>. When something happens in your account (an event), Stripe sends a JSON payload over HTTPS to your endpoint. You need it because many things happen after your request has returned: a bank confirming a payment, a customer disputing a charge, a recurring payment succeeding.',
        list([
          'Polling is much less reliable and can trigger rate limits',
          'Events you will meet: <code>payment_intent.succeeded</code>, <code>payment_intent.payment_failed</code>, <code>charge.refunded</code>, <code>refund.created</code>, <code>refund.failed</code>, <code>charge.dispute.created</code>',
          'You can register up to 16 event destinations, and a webhook endpoint is one kind of destination. Live endpoints must be public HTTPS URLs',
        ]) +
        source([[`${D}/webhooks`, 'Receive Stripe events in your webhook endpoint'], [`${D}/payments/payment-intents/verifying-status`, 'Payment status updates']])),

      block('A good webhook handler', 'Accept a POST with a JSON body, <strong>verify the signature</strong>, and return a <strong>2xx quickly</strong> before any slow work.',
        list([
          'Verify with the <code>Stripe-Signature</code> header, the endpoint secret (<code>whsec_</code>) and the <strong>raw</strong> request body. A framework that changes the body breaks the check',
          'Process events from an asynchronous queue, so a spike (for example when subscriptions renew) does not overwhelm your servers',
          'Events can arrive twice: log the event IDs you processed and skip repeats. Two separate Event objects can describe the same change, so also compare the <code>data.object</code> ID and the event type',
          'Do not rely on order. Fetch the current object from the API if you need the latest state',
          'Listen only to the event types you need',
          'Exempt the route from CSRF protection (Rails, Django). Use HTTPS with TLS 1.2 or 1.3 in live mode',
        ]) +
        code('stripe listen --forward-to localhost:4242/webhook\nstripe trigger payment_intent.succeeded', 'Test on your own computer with the Stripe CLI') +
        source([[`${D}/webhooks`, 'Receive Stripe events in your webhook endpoint']])),

      block('Retries and resending', 'In live mode Stripe retries a failed delivery for <strong>up to three days</strong> with exponential backoff. In a sandbox it retries three times over a few hours.',
        table(['Action', 'Limit'], [
          ['Resend from the Dashboard (the event\'s Resend button)', 'Up to 15 days after the event was created'],
          ['Stripe CLI: <code>stripe events resend &lt;event_id&gt; --webhook-endpoint=&lt;endpoint_id&gt;</code>', 'Up to 30 days'],
          ['Retrieve an event from the Events API', 'For 30 days'],
        ]) +
        callout('amber', 'Resending does not stop the retries', 'A manual resend does not cancel the automatic retries, even if it gets a 2xx. A disabled or deleted destination stops further retries.') +
        source([[`${D}/webhooks`, 'Receive Stripe events in your webhook endpoint, "Event delivery behaviours"'], [`${D}/api/events`, 'API Reference: Events']])),

      block('When signature verification fails', 'Check three things in order: the <strong>raw body</strong> was changed by a framework, the <strong>wrong signing secret</strong> is used, or the <strong>timestamp</strong> is too old.',
        list([
          'The secret is unique to each endpoint, and differs between test and live for the same endpoint. The Stripe CLI prints its own secret when you run <code>stripe listen</code>',
          'The libraries accept a timestamp up to 5 minutes old by default. Keep your server clock correct with NTP. Never set the tolerance to 0, which turns the check off',
          'After you roll a secret, Stripe signs with each active secret until the old one expires (up to 24 hours)',
          'The header holds a timestamp (<code>t=</code>) and a signature (<code>v1=</code>): an HMAC with SHA-256 over the timestamp, a dot and the payload. Ignore other schemes',
        ]) +
        source([[`${D}/webhooks`, 'Receive Stripe events in your webhook endpoint, "Verify events are sent from Stripe"']])),

      block('Reading Event deliveries', 'Open the endpoint in Workbench, then <strong>Event deliveries</strong>. Each event is Delivered, Pending or Failed, with the HTTP status of the attempt and the time of the next retry.',
        table(['What you see', 'Fix'], [
          ['Unable to connect', 'The host must be reachable from the internet'],
          ['<code>3xx</code> redirect', 'Stripe counts redirects as failures. Register the final URL'],
          ['<code>4xx</code>', 'The endpoint must be public and accept POST'],
          ['<code>5xx</code>', 'Your server errored. Read your application logs'],
          ['TLS error', 'Fix the certificate. Stripe needs TLS 1.2 or higher'],
          ['Timed out', 'Return 2xx at once and do slow work afterwards'],
        ]) +
        source([[`${D}/webhooks`, 'Receive Stripe events in your webhook endpoint, "Debug webhook integrations"']])),

      check([
        'What is a PaymentIntent, and how is it related to a Charge?',
        'Name the PaymentIntent statuses. What happens after a failed attempt?',
        'When do you ship the order: when the browser says "success", or later? Why?',
        'Explain authorize and capture. What happens if you forget to capture?',
        'Can you refund a payment that is authorized but not captured?',
        'What are 3D Secure and SCA, and what does a PaymentIntent show when they are needed?',
        'Why can a payment fail? What do you tell a customer whose payment was blocked, or declined for fraud?',
        'Which test cards do you know, and what are the rules for expiry and CVC?',
        'What is a webhook, and what must a good handler do?',
        'How does Stripe retry webhooks, and how do you resend a missed event? What do you check when verification fails?',
      ]),
    ],
  });
})();
