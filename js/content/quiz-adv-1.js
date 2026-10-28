/* Quiz: Advanced Stripe Concepts, topics 1 and 2 (money and currency; API mechanics).
   These pages explain; they do not ask. Every fact shows the Stripe docs page it was read from.
   Facts were checked against docs.stripe.com on 2026-10-28; limits can change, so open the source before quoting a number.
   quiz-adv.js turns Ops.advTopics into the sub-section under the Quiz. */
(() => {
  const { block, table, list, legend, callout, code, source } = Ops.h;
  const raw = String.raw;
  const D = 'https://docs.stripe.com';
  /* A source cell for a table row: the docs path as a link */
  const ref = (path) => `<a href="${D}${path}" target="_blank" rel="noopener">docs.stripe.com${path}</a>`;
  /* Closing block of a topic: questions an interviewer may ask. No answers here; answer in your own words */
  const check = (items) => block('Check yourself', 'Questions an interviewer may ask on this topic. Answer each in your own words. If you are unsure, read the block above again.', list(items));

  Ops.adv = { D, ref, check };
  Ops.advTopics = Ops.advTopics || [];

  /* ---------- Topic 1: money and currency ---------- */
  Ops.advTopics.push({
    key: 'adv-money', title: 'Money and Currency',
    lead: 'How Stripe counts money: the smallest unit, zero-decimal currencies such as the yen, special cases, and the limits on a charge.',
    blocks: [
      block('Stripe counts money in the smallest unit', 'Every <code>amount</code> is a whole number in the currency\'s smallest unit (the "minor unit"). For US dollars that is the cent.',
        table(['Amount sent', 'Currency', 'Real money', 'Why'], [
          ['<code>1099</code>', '<code>usd</code>', '$10.99', 'Two-decimal currency: the unit is the cent'],
          ['<code>1000</code>', '<code>usd</code>', '$10.00', 'Docs example'],
          ['<code>10</code>', '<code>jpy</code>', '&yen;10', 'Zero-decimal currency: the unit is the yen itself'],
          ['<code>500</code>', '<code>jpy</code>', '&yen;500', 'Docs example: no multiplying by 100'],
          ['<code>20</code>', '<code>usd</code>', '$0.20 (20 cents)', 'A classic bug: "$20" sent as 20'],
        ]) +
        callout('amber', 'Ask "which currency?" before you read any amount', 'The same number is different money in different currencies. The currency is a three-letter ISO code in <strong>lowercase</strong>: <code>usd</code>, <code>jpy</code>, <code>inr</code>.') +
        source([[`${D}/currencies`, 'Supported currencies']])),

      block('Zero-decimal currencies: no cents', 'These currencies have no smaller unit. Send the amount as it is. 500 yen is <code>amount=500</code>.',
        legend([
          ['', 'BIF', 'Burundian franc'], ['', 'CLP', 'Chilean peso'], ['', 'DJF', 'Djiboutian franc'], ['', 'GNF', 'Guinean franc'],
          ['', 'JPY', 'Japanese yen'], ['', 'KMF', 'Comorian franc'], ['', 'KRW', 'South Korean won'], ['', 'MGA', 'Malagasy ariary'],
          ['', 'PYG', 'Paraguayan guarani'], ['', 'RWF', 'Rwandan franc'], ['', 'UGX', 'Ugandan shilling (special case)'], ['', 'VND', 'Vietnamese dong'],
          ['', 'VUV', 'Vanuatu vatu'], ['', 'XAF', 'Central African CFA franc'], ['', 'XOF', 'West African CFA franc'], ['', 'XPF', 'CFP franc'],
        ], 4) +
        callout('amber', 'The list is not the whole story', 'The docs say this list covers currencies with general API support, and some may not be available in your country. Also read the special cases in the next block: <code>UGX</code> is on the list, but it is sent as a two-decimal value. Every other currency is two-decimal unless the docs say otherwise.') +
        source([[`${D}/currencies`, 'Supported currencies (the 16 codes marked zero-decimal on the page; the currency names are added here for reading)']])),

      block('Special-case currencies', 'These look zero-decimal, or are treated as zero-decimal in one place only.',
        table(['Currency', 'The rule', 'Example'], [
          ['<code>ISK</code> Icelandic kr&oacute;na', 'Zero-decimal now, but for backward compatibility it is sent as two-decimal. The last two digits are always <code>00</code>. You cannot charge fractions.', '5 ISK &rarr; <code>amount=500</code>'],
          ['<code>UGX</code> Ugandan shilling', 'Same as ISK. On invoices that are fractional after prorations, coupons or taxes, Stripe rounds to the nearest number divisible by 100 and puts the difference on the customer balance.', '5 UGX &rarr; <code>amount=500</code>'],
          ['<code>HUF</code> Hungarian forint', 'Charges are two-decimal, but <strong>payouts</strong> are zero-decimal. A manual payout must be a whole amount divisible by 100.', 'Pay out HUF 10 &rarr; <code>amount=1000</code>. A balance of HUF 10.45 cannot be paid out in full'],
          ['<code>TWD</code> New Taiwan dollar', 'Same as HUF: charges two-decimal, manual payouts whole and divisible by 100.', 'Pay out TWD 800 &rarr; <code>amount=80000</code>'],
        ]) +
        callout('green', 'Plain yen is simple', '<code>JPY</code> is a true zero-decimal currency: <code>amount=500</code> is &yen;500. ISK and UGX are the ones that need the extra <code>00</code>.') +
        source([[`${D}/currencies`, 'Supported currencies, "Special cases"']])),

      block('Two amount bugs to recognise', 'Both come from forgetting that the amount is in the smallest unit. When a customer reports a wrong amount, look at the currency on the PaymentIntent first, then compare the <code>amount</code> with what the customer saw.',
        table(['What you see', 'The cause', 'The fix'], [
          ['A $20.00 order fails, or shows as $0.20', 'The code sent <code>amount=20</code>. That is 20 cents, and it is below the 0.50 USD minimum, so it cannot be charged', 'Send <code>amount=2000</code>'],
          ['A &yen;500 order was charged &yen;50,000', 'The code treated the yen like a dollar and multiplied by 100, sending <code>50000</code>', 'Yen is zero-decimal. Send <code>amount=500</code>'],
        ]) +
        source([[`${D}/currencies`, 'Supported currencies, "Specify amounts in API requests"']])),

      block('Minimum and maximum charge', 'Stripe sets a minimum so that its fee never exceeds the charge. The minimum depends on the <strong>settlement currency</strong> (the currency of the payout bank account).',
        legend([
          ['', '0.50 USD', 'US dollar'], ['', '0.30 GBP', 'British pound'], ['', '0.50 EUR', 'Euro'], ['', '0.50 INR', 'Indian rupee'],
          ['', '50 JPY', 'Japanese yen'], ['', '50 KRW', 'South Korean won'], ['', '0.50 AUD', 'Australian dollar'], ['', '0.50 CAD', 'Canadian dollar'],
          ['', '0.50 CHF', 'Swiss franc'], ['', '4.00 HKD', 'Hong Kong dollar'], ['', '0.50 SGD', 'Singapore dollar'], ['', '10 THB', 'Thai baht'],
        ], 4) +
        table(['Maximum (the digits in <code>amount</code>)', 'Limit'], [
          ['Most card payments', '12 digits: 999,999,999,999 in minor units'],
          ['Cartes Bancaires cards', '10 digits'],
          ['American Express (most currencies)', '9 digits'],
          ['JCB, Diners Club, Discover from Japanese accounts', '8 digits: 99,999,999 JPY'],
          ['Non-card methods, most currencies', '8 digits: 999,999.99'],
        ]) +
        callout('amber', 'Exceptions', 'Subscriptions allow zero-amount charges (coupons, free trials), but any non-zero amount must meet the minimum. Some methods break the rule: iDEAL allows an <code>amount</code> as low as <code>1</code>. Card networks can also set limits stricter than the digit count.') +
        source([[`${D}/currencies`, 'Supported currencies, "Minimum and maximum charge amounts" (12 of 31 minimums shown)']])),

      block('Presentment, settlement and integration currency', 'Three words that sound alike.',
        table(['Term', 'Meaning'], [
          ['Presentment currency', 'The currency of the charge: what the customer is asked to pay'],
          ['Settlement currency', 'The currency your bank account accepts. If it differs from the charge currency, Stripe converts'],
          ['Integration currency', 'The currency you set on a Price or PaymentIntent. It shows in the Dashboard and in Stripe Tax reports'],
          ['Customer\'s card currency', 'If it differs from the charge currency, the customer\'s bank may add a foreign exchange fee'],
        ]) +
        source([[`${D}/currencies`, 'Supported currencies, "Currency presentment and settlement"']])),

      check([
        'What unit does Stripe use for amounts?',
        'What is a zero-decimal currency? Give an example.',
        'Why are ISK, UGX, HUF and TWD called special cases?',
        'A merchant wants to charge $20.00 and sends amount=20. What happens?',
        'A yen order was charged 100 times too much. What is the likely cause?',
        'What are the minimum and maximum charge amounts, and what does the minimum depend on?',
        'What is the difference between presentment currency and settlement currency?',
      ]),
    ],
  });

  /* ---------- Topic 2: API mechanics ---------- */
  Ops.advTopics.push({
    key: 'adv-api', title: 'API Mechanics',
    lead: 'What a request looks like, how to authenticate, and how to page through lists, expand objects, attach your own data and pick an API version.',
    blocks: [
      block('The API in one minute', 'The Stripe API is organised around REST: predictable, resource-oriented URLs, form-encoded request bodies, JSON responses, and standard HTTP codes, authentication and verbs.',
        table(['What', 'Detail', 'Source'], [
          ['Base URL', '<code>https://api.stripe.com</code>', ref('/api')],
          ['Requests', 'Form-encoded bodies, not JSON', ref('/api')],
          ['Responses', 'JSON', ref('/api')],
          ['Bulk updates', 'Not supported: one object per request', ref('/api')],
          ['Which mode?', 'The key you use decides: sandbox or live', ref('/api')],
          ['HTTPS', 'Required. Calls over plain HTTP fail, and so do calls without authentication', ref('/api/authentication')],
          ['API version', 'Set by your account default, or per request with the <code>Stripe-Version</code> header', ref('/api/versioning')],
        ])),

      block('Authentication', 'Stripe uses HTTP Basic Auth. The API key is the username and there is no password.',
        code(raw`curl https://api.stripe.com/v1/customers \
  -u sk_test_YOUR_KEY:`, 'The colon after the key means "no password"') +
        list([
          'Without the colon, curl stops and asks you for a password',
          'A <code>Bearer</code> header also works, for example for a cross-origin request',
          'A request with no valid key fails. A request over plain HTTP fails too',
        ]) +
        source([[`${D}/api/authentication`, 'API Reference: Authentication']])),

      block('Lists and pagination', 'List calls use a cursor, not page numbers. You say "continue after this object".',
        table(['Parameter', 'What it does'], [
          ['<code>limit</code>', 'Page size. Default <strong>10</strong>, range 1 to <strong>100</strong>'],
          ['<code>starting_after</code>', 'An object ID. Returns the objects after it (the next page)'],
          ['<code>ending_before</code>', 'An object ID. Returns the objects before it (the previous page)'],
          ['<code>has_more</code> (in the response)', 'True while more objects remain. When false, you have reached the end'],
        ]) +
        code(raw`curl -G https://api.stripe.com/v1/customers \
  -u sk_test_YOUR_KEY: \
  -d limit=100 \
  -d starting_after=cus_LastIdFromPreviousPage`, 'Fetch the next page') +
        list([
          '<code>starting_after</code> and <code>ending_before</code> cannot be used together',
          'Results come newest first. Stripe\'s client libraries have auto-pagination helpers',
          'Add filters when you can, so you fetch fewer pages. That is also kinder to the rate limits',
        ]) +
        source([[`${D}/api/pagination`, 'API Reference: Pagination'], [`${D}/rate-limits`, 'Rate limits, "Filter requests to limit paginated calls"']])),

      block('Expand: related objects in one response', 'A PaymentIntent normally holds only a customer ID. The <code>expand</code> parameter swaps that ID for the whole object, so you do not need a second request.',
        code(raw`curl -G https://api.stripe.com/v1/payment_intents/pi_123 \
  -u sk_test_YOUR_KEY: \
  -d "expand[]=customer"`, 'The customer field now comes back as an object') +
        list([
          'It applies to that response only, and works on list, create and update calls',
          'Nest with a dot: <code>payment_intent.customer</code> on a charge expands the PaymentIntent, then its customer',
          'Maximum depth is <strong>four levels</strong>, for example <code>data.payment_intent.customer.default_source</code> when listing charges',
          'On a list call, expansions start with <code>data</code>. Deep expansions on many list calls can be slow',
        ]) +
        source([[`${D}/api/expanding_objects`, 'API Reference: Expanding responses']])),

      block('Metadata: your own data on a Stripe object', 'Attach your order number or user ID to a Stripe object so you can find it later. It also lets you match an object that arrives in a webhook to your own records.',
        code(raw`curl https://api.stripe.com/v1/customers \
  -u sk_test_YOUR_KEY: \
  -d "metadata[order_id]=6735"`, 'Set a metadata key') +
        table(['Limit', 'Value'], [
          ['Keys per object', 'Up to 50'],
          ['Key name', 'Up to 40 characters; square brackets are not allowed'],
          ['Value', 'Up to 500 characters'],
        ]) +
        callout('amber', 'What not to store', 'Stripe does not use metadata (it never affects an authorization), and your customers do not see it unless you show it. Never put card details, bank account numbers or other sensitive data in <code>metadata</code> or <code>description</code>.') +
        source([[`${D}/api/metadata`, 'API Reference: Metadata'], [`${D}/error-low-level`, 'Advanced error handling, "Server errors"']])),

      block('API versions', 'A version is pinned so an upgrade does not change behaviour under you.',
        list([
          'Since the <code>2024-09-30.acacia</code> release, Stripe ships a new version <strong>monthly with no breaking changes</strong>, and a major release (for example Basil) twice a year that can contain breaking changes',
          'A request uses your account\'s default version unless you send the <code>Stripe-Version</code> header. The default is controlled in Workbench',
          'Webhook events use the version set when the endpoint was created, otherwise the account default. An event keeps its structure after it is created',
          'Strongly typed SDKs (Java, Go, .NET) are fixed to the version current when that SDK was released',
          'Test a new version before you commit to an upgrade',
        ]) +
        source([[`${D}/api/versioning`, 'API Reference: Versioning'], [`${D}/webhooks`, 'Webhooks, "API versioning"']])),

      block('Bulk work: one object per request', 'The API has no bulk update. Updating 500 customers means 500 requests, so a loop must respect the rate limits and back off on a 429 (see Keys, Errors and Retries). For a large read or an analysis, the docs point to Sigma and Data Pipeline as more efficient than calling the API in a loop.',
        source([[`${D}/api`, 'API Reference'], [`${D}/rate-limits`, 'Rate limits']])),

      block('Numbers worth memorising: the API', 'Interviewers like exact numbers.',
        table(['Thing', 'The number', 'Source'], [
          ['List pages: <code>limit</code>', 'Default 10, range 1 to 100', ref('/api/pagination')],
          ['Cursors', '<code>starting_after</code> or <code>ending_before</code>, never both. Newest first', ref('/api/pagination')],
          ['<code>expand</code>', 'Up to 4 levels deep', ref('/api/expanding_objects')],
          ['Metadata', 'Up to 50 keys; key up to 40 characters; value up to 500 characters; no square brackets in keys', ref('/api/metadata')],
          ['Idempotency key', 'Up to 255 characters; kept for at least 24 hours', ref('/api/idempotent_requests')],
          ['Global rate limit', 'Live 100 requests per second; sandbox 25', ref('/rate-limits')],
          ['One endpoint', '25 requests per second, unless noted', ref('/rate-limits')],
          ['Update one PaymentIntent', '1000 update requests per PaymentIntent per hour', ref('/rate-limits')],
          ['Search API; Files API', '20 reads per second; 20 reads and 20 writes per second', ref('/rate-limits')],
          ['Concurrency (live)', '50 requests in progress at once', ref('/rate-limits')],
          ['Read requests', 'On average no more than 500 per transaction (at least 10,000 reads a month for any account)', ref('/rate-limits')],
          ['Events API', 'An event can be retrieved for 30 days', ref('/api/events')],
          ['Big rate increase', 'Ask Stripe Support at least 6 weeks ahead', ref('/rate-limits')],
        ])),

      check([
        'Describe the Stripe API in one or two sentences.',
        'How do you authenticate a request to the Stripe API?',
        'A list call returns 10 records and "has_more": true. How do you get the rest?',
        'A PaymentIntent shows only a customer ID. How do you get the whole customer in the same response?',
        'What can you store in metadata, and what are the limits?',
        'How does Stripe API versioning work?',
        'Can you update 500 customers in one API call?',
      ]),
    ],
  });
})();
