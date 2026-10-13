/* Session 1: REST APIs and Postman. */
(() => {
  const { block, fig, code, table, list, steps, legend, callout, two, methods, groups, task } = Ops.h;
  const raw = String.raw;

  const subs = [];

  /* ---------- 1.1 What is an API? ---------- */
  subs.push({
    key: 'api', title: 'What is an API?', lead: 'A way for two applications to talk to each other.',
    blocks: [
      block('The idea', 'In a food delivery app, your phone is the client and the restaurant\'s system is the server. The API carries the messages.',
        fig('flow', 'The request goes in. The response comes back.', {
          items: [{ t: 'Client', s: 'App or website', c: 'green' }, { t: 'API', s: 'Receives requests' }, { t: 'Server + database', s: 'Logic and data', c: 'amber' }],
          opts: { bidir: true, w: 170, gap: 50 },
        })),
      block('Key terms', '', legend([
        ['', 'Client', 'The app making the request'],
        ['', 'Server', 'The system that answers'],
        ['', 'API', 'The messenger in between'],
        ['', 'Endpoint', 'One specific address'],
        ['', 'Request', 'What is sent'],
        ['', 'Response', 'What comes back'],
      ])),
      block('One request, step by step', 'The client asks for order 123. The server checks you are allowed, finds the order and replies.',
        code('GET https://api.example.com/orders/123', 'Request') +
        code('{\n  "id": "123",\n  "status": "shipped",\n  "amount": 1500,\n  "currency": "INR"\n}', 'Response (JSON)', 'json') +
        '<p class="line">The app shows: Order shipped, &#8377;1,500.</p>'),
      block('You should be able to explain', 'This matters more than the definition.', list([
        'Where the request starts',
        'Which endpoint receives it',
        'What data is sent',
        'What the server does',
        'What the response contains',
        'What happens when it fails',
      ])),
      block('What is an endpoint?', 'The URL names the resource. The HTTP method says the action.',
        table(['Endpoint', 'Purpose'], [
          ['<code>/customers</code>', 'Work with customer records'],
          ['<code>/customers/123</code>', 'One particular customer'],
          ['<code>/payments</code>', 'Work with payments'],
          ['<code>/payments/123</code>', 'One particular payment'],
        ]) +
        table(['Request', 'Meaning'], [
          ['<code>GET /customers/123</code>', 'Retrieve a customer'],
          ['<code>PATCH /customers/123</code>', 'Update some details'],
          ['<code>DELETE /customers/123</code>', 'Delete a customer, if permitted'],
        ])),
    ],
  });

  /* ---------- 1.2 HTTP and methods ---------- */
  subs.push({
    key: 'http', title: 'HTTP and Methods', lead: 'The rules for requests and responses, and the five methods.',
    blocks: [
      block('What is HTTP?', 'A set of rules for clients and servers to swap requests and responses. HTTPS is HTTP protected by TLS encryption.',
        fig('duplex', '', { left: { t: 'Client', c: 'green' }, right: { t: 'Server', c: 'amber' }, req: 'Method + URL + headers + body', res: 'Status code + headers + body' })),
      block('The five methods', 'Know these without looking them up.',
        methods([
          ['GET', 'Read data', 'GET /customers/123'],
          ['POST', 'Create, or trigger an action', 'POST /customers'],
          ['PUT', 'Replace a resource', 'PUT /customers/123'],
          ['PATCH', 'Update part of it', 'PATCH /customers/123'],
          ['DELETE', 'Remove it', 'DELETE /customers/123'],
        ])),
      block('Idempotency', 'Repeating the same request has the same effect as doing it once.',
        fig('panels', 'Payment APIs use an idempotency key so a retry is not a second charge.', {
          left: { c: 'green', title: 'SAFE TO REPEAT', sub: 'Same result every time', items: ['Read a customer', 'Set an email to the same value', 'Delete the same item'] },
          right: { c: 'amber', title: 'NEEDS CARE', sub: 'Repeating may do it twice', items: ['Create a payment', 'Place an order', 'Send an email'] },
          arrow: false,
        })),
    ],
  });

  /* ---------- 1.3 JSON ---------- */
  subs.push({
    key: 'json', title: 'JSON', lead: 'The common text format for sending structured data.',
    blocks: [
      block('Reading JSON', '',
        code('{\n  "customer_id": "cus_123",\n  "name": "Rahul",\n  "email": "rahul@example.com",\n  "active": true,\n  "balance": 1500,\n  "phone": null\n}', 'customer.json', 'json') +
        legend([
          ['tk-v', '"customer_id"', 'A key (the name)'],
          ['tk-s', '"Rahul"', 'A string'],
          ['tk-st', 'true', 'A Boolean'],
          ['tk-n', '1500', 'A number'],
          ['tk-st', 'null', 'No value'],
          ['', '{ } and [ ]', 'Object and array'],
        ])),
      block('Objects and arrays', 'An array is a list. An object groups keys. They can be nested.',
        two(code('{\n  "items": ["Laptop", "Mouse", "Keyboard"]\n}', 'Array', 'json'),
          code('{\n  "customer": {\n    "id": "cus_123",\n    "name": "Rahul"\n  }\n}', 'Object inside an object', 'json'))),
      block('These are not the same', '',
        table(['Value', 'Meaning'], [
          ['<code>null</code>', 'There is no value'],
          ['<code>false</code>', 'A real answer: no'],
          ['<code>0</code>', 'The number zero'],
          ['Missing field', 'Not provided at all'],
        ])),
    ],
  });

  /* ---------- 1.4 Headers, parameters, body ---------- */
  subs.push({
    key: 'request', title: 'Headers, Parameters and Body', lead: 'The parts of a request, and where each one goes.',
    blocks: [
      block('Parts of a URL', 'A path parameter says which resource. A query parameter says how to filter.', fig('urlParts')),
      block('Path or query?', '',
        table(['Request', 'Asks for'], [
          ['<code>GET /orders/123</code>', 'Order 123'],
          ['<code>GET /orders?status=paid</code>', 'Orders matching a filter'],
        ]) + '<p class="line">Query parameters are often used to filter, search, sort, paginate or choose a date range.</p>'),
      block('Headers', 'Extra information about the request or response.',
        code('Content-Type: application/json\nAccept: application/json\nAuthorization: Bearer YOUR_TOKEN', 'Headers') +
        table(['Header', 'Simple meaning'], [
          ['<code>Content-Type</code>', 'What format the request body uses'],
          ['<code>Accept</code>', 'What response format the client accepts'],
          ['<code>Authorization</code>', 'Credentials used to authenticate'],
        ]) +
        callout('amber', 'Security rule', 'Never share live API keys, passwords or tokens in screenshots, tickets or public repositories.')),
      block('Request body', 'Data sent with POST, PUT or PATCH. Not every endpoint needs one.',
        code('POST /customers\nContent-Type: application/json', 'Request') +
        code('{\n  "name": "Rahul",\n  "email": "rahul@example.com"\n}', 'Body', 'json') +
        '<p class="line">A missing or invalid field may be rejected with a validation error.</p>'),
    ],
  });

  /* ---------- 1.5 Authentication ---------- */
  subs.push({
    key: 'auth', title: 'Authentication', lead: 'Who is making this request, and what may they do?',
    blocks: [
      block('Authentication vs authorization', 'Like a building: the security desk checks who you are, then a key decides which rooms you can enter.',
        fig('flow', 'An authenticated caller can still get a 403 if they lack permission.', {
          items: [{ t: 'Request' }, { t: 'Authentication', s: 'Who are you? (401)', c: 'green' }, { t: 'Authorization', s: 'What can you do? (403)', c: 'amber' }, { t: 'Allowed', s: '200 OK' }],
          opts: { w: 160, gap: 36 },
        })),
      block('Ways to authenticate', '',
        table(['Method', 'What it is'], [
          ['API key', 'A secret or identifier used to access an API'],
          ['Bearer token', 'A token sent in the <code>Authorization</code> header'],
          ['OAuth 2.0', 'A framework that gives an app limited access'],
          ['Basic authentication', 'Username and password in encoded form. Needs HTTPS'],
        ])),
      block('An example', '',
        callout('green', '', '<strong>Authentication:</strong> this is the correct employee.') +
        callout('amber', '', '<strong>Authorization:</strong> this employee can view payments but cannot issue refunds.')),
    ],
  });

  /* ---------- 1.6 cURL ---------- */
  subs.push({
    key: 'curl', title: 'cURL', lead: 'Send a request from the command line and read the answer.',
    blocks: [
      block('What is cURL?', 'A command-line tool to test an API without building an app. It shows exactly what is sent.',
        code('curl https://api.example.com/customers/123', 'A GET request') +
        '<p class="line">Start with cURL, then use Postman for exploring.</p>'),
      block('Anatomy of a command', '',
        code(raw`curl -i \
  https://api.example.com/customers/123 \
  -H "Accept: application/json"`, 'Command') +
        table(['Part', 'Meaning'], [
          ['<code>curl</code>', 'Runs the tool'],
          ['<code>-i</code>', 'Include response headers'],
          ['URL', 'The endpoint'],
          ['<code>-H</code>', 'Add a header'],
        ]) +
        callout('amber', 'Windows tip', 'The backslash continues a line in Bash. In PowerShell, put the command on one line and type <code>curl.exe</code>, because <code>curl</code> is an alias for a different command there.')),
      block('Common options', '',
        table(['Option', 'What it does'], [
          ['<code>-X GET</code> / <code>-X POST</code>', 'Set the HTTP method (often not needed)'],
          ['<code>-H</code>', 'Add a header'],
          ['<code>-d</code>', 'Send data in the body'],
          ['<code>-i</code>', 'Show response headers with the body'],
          ['<code>-v</code>', 'Show connection and request details'],
          ['<code>-o file.txt</code>', 'Save the response body to a file'],
          ['<code>-w</code>', 'Print stats, such as the status code'],
        ])),
      block('A POST request', 'Use a test API or a mock endpoint to practise.',
        code(raw`curl -X POST https://api.example.com/customers \
  -H "Content-Type: application/json" \
  -d '{"name":"Rahul","email":"rahul@example.com"}'`, 'Create a customer') +
        steps(['cURL sends a POST request', 'The header says the body is JSON', '<code>-d</code> sends the customer data', 'The server processes it', 'cURL prints the response'])),
      block('With authentication', '',
        code(raw`curl https://api.example.com/customers \
  -H "Authorization: Bearer YOUR_TOKEN"`, 'Bearer token') +
        callout('amber', '', 'Use a valid <strong>test</strong> credential for an API you are allowed to use. Never commit a real secret.')),
      block('Read the status code', 'A 404 or 500 does not make cURL itself fail, so check the code.',
        code(raw`curl -sS -o response.json \
  -w "\nHTTP status: %{http_code}\n" \
  https://api.example.com/customers/123`, 'Save the body, print the status') +
        '<p class="line"><code>-sS</code> hides the progress meter but still shows errors.</p>'),
    ],
  });

  /* ---------- 1.7 Reading responses and status codes ---------- */
  subs.push({
    key: 'status', title: 'Responses and Status Codes', lead: 'Read the response, then the code.',
    blocks: [
      block('Read three things', '',
        legend([['', 'Status code', 'Did it work?'], ['', 'Body', 'Data or error message'], ['', 'Response time', 'Slow? Timed out?']]) +
        callout('amber', 'Careful', 'HTTP 200 does not always mean the business action worked. Read the body too.')),
      block('The four groups', '', groups([['2xx', 'Success', 'g2'], ['3xx', 'Redirect', 'g3'], ['4xx', 'Request or access problem', 'g4'], ['5xx', 'Server problem', 'g5']])),
      block('2xx: success', '', table(['Code', 'Meaning'], [
        ['<code>200 OK</code>', 'Request succeeded'],
        ['<code>201 Created</code>', 'A resource was created'],
        ['<code>202 Accepted</code>', 'Accepted for processing, not necessarily finished'],
        ['<code>204 No Content</code>', 'Succeeded with no body'],
      ])),
      block('3xx: redirection', '', table(['Code', 'Meaning'], [
        ['<code>301 Moved Permanently</code>', 'Permanent redirect'],
        ['<code>302 Found</code>', 'Temporary redirect'],
      ])),
      block('4xx: request or access problem', '', table(['Code', 'Meaning'], [
        ['<code>400 Bad Request</code>', 'The request is invalid'],
        ['<code>401 Unauthorized</code>', 'Authentication missing or invalid'],
        ['<code>403 Forbidden</code>', 'Access not permitted'],
        ['<code>404 Not Found</code>', 'Resource or endpoint not found'],
        ['<code>409 Conflict</code>', 'Conflicts with the current state'],
        ['<code>422 Unprocessable Content</code>', 'Content cannot be processed (where the API uses it)'],
        ['<code>429 Too Many Requests</code>', 'Rate limit exceeded'],
      ])),
      block('5xx: server problem', '',
        table(['Code', 'Meaning'], [
          ['<code>500 Internal Server Error</code>', 'Unexpected server error'],
          ['<code>502 Bad Gateway</code>', 'Gateway got an invalid response'],
          ['<code>503 Service Unavailable</code>', 'Temporarily unavailable'],
          ['<code>504 Gateway Timeout</code>', 'Gateway did not get a timely response'],
        ]) +
        callout('amber', 'Do not guess', 'A 4xx is not always the customer\'s fault and a 5xx is not always the provider\'s. Check the request, response, logs and documentation first.')),
    ],
  });

  /* ---------- 1.9 REST, pagination ---------- */
  subs.push({
    key: 'rest', title: 'REST, Pagination and Filtering', lead: 'How REST APIs are shaped, and how big lists are returned.',
    blocks: [
      block('What is REST?', 'Resource-style URLs plus HTTP methods.',
        table(['Method', 'URL', 'Action'], [
          ['GET', '<code>/customers</code>', 'List customers'],
          ['POST', '<code>/customers</code>', 'Create a customer'],
          ['GET', '<code>/customers/123</code>', 'Read one customer'],
          ['PATCH', '<code>/customers/123</code>', 'Update part of it'],
          ['DELETE', '<code>/customers/123</code>', 'Delete it'],
        ])),
      block('REST ideas', '', legend([
        ['', 'Resources', 'Customers, orders, payments'],
        ['', 'HTTP methods', 'GET, POST, PATCH, DELETE'],
        ['', 'Stateless', 'Each request carries what it needs'],
        ['', 'Status codes', 'Standard success and errors'],
        ['', 'Consistent names', 'And response formats'],
        ['', 'Not all are REST', 'GraphQL and RPC differ'],
      ])),
      block('Pagination', 'Large lists come back in smaller pieces.',
        fig('flow', 'Some APIs use a cursor in the response to point to the next page.', {
          items: [{ t: 'Page 1', s: '20 orders' }, { t: 'Page 2', s: 'next 20 orders' }, { t: 'Page 3', s: '...' }],
          opts: { w: 150, gap: 50 },
        }) + code('GET /orders?limit=20&offset=40', 'Skip 40, return 20')),
      block('Filtering and sorting', '', table(['Request', 'Result'], [
        ['<code>GET /orders?status=paid</code>', 'Only paid orders'],
        ['<code>GET /orders?sort=created_at</code>', 'Ordered by date'],
      ]) + callout('amber', 'Operations tip', 'If a payment looks missing, check whether only the first page was returned, or whether a filter hid it. Parameter names differ between APIs.')),
    ],
  });

  /* ---------- 1.10 Rate limits, retries, timeouts ---------- */
  subs.push({
    key: 'limits', title: 'Rate Limits, Retries and Timeouts', lead: 'What to do when requests are slow, repeated or refused.',
    blocks: [
      block('Rate limits', 'Too many requests in a period returns 429.', list([
        'How many requests are being sent?',
        'Are requests being repeated unnecessarily?',
        'Is there a <code>Retry-After</code> header?',
        'Does the system use a sensible retry plan?',
      ])),
      block('Retry with backoff', 'Wait a little, then wait longer after each failure.',
        fig('backoff') + callout('amber', 'Do not retry blindly', 'The first request may have succeeded. For payments, a careless retry can create a duplicate unless the API protects against it.')),
      block('Slow or broken', '',
        table(['Term', 'Meaning'], [
          ['Latency', 'How long a request takes'],
          ['Timeout', 'The client stops waiting'],
          ['Connection error', 'Cannot connect or stay connected'],
          ['DNS error', 'Hostname cannot be resolved'],
          ['TLS error', 'Secure connection cannot be set up or verified'],
        ])),
      block('A timeout is not a failure', 'The payment may exist even though the client saw nothing.',
        fig('lostResponse') + callout('green', 'Next action', 'Check the real status of the payment and read the API\'s retry guidance before sending another request.')),
    ],
  });

  /* ---------- 1.11 Webhooks ---------- */
  subs.push({
    key: 'webhooks', title: 'Webhooks', lead: 'The server notifies you when something happens.',
    blocks: [
      block('Ask, or be told', '', fig('webhookVsPolling')),
      block('An example event', 'This is a made-up event, not a Stripe one.',
        code('{\n  "type": "payment.succeeded",\n  "data": {\n    "id": "pay_123",\n    "status": "succeeded"\n  }\n}', 'Webhook payload', 'json')),
      block('A good receiver', 'Stripe webhooks are covered in the next module.', list([
        'Checks the notification is authentic',
        'Processes it safely',
        'Handles duplicate deliveries',
        'Replies with success so it is not retried',
      ])),
    ],
  });

  /* ---------- 1.12 Investigating errors ---------- */
  subs.push({
    key: 'errors', title: 'Investigating API Errors', lead: 'A repeatable method, not guesswork.',
    blocks: [
      block('The method', '',
        fig('flow', '', {
          items: [{ t: 'Collect evidence' }, { t: 'Read the error' }, { t: 'Check the docs' }, { t: 'Reproduce', s: 'with cURL' }, { t: 'Escalate', s: 'with a request ID', c: 'green' }],
          opts: { w: 140, gap: 30 },
        })),
      block('"My API isn\'t working"', 'Ask or find out:', steps([
        'Which endpoint and HTTP method?',
        'What time did it happen?',
        'What status code came back?',
        'What does the error response say?',
        'Did authentication succeed?',
        'Are required parameters present and valid?',
        'Is the request being rate-limited?',
        'Is there a request ID or correlation ID?',
        'Did the server finish the operation despite a timeout?',
        'What is the safest next action?',
      ])),
      block('Ask for the right things', '',
        two(callout('green', 'Ask for', 'Sanitised examples, timestamps, error messages and request IDs.'),
          callout('amber', 'Never ask for', 'Full secret keys, passwords or unredacted payment information.'))),
    ],
  });

  /* ---------- 1.13 Security and what next ---------- */
  subs.push({
    key: 'security', title: 'Security and What Next', lead: 'The basics you need, and what to learn after this.',
    blocks: [
      block('API security basics', '', legend([
        ['', 'HTTPS', 'Protects data in transit'],
        ['', 'Keys and tokens', 'Handle them securely'],
        ['', 'Least privilege', 'Only the permissions needed'],
        ['', 'Input validation', 'Reject bad input'],
        ['', 'Authentication', 'Who is calling'],
        ['', 'Authorization', 'What they may do'],
        ['', 'Sensitive data', 'Keep it out of logs'],
        ['', 'Secret rotation', 'Replace old or leaked secrets'],
        ['', 'Test vs live', 'Avoid real actions while testing'],
      ])),
      block('Credential or permission?', '',
        fig('panels', '', {
          left: { c: 'green', title: '401: CREDENTIAL PROBLEM', sub: 'We do not know who you are', items: ['Missing key', 'Wrong or expired key', 'Revoked key'] },
          right: { c: 'amber', title: '403: PERMISSION PROBLEM', sub: 'We know you, but no access', items: ['Key lacks a permission', 'Role cannot do this', 'Resource is off limits'] },
          arrow: false,
        })),
      block('More to learn', '',
        table(['Topic', 'Understand'], [
          ['API keys vs tokens', 'How credentials are issued and used'],
          ['OAuth 2.0', 'How apps get limited access'],
          ['Idempotency', 'How duplicate operations are prevented'],
          ['Webhook signatures', 'How to verify authenticity'],
          ['Asynchronous processing', 'Why accepted work may finish later'],
          ['Request IDs', 'How to trace one request'],
          ['Sandbox and testing', 'Test without real transactions'],
          ['API versioning', 'Behaviour can change between versions'],
          ['OpenAPI / Swagger', 'Describing an API in a standard way'],
          ['SDKs', 'Libraries that simplify requests'],
          ['Logs and monitoring', 'Find failures and patterns'],
          ['SQL basics', 'Inspect records when authorised'],
          ['Data privacy', 'Troubleshoot without exposing sensitive data'],
        ])),
    ],
  });

  /* ---------- 1.14 Tasks ---------- */
  const customerJson = '{\n  "customer": {\n    "id": "cus_123",\n    "name": "Rahul",\n    "active": true,\n    "balance": 1500,\n    "phone": null\n  },\n  "items": ["Laptop", "Mouse", "Keyboard"]\n}';
  subs.push({
    key: 'tasks', title: 'Tasks', lead: 'Try each task first. Open the solution only after you have an answer.',
    blocks: [
      task(1, 'Read the JSON', 'Answer: what is the customer ID? Is the customer active? What is the balance? Is <code>items</code> an object or an array? What does <code>phone: null</code> mean?',
        code(customerJson, 'response.json', 'json'),
        list(['Customer ID: <code>cus_123</code>', 'Active: yes (<code>true</code>)', 'Balance: <code>1500</code>', '<code>items</code> is an <strong>array</strong> (square brackets)', '<code>phone: null</code> means there is no phone value. It is not 0, not false, and not a missing field'])),
      task(2, 'Pick the method', 'Which HTTP method would you use for each? (a) Read one customer. (b) Create a customer. (c) Change only a phone number. (d) Delete a saved address.', '',
        table(['Job', 'Method', 'Example'], [
          ['Read one customer', 'GET', '<code>GET /customers/123</code>'],
          ['Create a customer', 'POST', '<code>POST /customers</code>'],
          ['Change only the phone number', 'PATCH', '<code>PATCH /customers/123</code>'],
          ['Delete a saved address', 'DELETE', '<code>DELETE /addresses/9</code>'],
        ])),
      task(3, 'Read the URL', 'What is this request asking for? <code>GET https://api.example.com/orders?status=paid&amp;limit=10</code>', '',
        list(['<code>/orders</code>: the orders resource', '<code>status=paid</code>: only paid orders', '<code>limit=10</code>: at most ten results', 'It is a read (GET), so it should not change anything'])),
      task(4, '401 or 403?', 'A customer\'s request returns 401 and another returns 403. What do you check for each?', '',
        table(['Code', 'Meaning', 'Check'], [
          ['401', 'Authentication missing or invalid', 'Is the key or token present, correct, not expired or revoked? Right header? Test vs live?'],
          ['403', 'Authenticated but not allowed', 'Does this key or role have permission for this action?'],
        ])),
      task(5, 'The missing payment', 'A customer says an old payment is missing from the API results. What could explain it?', '',
        list(['Only the first page was returned: follow the cursor or offset', 'A filter excluded it, such as <code>status</code> or a date range', 'It is in a different environment: test vs live', 'It belongs to another account or customer', 'It really does not exist: verify with the payment ID'])),
      task(6, 'The timeout', 'A payment request timed out. Did the payment fail? What do you do next?', '',
        '<p><strong>Not necessarily.</strong> The server may have created the payment while the response was lost.</p>' +
        steps(['Check the real status of the payment (by ID, or by listing recent payments)', 'Read the API\'s retry guidance', 'Retry only with an idempotency key, so a repeat cannot create a second charge'])),
      task(7, '"My API isn\'t working"', 'List five questions you would ask or check before changing anything.', '',
        list(['Which endpoint and method?', 'What time did it happen?', 'What status code and error body came back?', 'Is there a request ID?', 'Did authentication succeed, and is it test or live?'])),
    ],
  });

  Ops.content['session-1'] = Ops.h.module({
    id: 'session-1', prefix: 's1', num: 1, title: 'REST APIs and Postman',
    lead: 'Almost every system you support talks through APIs. Learn to build a request, read the response, and find out why one fails.',
    tag: ' <span class="tag amber">Highest priority</span>',
    learn: [
      'HTTP methods: GET, POST, PUT, PATCH, DELETE',
      'Status codes: 200, 201, 400, 401, 403, 404, 500',
      'Headers, request body, query parameters and path parameters',
      'Authentication: API keys, Bearer tokens, JWT',
      'JSON responses, pagination, filtering and sorting',
      'Rate limits, timeouts, retries and API error handling',
      'Testing endpoints using Postman',
    ],
    subs,
  });
})();
