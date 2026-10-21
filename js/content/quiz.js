/* Session 6: Quiz. One section per question. Pick an answer: green if right, red if wrong. */
(() => {
  const { block, esc, code, table, steps, callout, legend } = Ops.h;
  const L = 'ABCD';

  /* [short title, question, [options], index of right answer, why] */
  const SET1 = [
    /* Stripe API core concepts */
    ['Duplicate customers', 'When a user reports "created a customer twice," which Stripe mechanism is most directly relevant for troubleshooting?',
      ['Pagination', 'Idempotency Key', 'Expand', 'Webhook signature verification'], 1,
      'An idempotency key makes a POST safe to retry. Without one, a retry after a network timeout creates a second customer.'],
    ['Idempotency methods', 'Which HTTP methods in the Stripe API support idempotency keys?',
      ['GET and POST', 'POST only', 'POST and DELETE', 'All methods'], 1,
      'In API v1 every POST accepts an idempotency key. GET and DELETE are already idempotent, so a key has no effect.'],
    ['Reused key after 24 hours', 'A user retries a POST with the same idempotency key 25 hours after the first request, but the parameters have changed. What happens?',
      ['The new request runs and the old key is ignored', 'Returns a parameter conflict error', 'Returns the result of the first request', 'Returns a 500 error'], 1,
      'Keys are kept for at least 24 hours, and reusing one with different parameters is an error to prevent misuse. If the key was already cleared, it would count as a new request.'],
    ['Cursor pagination', 'What is the main advantage of cursor-based pagination over offset-based pagination?',
      ['Simpler implementation', 'Supports random access to any page', 'More stable and efficient when paginating deep into large datasets', 'Automatically returns all data'], 2,
      'starting_after / ending_before avoid the slowdown of a large OFFSET and keep the ordering stable.'],
    ['Only 10 customers', 'A user complains that "listing customers only returns 10 records." Which parameter adjusts this?',
      ['page_size', 'limit', 'count', 'max_results'], 1,
      'List APIs use limit. It defaults to 10 and the maximum is 100.'],
    ['The expand parameter', 'What is the purpose of the expand parameter in the Stripe API?',
      ['Increase the rate limit', 'Inline related objects in the response, avoiding extra requests', 'Enable debug mode', 'Extend the idempotency key validity period'], 1,
      'expand puts related objects (such as the customer on a charge) inside the response, so you need fewer round trips.'],
    ['Idempotency-Key header', 'What is the core role of the Idempotency-Key header?',
      ['Authenticate the request', 'Encrypt the request body', 'Make sure retrying the same request has only one side effect', 'Record request logs'], 2,
      'The client can retry safely after a network failure, and the server returns the first result instead of running the request again.'],
    ['Results that are not saved', 'In which situation will Stripe not save the idempotency result?',
      ['The request returns 200', 'The request returns 500', 'The request parameter validation fails', 'The request creates a customer'], 2,
      'A result is saved only once the endpoint starts executing. If validation fails, or the request conflicts with a concurrent one, execution never starts, so nothing is saved and the request can be retried.'],
    ['429 Too Many Requests', 'A user\'s integration reports a 429 Too Many Requests. What should they do?',
      ['Retry immediately in a loop', 'Check the Retry-After header and retry with exponential backoff', 'Switch to a live key', 'Increase the limit parameter'], 1,
      '429 means rate limited. Respect Retry-After and use exponential backoff with jitter.'],
    ['Key retention', 'What is the default retention period for Stripe idempotency keys?',
      ['1 hour', '24 hours', '7 days', 'Permanent'], 1,
      'Keys are cleared after at least 24 hours. Reusing a cleared key is treated as a new request.'],

    /* Troubleshooting and error handling */
    ['401 Unauthorized', 'A user reports a 401 Unauthorized error. What is the most likely cause?',
      ['The request body format is incorrect', 'The API key is missing, invalid, or revoked', 'The endpoint path is incorrect', 'Rate limit exceeded'], 1,
      '401 is an authentication failure: an invalid or revoked key, or a test key used against live mode (or the other way round).'],
    ['401 vs 403', 'What is the difference between 403 Forbidden and 401 Unauthorized?',
      ['No difference, both require re-login', '401 means identity not recognized; 403 means identity recognized but no permission', '403 is authentication failure and 401 is authorization failure', 'Both mean the API key has expired'], 1,
      '401: the server does not know who you are. 403: it knows, but you may not do this. Mixing them up makes clients retry authentication when it cannot help.'],
    ['Missing Content-Type', 'A user\'s code makes a POST request but forgets to set the Content-Type: application/json header. What is the most likely result?',
      ['The request runs normally', 'The server cannot parse the body and returns a 400 error', 'It redirects to the correct format', 'Returns a 401 error'], 1,
      'Content-Type tells the server how to read the body. If JSON is expected and the header is missing, the body may be rejected or misread.'],
    ['Resource not found', 'What HTTP status code does Stripe return when a resource does not exist?',
      ['400', '401', '404', '500'], 2,
      '404 Not Found. For example, GET /v1/customers/cus_invalid returns 404.'],
    ['Cause of a 500', 'What is the typical cause of a 500 Internal Server Error in the Stripe API?',
      ['User input error', 'Server-side internal error', 'API key expired', 'Endpoint path misspelled'], 1,
      '5xx errors are server-side, not mistakes in the request. For a POST, retry with the same idempotency key.'],
    ['Webhook not received', 'A user\'s webhook endpoint does not receive events. Which is NOT a possible reason?',
      ['The endpoint URL is unreachable', 'Signature verification failed, so the endpoint rejected the request', 'The user did not set the limit parameter', 'The event type is not subscribed in the Dashboard'], 2,
      'limit only changes the size of list API responses. It has nothing to do with webhook delivery.'],
    ['Success but nothing changed', 'A user reports "the API returns success but data is not updated." What should you investigate first?',
      ['Whether the API key is live mode', 'Whether the status is 2xx and the returned fields match expectations', 'Whether the network is disconnected', 'Whether the account balance is insufficient'], 1,
      'Start with the actual response (status and body) instead of assuming nothing happened. Often a 200 came back and the user is looking at the wrong environment (test vs live) or the wrong object.'],
    ['Stripe-Version header', 'What is the purpose of the Stripe-Version header?',
      ['Specify the API version used for the request', 'Specify the client SDK version', 'Specify the user\'s browser version', 'Specify the idempotency key version'], 0,
      'It pins the request to an API version, so upgrades do not change behavior unexpectedly.'],
    ['Signature failures', 'A user reports intermittent webhook signature verification failures. What should you do?',
      ['Ask them to disable signature verification', 'Check whether the raw body is used for verification, not parsed JSON', 'Increase the rate limit', 'Switch to a test key'], 1,
      'Verification needs the original request body. If the framework parses the JSON first, the signature will not match.'],
    ['400 on create charge', 'A user\'s integration gets 400 Bad Request when creating a charge. What is the most efficient place to start?',
      ['Check Stripe\'s status page', 'Read the error field in the response (type, code, message)', 'Reinstall the SDK', 'Contact the user\'s bank'], 1,
      'Stripe errors are structured. error.code and error.message usually point straight to the cause, such as a missing parameter or invalid amount.'],

    /* Usage scenarios and data analysis */
    ['High failure rate', 'When analyzing a user\'s "high failure rate" issue, which SQL query is the most direct way to find the pattern?',
      ['SELECT * FROM charges', 'SELECT status, COUNT(*) FROM charges GROUP BY status', 'SELECT * FROM customers', 'SELECT COUNT(*) FROM events'], 1,
      'Grouping by status shows how failures are distributed. Then split further by time and error code.'],
    ['Success rate dropped', 'A user reports "success rate decreased last week." What is the most reasonable first step?',
      ['Change the API version immediately', 'Compare success rate by day, card brand and error code to find the change point', 'Ask the user to retry', 'Disable webhooks'], 1,
      'Let the data lead: segment by dimension to find when and where it changed, instead of changing configuration blindly.'],
    ['Top 10 failing customers', 'Which query best identifies the 10 customers with the most failed charges?',
      ['SELECT * FROM charges WHERE status = \'failed\' LIMIT 10', 'SELECT customer, COUNT(*) FROM charges WHERE status = \'failed\' GROUP BY customer ORDER BY COUNT(*) DESC LIMIT 10', 'SELECT COUNT(*) FROM charges', 'SELECT * FROM customers LIMIT 10'], 1,
      'Group by customer, sort by the failure count descending, and take the top 10.'],
    ['Paginating all customers', 'How should a user correctly retrieve all customers page by page?',
      ['Loop with the same starting_after value', 'Use the last object\'s ID from each page as starting_after, until has_more is false', 'Raise limit to 1000 to get everything at once', 'Send a GET request with an idempotency key'], 1,
      'Cursor pagination: the last ID of the previous page becomes starting_after for the next. Stop when has_more is false.'],
    ['The has_more field', 'What is the purpose of the has_more field in a Stripe list response?',
      ['Total number of records', 'Whether there are more records after this page', 'The current page number', 'The number of records on this page'], 1,
      'has_more: true means keep paginating. false means this was the last page.'],
    ['Bigger response with expand', 'A user says "I used expand=customer but the response is larger than before." What is the reasonable explanation?',
      ['The API version is outdated', 'expand inlines the full customer object, so the body is bigger', 'The idempotency key expired', 'Rate limit triggered'], 1,
      'That is expected. Inlined objects add payload, so mind client parsing and bandwidth.'],
    ['Failures on one day', 'To show that a failure mode was concentrated on one day, which SQL pattern fits best?',
      ['SELECT * FROM charges', 'SELECT DATE(created), status, COUNT(*) FROM charges GROUP BY 1,2 ORDER BY 1', 'SELECT COUNT(*) FROM customers', 'SELECT MAX(amount) FROM charges'], 1,
      'Group by date and status to see the trend over time and the status mix.'],
    ['Webhook processing failed', 'A user reports "webhook received but processing failed." What is the key thing to confirm?',
      ['Whether the endpoint returns 2xx within the timeout', 'Whether the API key is live mode', 'Whether limit is large enough', 'Whether expand is used'], 0,
      'Stripe counts a delivery as successful only if the endpoint returns 2xx in time. A non-2xx or timeout causes retries.'],
    ['Reducing support contacts', 'What is the best practice for reducing support contacts?',
      ['Respond to users faster', 'Improve documentation and error messages so users can solve common issues themselves', 'Reduce API rate limits', 'Disable phone support'], 1,
      'Writing and refining documentation so users can self-serve is a core responsibility of this role.'],
    ['A frustrated user', 'In an API troubleshooting scenario, what is the most effective first response to a very frustrated user?',
      ['Blame the user\'s code', 'Acknowledge the frustration, then ask for the error message, request ID or timestamps', 'Send a documentation link', 'Escalate to engineering immediately'], 1,
      'Acknowledge the emotion first, then get specifics. The request ID is the key entry point for troubleshooting at Stripe.'],
  ];


  /* Set Two: SQL and APIs. A sixth item, when present, is an example query shown in the hint. */
  const SET2 = [
    /* SQL fundamentals */
    ['What SQL is for', 'What is SQL primarily used for?',
      ['Designing web pages', 'Managing and querying relational databases', 'Creating operating systems', 'Sending HTTP requests'], 1,
      'SQL is used to retrieve, insert, update and delete data in relational databases.'],
    ['Primary key', 'What is a primary key?',
      ['A column that allows duplicate values', 'A column that uniquely identifies each row', 'A column used only for sorting', 'A key used to connect to an API'], 1,
      'A primary key uniquely identifies each record and cannot contain NULL values.'],
    ['Foreign key', 'What is a foreign key?',
      ['A key that uniquely identifies every database', 'A column that references a key in another or the same table', 'A password for the database', 'A column that must contain text'], 1,
      'Foreign keys set up relationships between tables and can help enforce referential integrity.'],
    ['Filter before grouping', 'Which SQL clause filters rows before grouping?',
      ['HAVING', 'ORDER BY', 'WHERE', 'GROUP BY'], 2,
      'WHERE filters individual rows before GROUP BY creates the groups.'],
    ['Filter groups', 'Which SQL clause filters grouped results?',
      ['WHERE', 'HAVING', 'SELECT', 'JOIN'], 1,
      'HAVING filters groups, often with aggregate functions such as COUNT() or SUM().'],
    ['LEFT JOIN', 'Which JOIN returns all customers, including customers without payments?',
      ['INNER JOIN', 'LEFT JOIN with customers on the left', 'CROSS JOIN', 'SELF JOIN'], 1,
      'A LEFT JOIN keeps every row from the left table and returns NULL for unmatched right-side columns.'],
    ['Customers with no payment', 'Which query finds customers who have never made a payment?',
      ['SELECT *\nFROM customers c\nINNER JOIN payments p\nON p.customer_id = c.id;',
       'SELECT c.*\nFROM customers c\nLEFT JOIN payments p\nON p.customer_id = c.id\nWHERE p.id IS NULL;',
       'SELECT *\nFROM payments\nWHERE customer_id IS NULL;',
       'SELECT *\nFROM customers\nORDER BY id;'], 1,
      'LEFT JOIN keeps every customer. If a customer has no matching payment, p.id is NULL, and the WHERE clause picks those customers out.'],
    ['COUNT DISTINCT', 'What does COUNT(DISTINCT customer_id) return?',
      ['The total number of rows', 'The number of unique non-NULL customer IDs', 'The number of NULL customer IDs', 'The sum of customer IDs'], 1,
      'DISTINCT removes duplicate values, and COUNT ignores NULL values.'],
    ['GROUP BY', 'What does GROUP BY do?',
      ['Deletes duplicate rows permanently', 'Groups rows with matching values so aggregate calculations can be performed', 'Sorts rows alphabetically', 'Joins two tables'], 1,
      'GROUP BY lets you calculate totals, counts, averages and other aggregates for each group.'],
    ['Top five payments', 'Which query returns the five highest-value payments first?',
      ['SELECT *\nFROM payments\nORDER BY amount DESC\nLIMIT 5;',
       'SELECT *\nFROM payments\nORDER BY amount ASC\nLIMIT 5;',
       'SELECT TOP amount 5\nFROM payments;',
       'SELECT *\nFROM payments\nGROUP BY amount\nLIMIT 5;'], 0,
      'ORDER BY amount DESC sorts from largest to smallest, and LIMIT 5 returns the first five rows. Syntax varies by database.'],

    /* SQL data analysis */
    ['Failed in last 24 hours', 'Which query finds failed payments from the last 24 hours?',
      ['SELECT *\nFROM payments\nWHERE status = \'failed\'\nAND created_at >= CURRENT_TIMESTAMP - INTERVAL \'24 hours\';',
       'SELECT *\nFROM payments\nWHERE status = \'failed\'\nOR created_at < CURRENT_TIMESTAMP;',
       'SELECT failed\nFROM payments\nLIMIT 24;',
       'SELECT *\nFROM payments\nORDER BY status;'], 0,
      'It filters by failed status and by a timestamp within the past 24 hours. Interval syntax depends on the database.'],
    ['Total per customer', 'How do you calculate the total payment amount for each customer?',
      ['SELECT customer_id, SUM(amount)\nFROM payments\nGROUP BY customer_id;',
       'SELECT customer_id, COUNT(amount)\nFROM payments;',
       'SELECT SUM(customer_id)\nFROM payments;',
       'SELECT customer_id\nFROM payments\nORDER BY amount;'], 0,
      'SUM() adds the payment amounts, and GROUP BY calculates the total separately for each customer.'],
    ['More than three failures', 'Which approach finds customers with more than three failed payments?',
      ['Use WHERE COUNT(*) > 3 directly', 'Filter failed payments, group by customer_id, and use HAVING COUNT(*) > 3', 'Use ORDER BY COUNT(*) > 3', 'Use LIMIT 3'], 1,
      'Filter the failed payments first, group the results by customer, then use HAVING to keep groups with more than three records.',
      'SELECT customer_id, COUNT(*) AS failed_count\nFROM payments\nWHERE status = \'failed\'\nGROUP BY customer_id\nHAVING COUNT(*) > 3;'],
    ['Subquery', 'What is a subquery?',
      ['A query inside another SQL query', 'A database backup', 'A type of API', 'A command that always deletes rows'], 0,
      'A subquery is nested inside another query and can provide values or result sets for the outer query.'],
    ['Average', 'Which SQL function calculates the average of numeric values?',
      ['SUM()', 'COUNT()', 'AVG()', 'MAX()'], 2,
      'AVG() calculates the arithmetic mean of non-NULL numeric values.'],
    ['CTE', 'What is a CTE in SQL?',
      ['A temporary named result set defined using WITH', 'A permanent database table in every case', 'A primary key constraint', 'A type of JOIN'], 0,
      'A Common Table Expression makes complex queries easier to organize. It generally exists only for the statement it is defined in.',
      'WITH successful_payments AS (\n    SELECT *\n    FROM payments\n    WHERE status = \'succeeded\'\n)\nSELECT COUNT(*)\nFROM successful_payments;'],
    ['ROW_NUMBER', 'Which window function assigns a unique sequential number to each row within a partition?',
      ['SUM()', 'ROW_NUMBER()', 'COUNT()', 'AVG()'], 1,
      'ROW_NUMBER() gives rows sequential numbers within a partition, following the specified ordering.'],
    ['JOIN adds rows', 'A JOIN unexpectedly increases the number of rows. What is the most likely reason?',
      ['The database changed SQL into Python', 'One or more rows match multiple rows in the joined table', 'ORDER BY is missing', 'Every JOIN always doubles the rows'], 1,
      'A one-to-many or many-to-many relationship can multiply rows. Check the join keys, the table relationships, and whether you need to aggregate.'],
    ['COALESCE', 'What does COALESCE(amount, 0) do?',
      ['Converts every amount to a string', 'Returns 0 when amount is NULL; otherwise returns amount', 'Deletes NULL rows', 'Rounds amounts to zero decimal places'], 1,
      'COALESCE returns the first non-NULL expression from its arguments.'],
    ['Daily successful payments', 'A daily report needs the number of successful payments per day. Which approach is best?',
      ['Group payments by creation date and count records filtered to successful status', 'Sort all payments by customer name', 'Use DELETE with a date condition', 'Count all records without filtering'], 0,
      'Filter for successful payments, group them by the relevant date, and count the records in each group.',
      'SELECT DATE(created_at) AS payment_date,\n       COUNT(*) AS successful_count\nFROM payments\nWHERE status = \'succeeded\'\nGROUP BY DATE(created_at)\nORDER BY payment_date;'],

    /* APIs and technical troubleshooting */
    ['What an API is', 'What is an API?',
      ['A database table', 'A defined interface that allows software systems to communicate', 'A programming language used only for websites', 'A type of SQL JOIN'], 1,
      'An API defines how one system can request functionality or data from another.'],
    ['Retrieving a resource', 'Which HTTP method is normally used to retrieve a resource?',
      ['POST', 'DELETE', 'GET', 'PATCH'], 2,
      'GET requests a resource. It is meant to be safe and should not change state on the server.'],
    ['Status code 201', 'What does HTTP status code 201 usually mean?',
      ['Unauthorized', 'Resource successfully created', 'Internal server error', 'Too many requests'], 1,
      '201 Created means the request resulted in a new resource being created.'],
    ['Status code 401', 'What does HTTP status code 401 usually indicate?',
      ['Authentication credentials are missing or invalid', 'The server is overloaded', 'The requested resource was created', 'The request was rate-limited'], 0,
      'Check API keys, bearer tokens, authentication headers, credential validity, and which environment is being used.'],
    ['401 vs 403', 'What is the difference between HTTP 401 and 403?',
      ['They always mean exactly the same thing', '401 relates to authentication, while 403 generally means access is forbidden', '401 means success, while 403 means not found', '403 always means a server crash'], 1,
      '401 means valid authentication has not been established. 403 generally means the server refuses access, often because the authenticated caller lacks permission.'],
    ['Status code 429', 'What does HTTP status code 429 mean?',
      ['Not found', 'Bad request', 'Too many requests or rate limit exceeded', 'Resource created'], 2,
      'Respect rate limits, check the Retry-After header when present, and use a retry strategy with backoff.'],
    ['What a webhook is', 'What is a webhook?',
      ['A SQL function', 'A mechanism that sends event notifications to a configured endpoint', 'An API authentication password', 'A database index'], 1,
      'Webhooks notify another system when an event occurs, such as a payment succeeding or failing.'],
    ['200 but not completed', 'An API returns HTTP 200, but the customer says the payment has not completed. What should you investigate?',
      ['Assume the payment definitely succeeded', 'Check the response body, payment status, and relevant events or webhooks', 'Retry the charge repeatedly and immediately', 'Ignore the response body'], 1,
      'HTTP 200 means the HTTP request worked, not that the payment reached its final successful state. Inspect the payment\'s actual status and related events.'],
    ['First step on a failed call', 'A customer reports a failed API call. What is the best first step?',
      ['Immediately change production code', 'Collect request details, timestamp, endpoint, status code and error response, while protecting sensitive data', 'Ask the customer to share their secret API key publicly', 'Assume the database is broken'], 1,
      'Gather evidence before deciding on a fix. Redact secret keys and sensitive payment information before sharing logs or request details.'],
    ['Idempotency key', 'What is an idempotency key used for in payment APIs?',
      ['To encrypt a database', 'To help safely retry a request without unintentionally creating the same operation twice', 'To increase the payment amount', 'To bypass authentication'], 1,
      'On supported endpoints, reusing the same idempotency key helps prevent duplicate operations when a request is retried after a timeout or an uncertain response.'],
  ];


  /* Set Three: cURL. Item 6 is an example shown in the hint, item 7 is code shown under the question. */
  const SET3 = [
    /* cURL fundamentals */
    ['What cURL is for', 'What is cURL primarily used for?',
      ['Creating database tables', 'Sending requests to servers and APIs', 'Designing frontend pages', 'Managing database relationships'], 1,
      'cURL is a command-line tool that talks to servers over protocols such as HTTP and HTTPS.'],
    ['Basic GET request', 'Which command sends a basic GET request to an API?',
      ['curl https://api.example.com/users', 'curl CREATE https://api.example.com/users', 'curl SQL https://api.example.com/users', 'curl DATABASE https://api.example.com/users'], 0,
      'GET is the default HTTP method cURL uses for a basic HTTP request.'],
    ['Setting the method', 'Which cURL option explicitly specifies the HTTP method?',
      ['-H', '-d', '-X', '-o'], 2,
      '-X specifies the HTTP method.',
      'curl -X DELETE https://api.example.com/users/10'],
    ['Sending a header', 'Which cURL option sends an HTTP header?',
      ['-H', '-X', '-o', '-k'], 0,
      'The -H option adds a header to the HTTP request.',
      'curl -H "Accept: application/json" \\\nhttps://api.example.com/users'],
    ['Sending POST data', 'Which cURL option is commonly used to send data in a POST request?',
      ['-v', '-d', '-I', '-L'], 1,
      '-d sends request data. For HTTP, cURL normally uses POST when -d is given, unless another method is set explicitly.',
      'curl -X POST \\\nhttps://api.example.com/users \\\n-d "name=Rahul"'],

    /* Headers and authentication */
    ['Content-Type header', 'What does the following header usually indicate?',
      ['The response must be XML', 'The request body contains JSON data', 'The API requires no authentication', 'The request must use GET'], 1,
      'Content-Type tells the server what format the request body uses.', null,
      '-H "Content-Type: application/json"'],
    ['Authorization header', 'What is the purpose of the Authorization header?',
      ['To sort API results', 'To provide authentication credentials', 'To specify the database name', 'To change the HTTP method'], 1,
      'APIs commonly use Authorization headers to carry credentials, such as bearer tokens.',
      'curl https://api.example.com/users \\\n-H "Authorization: Bearer YOUR_TOKEN"'],
    ['401 in cURL', 'What does HTTP 401 usually mean when making a cURL request?',
      ['Authentication is missing or invalid', 'The request succeeded', 'The server created a resource', 'The request exceeded the response size'], 0,
      'Check the API key, the token, the Authorization header, and whether the credentials belong to the right environment.'],
    ['403 in cURL', 'What does HTTP 403 usually mean?',
      ['The server has returned a successful response', 'The request is forbidden, often because of insufficient permissions', 'The API endpoint does not exist in every case', 'The request body contains valid JSON'], 1,
      'Authentication may be valid, but the caller is not allowed to perform the requested action.'],
    ['Sending a JSON body', 'Which cURL command sends a JSON request body correctly?',
      ['curl https://api.example.com/users \\\n-H "Content-Type: application/json" \\\n-d \'{"name":"Rahul"}\'',
       'curl https://api.example.com/users \\\n-H "GET: application/json" \\\n-d \'{"name":"Rahul"}\'',
       'curl JSON https://api.example.com/users',
       'curl https://api.example.com/users \\\n-H "Authorization: application/json"'], 0,
      'The Content-Type header identifies the body as JSON, and -d supplies the JSON payload.'],

    /* HTTP methods and request bodies */
    ['Creating a resource', 'Which HTTP method is normally used to create a new resource?',
      ['GET', 'POST', 'HEAD', 'OPTIONS'], 1,
      'POST is commonly used to submit data or create a resource, depending on the endpoint.'],
    ['PUT vs PATCH', 'What is the difference between PUT and PATCH?',
      ['PUT always retrieves data, while PATCH deletes it', 'PUT commonly replaces a resource, while PATCH applies partial modifications', 'Both methods always delete a resource', 'There is no possible difference between them'], 1,
      'PUT is generally used to replace a resource representation, while PATCH applies partial changes. Exact behavior depends on the API.'],
    ['Query parameters', 'Which cURL option sends query parameters as part of a URL?',
      ['-G', '-k', '-o', '-I'], 0,
      '-G, combined with -d or --data-urlencode, places the data in the URL query string and sends a GET request.',
      'curl -G https://api.example.com/users \\\n--data-urlencode "status=active"'],
    ['The -i option', 'What does the following command do?',
      ['Hides the HTTP response headers', 'Includes HTTP response headers in the output', 'Sends an email', 'Deletes the endpoint'], 1,
      '-i shows the response headers along with the response body.', null,
      'curl -i https://api.example.com/users'],
    ['The -v option', 'What does the -v option do in cURL?',
      ['Enables verbose output for debugging', 'Validates a database', 'Converts JSON to SQL', 'Hides error messages'], 0,
      'Verbose mode shows extra request and connection details, which helps diagnose API problems. Be careful not to expose credentials or sensitive data in logs.'],

    /* Response codes and error handling */
    ['404 in cURL', 'Your cURL request returns HTTP 404. What does this usually mean?',
      ['Authentication succeeded', 'The requested resource or endpoint was not found', 'The request was rate-limited', 'The server created a resource'], 1,
      'Check the URL, the endpoint path, the resource ID, the API version, and whether the resource exists.'],
    ['429 in cURL', 'Your API request returns HTTP 429. What should you investigate?',
      ['Whether the SQL table has a primary key', 'Whether the API rate limit has been exceeded', 'Whether the frontend uses CSS', 'Whether the server supports HTML only'], 1,
      'Review the rate-limit information and any Retry-After header. Retry with an appropriate delay and a backoff strategy.'],
    ['500 in cURL', 'What does HTTP 500 generally indicate?',
      ['A server-side error', 'A successful payment in every case', 'An invalid API key in every case', 'A missing request body in every case'], 0,
      'HTTP 500 is an internal server error. Check the response body, the request logs, timestamps and request identifiers.'],
    ['HEAD request', 'Which command displays only the response headers by making a HEAD request?',
      ['curl -I https://api.example.com/users', 'curl -d https://api.example.com/users', 'curl -X POST https://api.example.com/users', 'curl -H https://api.example.com/users'], 0,
      '-I sends a HEAD request and shows the response headers without the usual body. Some APIs handle HEAD differently or do not support it.'],
    ['400 in cURL', 'Why might a cURL request return HTTP 400?',
      ['The request may contain invalid parameters, malformed JSON, or missing required fields', 'The request always succeeded', 'The database is guaranteed to be offline', 'The user has definitely exceeded a rate limit'], 0,
      '400 Bad Request usually points to a problem with the request itself. Read the API\'s error message to find the specific issue.'],

    /* Practical cURL troubleshooting */
    ['Missing Content-Type', 'Why might the following command fail when the API expects JSON?',
      ['cURL cannot send POST requests', 'The request may be missing the Content-Type header expected by the API', 'JSON cannot contain strings', 'Every POST request requires a SQL query'], 1,
      'Add the JSON Content-Type header when the API requires it.',
      'curl -X POST https://api.example.com/users \\\n-H "Content-Type: application/json" \\\n-d \'{"name":"Rahul"}\'',
      'curl -X POST https://api.example.com/users \\\n-d \'{"name":"Rahul"}\''],
    ['SSL certificate error', 'A cURL request returns an SSL certificate verification error. What is the best approach?',
      ['Permanently disable SSL verification for all requests', 'Investigate the certificate, system CA certificates, and server configuration', 'Remove the API endpoint', 'Change POST to DELETE'], 1,
      'Verify the certificate chain, the hostname, the system clock and the CA trust store. The -k option disables certificate verification and should not be a routine production fix.'],
    ['Following redirects', 'What does the following cURL option do?',
      ['Follows HTTP redirects', 'Deletes the URL', 'Adds an API key', 'Sends a SQL query'], 0,
      '-L tells cURL to follow redirect responses such as HTTP 301 or 302, within cURL\'s redirect and security behavior.', null,
      'curl -L https://example.com'],
    ['Request timeout', 'A cURL request times out. What should you investigate first?',
      ['Network connectivity, endpoint availability, server latency, and timeout settings', 'The user\'s CSS files', 'The database\'s table names only', 'Whether the request uses alphabetical sorting'], 0,
      'Work out whether the request reached the server, inspect latency and connectivity, and tell connection timeouts apart from response timeouts.'],
    ['Failing on HTTP errors', 'How can you make cURL fail with a nonzero exit code for HTTP error responses such as 404 or 500?',
      ['curl --fail-with-body https://api.example.com/users', 'curl --success-only https://api.example.com/users', 'curl --ignore-http-errors https://api.example.com/users', 'curl --status-zero https://api.example.com/users'], 0,
      '--fail-with-body returns a nonzero exit status for HTTP responses with status 400 or higher, and keeps the response body. Modern cURL versions support it.'],

    /* Stripe-style API scenarios */
    ['Retrieve a PaymentIntent', 'You need to retrieve a Stripe PaymentIntent using cURL. Which command is most appropriate?',
      ['curl https://api.stripe.com/v1/payment_intents/pi_example \\\n-u "sk_test_REPLACE_ME:"',
       'curl https://api.stripe.com/v1/payment_intents/pi_example \\\n-H "Content-Type: text/html"',
       'curl -X DELETE https://api.stripe.com/v1/payment_intents/pi_example',
       'curl SQL https://api.stripe.com/v1/payment_intents/pi_example'], 0,
      'Stripe API requests can use HTTP Basic authentication: the secret API key is the username and the password is empty. Replace the placeholder with an authorized test key, and never expose a real secret key.'],
    ['requires_action', 'A Stripe API request returns HTTP 200, but the PaymentIntent status is requires_action. What does this mean?',
      ['The payment is definitely complete', 'The payment requires an additional action before it can proceed', 'The API key is definitely invalid', 'The PaymentIntent has been deleted'], 1,
      'HTTP 200 means the API request was processed. The PaymentIntent status describes the payment itself, and requires_action often means the customer must complete an extra authentication step.'],
    ['Duplicate payments on retry', 'A customer reports duplicate payments after retrying API requests. Which concept is most relevant?',
      ['CSS selectors', 'Idempotency keys', 'SQL ORDER BY', 'HTTP response compression'], 1,
      'Stripe supports idempotency keys on applicable requests. Reuse the same key when retrying the same operation, and do not generate a new key for each retry of the same logical request.'],
    ['Webhook not arriving', 'A Stripe webhook event is not reaching the customer\'s application. What should you check?',
      ['The configured endpoint URL, webhook delivery attempts, HTTP responses, server logs, and signature verification', 'Only the customer\'s browser theme', 'The SQL ORDER BY clause', 'Whether the API uses a GET request for every operation'], 0,
      'Look at webhook delivery records, endpoint reachability, response status, timeouts and signature verification. An endpoint should return a successful response promptly and handle duplicate deliveries safely.'],
    ['"Request failed"', 'A customer says their cURL request failed, but gives only the error message "Request failed." What is the best next step?',
      ['Immediately assume Stripe is down', 'Ask for the endpoint, HTTP method, timestamp, status code, response body, and a safely redacted request example', 'Ask them to send their secret API key in plain text', 'Tell them to repeat the request continuously'], 1,
      'Collect enough evidence to reproduce and diagnose the issue, and protect secret keys, personal information and payment data. Then investigate authentication, parameters, API behavior and request logs.'],
  ];


  /* ---------- cURL theory: plain-English review page, opened from Set Three ---------- */
  const theory = [
    block('What is cURL?', 'A small program that lets you <strong>send a request to a server from the terminal</strong> and see what comes back.',
      `<p class="line">Think of it as a browser with no screen. A browser asks a website for a page. cURL asks an API for data, or tells it to do something, and prints the answer as text.</p>` +
      table(['You write', 'cURL does', 'You get'], [
        ['A URL and some options', 'Sends the request over HTTP or HTTPS', 'The status code and the response body'],
      ]) +
      callout('green', 'Why support engineers use it', 'It shows exactly what was sent and what came back, with no app in between. That makes it the fastest way to repeat a customer\'s problem.')),

    block('Parts of a request', 'Every request has the same few parts. cURL has an option for each one.',
      table(['Part', 'What it is', 'cURL option'], [
        ['URL', 'Where you send the request', 'The address itself'],
        ['Method', 'What you want to do: read, create, change, delete', '<code>-X</code>'],
        ['Headers', 'Extra information: format, login, version', '<code>-H</code>'],
        ['Body', 'The data you send', '<code>-d</code>'],
        ['Login', 'Who you are', '<code>-u</code> or an Authorization header'],
      ]) +
      code(`curl -X POST https://api.example.com/users \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer YOUR_TOKEN" \\
  -d '{"name":"Rahul"}'`, 'One request, with every part') +
      callout('amber', 'The backslash', 'A <code>\\</code> at the end of a line only means "the command continues on the next line". It keeps long commands readable.')),

    block('Request types (methods)', 'The method tells the server what you want to do.',
      table(['Method', 'Plain meaning', 'Example'], [
        ['<code>GET</code>', 'Read something. Changes nothing. This is the default.', '<code>curl https://api.example.com/users</code>'],
        ['<code>POST</code>', 'Create something new, or start an action.', '<code>curl -X POST https://api.example.com/users -d "name=Rahul"</code>'],
        ['<code>PUT</code>', 'Replace a whole thing with a new version.', '<code>curl -X PUT https://api.example.com/users/10 -d \'{...}\'</code>'],
        ['<code>PATCH</code>', 'Change only some fields of a thing.', '<code>curl -X PATCH https://api.example.com/users/10 -d \'{"name":"Asha"}\'</code>'],
        ['<code>DELETE</code>', 'Remove something.', '<code>curl -X DELETE https://api.example.com/users/10</code>'],
        ['<code>HEAD</code>', 'Like GET, but you only get the headers back.', '<code>curl -I https://api.example.com/users</code>'],
      ]) +
      callout('green', 'Good to know', 'Using <code>-d</code> already turns the request into a POST, so <code>-X POST</code> is often optional. Stripe uses POST both to create and to update.')),

    block('The options you will use most', 'Learn these and you can read almost any cURL command.',
      table(['Option', 'What it does', 'Example'], [
        ['<code>-X</code>', 'Sets the method', '<code>-X DELETE</code>'],
        ['<code>-H</code>', 'Adds a header', '<code>-H "Accept: application/json"</code>'],
        ['<code>-d</code>', 'Sends data in the body', '<code>-d "name=Rahul"</code>'],
        ['<code>-G</code>', 'Puts the <code>-d</code> data in the URL as a query, and sends a GET', '<code>-G -d "limit=3"</code>'],
        ['<code>--data-urlencode</code>', 'Sends data with special characters made safe', '<code>--data-urlencode "email=a+b@x.com"</code>'],
        ['<code>-u</code>', 'Sends a username and password (HTTP Basic)', '<code>-u "sk_test_...:"</code>'],
        ['<code>-i</code>', 'Shows the response headers and the body', '<code>curl -i URL</code>'],
        ['<code>-I</code>', 'Sends a HEAD request, shows headers only', '<code>curl -I URL</code>'],
        ['<code>-v</code>', 'Verbose: shows the whole conversation, for debugging', '<code>curl -v URL</code>'],
        ['<code>-L</code>', 'Follows redirects', '<code>curl -L URL</code>'],
        ['<code>-o</code>', 'Saves the response to a file', '<code>-o result.json</code>'],
        ['<code>-k</code>', 'Skips the certificate check. Unsafe, never use it as a fix.', '<code>curl -k URL</code>'],
        ['<code>--connect-timeout</code>', 'Gives up if it cannot connect in N seconds', '<code>--connect-timeout 5</code>'],
        ['<code>--max-time</code>', 'Gives up if the whole request takes more than N seconds', '<code>--max-time 30</code>'],
        ['<code>--fail-with-body</code>', 'Makes cURL exit with an error on 400 and above, and still prints the body', '<code>--fail-with-body</code>'],
      ])),

    block('Headers', 'Headers are small labels sent with a request. Three matter most.',
      table(['Header', 'What it says', 'Example'], [
        ['<code>Content-Type</code>', '"The body I am sending is in this format."', '<code>Content-Type: application/json</code>'],
        ['<code>Accept</code>', '"I would like the answer in this format."', '<code>Accept: application/json</code>'],
        ['<code>Authorization</code>', '"This is who I am."', '<code>Authorization: Bearer YOUR_TOKEN</code>'],
      ]) +
      callout('amber', 'A common mistake', 'Sending JSON with <code>-d</code> but forgetting <code>Content-Type: application/json</code>. The server cannot read the body, so you get a 400 error.')),

    block('Logging in: -u and Bearer', 'Most APIs need to know who is calling. There are two common ways.',
      table(['Way', 'How it looks', 'Used by'], [
        ['Basic with <code>-u</code>', '<code>-u "USERNAME:PASSWORD"</code>', 'Stripe: the secret key is the username, the password is empty'],
        ['Bearer token', '<code>-H "Authorization: Bearer TOKEN"</code>', 'Many other APIs'],
      ]) +
      code(`curl https://api.stripe.com/v1/customers \\
  -u "sk_test_REPLACE_ME:"`, 'Stripe, with -u') +
      callout('amber', 'Notice the colon', 'In <code>"sk_test_...:"</code> the colon after the key separates the username from an empty password. Do not leave it out.') +
      callout('green', 'Keep keys safe', 'Use test keys when practising. Never paste a live secret key into a ticket, chat or screenshot, and hide it before sharing a command.')),

    block('Sending data: form and JSON', 'There are two common formats for a request body.',
      table(['Format', 'Header needed', 'Looks like'], [
        ['Form (key=value)', 'None needed. cURL sets it for <code>-d</code>.', '<code>-d "name=Rahul" -d "email=r@x.com"</code>'],
        ['JSON', '<code>Content-Type: application/json</code>', '<code>-d \'{"name":"Rahul"}\'</code>'],
      ]) +
      code(`# JSON body
curl -X POST https://api.example.com/users \\
  -H "Content-Type: application/json" \\
  -d '{"name":"Rahul"}'`, 'JSON') +
      callout('green', 'Stripe uses form format', 'Stripe expects <code>key=value</code> data, not JSON. Its answers come back as JSON.')),

    block('Reading data with -G', 'To filter or limit a list, put the filters in the URL after a question mark. <code>-G</code> does that for you.',
      code(`curl -G https://api.stripe.com/v1/customers \\
  -u "sk_test_REPLACE_ME:" \\
  -d "limit=3" \\
  --data-urlencode "email=rahul@example.com"`, 'Same as ...customers?limit=3&email=rahul%40example.com') +
      `<p class="line">Without <code>-G</code>, the <code>-d</code> data would go in the body of a POST, and that is not what you want when you only want to read.</p>`),

    block('Popular status codes', 'The first digit tells you the story. Always read the code and the response body together.',
      table(['Code', 'Name', 'What it means', 'What to do'], [
        ['<code>200</code>', 'OK', 'The request worked.', 'Still check the body. For a payment, read its status.'],
        ['<code>201</code>', 'Created', 'A new thing was made.', 'Save the new ID from the body.'],
        ['<code>204</code>', 'No Content', 'It worked and there is nothing to return.', 'Nothing. This is normal for deletes.'],
        ['<code>301 / 302</code>', 'Redirect', 'The address moved.', 'Use <code>-L</code>, or fix the URL.'],
        ['<code>400</code>', 'Bad Request', 'Something in your request is wrong: a missing field, bad JSON.', 'Read the error message. Check the body and parameters.'],
        ['<code>401</code>', 'Unauthorized', 'The server does not know who you are.', 'Check the key or token, and test vs live.'],
        ['<code>403</code>', 'Forbidden', 'It knows you, but you are not allowed.', 'Check permissions and the key\'s access.'],
        ['<code>404</code>', 'Not Found', 'That address or ID does not exist.', 'Check the URL, the ID, and test vs live.'],
        ['<code>409</code>', 'Conflict', 'It clashes with something already there, such as an idempotency key reused with different data.', 'Check for a duplicate or a repeated key.'],
        ['<code>429</code>', 'Too Many Requests', 'You are sending requests too fast.', 'Wait (check <code>Retry-After</code>), then retry slowly with backoff.'],
        ['<code>500</code>', 'Server Error', 'The server had a problem. It is not your request.', 'Retry later. Note the time and request ID, and escalate if it continues.'],
        ['<code>502 / 503 / 504</code>', 'Bad Gateway, Unavailable, Timeout', 'The server or something in front of it is down or slow.', 'Retry later. Check the service status.'],
      ]) +
      legend([['', '2xx', 'It worked'], ['', '3xx', 'Go somewhere else'], ['', '4xx', 'Your request has a problem'], ['', '5xx', 'The server has a problem']], 4)),

    block('401, 403 and 404 in one line each', 'These three get mixed up all the time.', legend([
      ['', '401', 'Who are you? (login missing or wrong)'],
      ['', '403', 'I know you, but no. (not allowed)'],
      ['', '404', 'I cannot find that. (wrong address or ID)'],
    ], 3) + callout('amber', 'Stripe tip', 'A "No such customer" or "No such payment" error is very often a test key used on a live object, or the other way round.')),

    block('Stripe examples', 'Three requests you will use all the time.',
      code(`# 1. Read a payment
curl https://api.stripe.com/v1/payment_intents/pi_example \\
  -u "sk_test_REPLACE_ME:"`, 'Read') +
      code(`# 2. Create a customer, safely retryable
curl https://api.stripe.com/v1/customers \\
  -u "sk_test_REPLACE_ME:" \\
  -H "Idempotency-Key: signup-1001" \\
  -d "email=rahul@example.com" \\
  -d "name=Rahul"`, 'Create, with an idempotency key') +
      code(`# 3. List 3 failed charges
curl -G https://api.stripe.com/v1/charges \\
  -u "sk_test_REPLACE_ME:" \\
  -d "limit=3"`, 'List') +
      callout('green', 'Idempotency key', 'If a create request times out, send it again with the <strong>same</strong> key. Stripe then returns the first result instead of creating a duplicate. A new key for every retry defeats the purpose.')),

    block('Two things that can fool you', '',
      table(['It looks like', 'But actually'], [
        ['Status 200, so the payment worked', '200 only means the request was handled. Read the payment <code>status</code>, for example <code>requires_action</code> means more steps are needed.'],
        ['Request failed, so Stripe is down', 'Most failures are in the request: key, mode, URL or body. Check those first.'],
      ])),

    block('Fix a failing request: step by step', 'Go in this order. Do not guess.',
      steps([
        'Read the <strong>status code</strong> and the <strong>error message</strong> in the body.',
        'Run it again with <code>-i</code> to see the headers, or <code>-v</code> to see the full conversation.',
        'Check the <strong>URL</strong>: spelling, version, ID.',
        'Check the <strong>login</strong>: right key, right mode (test or live).',
        'Check the <strong>headers</strong>, especially <code>Content-Type</code>.',
        'Check the <strong>body</strong>: valid JSON, no missing required field.',
        'If it times out, add <code>--connect-timeout</code> and <code>--max-time</code> and check the network.',
        'If a customer sent it, ask for: endpoint, method, time, status code, response body, and a request with the key hidden.',
      ])),

    block('Handy extras', '',
      table(['Need', 'Use'], [
        ['Hide the progress meter', '<code>-s</code> (silent)'],
        ['Pretty-print JSON', '<code>curl ... | python -m json.tool</code>'],
        ['Save the reply', '<code>-o result.json</code>'],
        ['Quotes on Windows', 'Command Prompt prefers double quotes and escaping the inner ones. PowerShell, Git Bash or WSL work like the examples here.'],
        ['Stop on HTTP errors in scripts', '<code>--fail-with-body</code>'],
      ]) +
      callout('amber', 'Practise, do not memorize', 'For every request ask yourself: method, URL, headers, login, body, status, error. If you can name all seven, you can fix most problems.')),
  ];


  /* Set Four: SQL. Item 6 is an example shown in the hint, item 7 is code shown under the question. */
  const SET4 = [
    /* SQL basics */
    ['Purpose of SQL', 'What is the main purpose of SQL?',
      ['To design website layouts', 'To query and manage relational databases', 'To create images', 'To send emails'], 1,
      'SQL stands for Structured Query Language. It is used to retrieve, insert, update and delete data in relational databases.'],
    ['Retrieving data', 'Which SQL command retrieves data from a table?',
      ['GET', 'FETCH', 'SELECT', 'EXTRACT'], 2,
      'SELECT retrieves data from one or more tables.',
      'SELECT * FROM customers;'],
    ['The WHERE clause', 'What is the purpose of the WHERE clause?',
      ['To sort records', 'To filter rows based on a condition', 'To create a table', 'To group records'], 1,
      'WHERE returns only the rows that satisfy the condition.',
      'SELECT *\nFROM payments\nWHERE status = \'failed\';'],
    ['DELETE vs DROP', 'What is the difference between DELETE and DROP?',
      ['Both always delete only one row', 'DELETE removes rows; DROP removes a database object such as a table', 'DROP updates records, while DELETE sorts them', 'There is no difference'], 1,
      'DELETE removes rows from a table. DROP TABLE removes the table structure and its data.'],
    ['ORDER BY DESC', 'What does ORDER BY amount DESC do?',
      ['Sorts amounts from smallest to largest', 'Sorts amounts from largest to smallest', 'Deletes duplicate amounts', 'Groups payments by amount'], 1,
      'DESC means descending order. ASC means ascending order.',
      'SELECT *\nFROM payments\nORDER BY amount DESC;'],

    /* Filtering and conditions */
    ['BETWEEN', 'Which operator checks whether a value falls within a specified range?',
      ['LIKE', 'BETWEEN', 'DISTINCT', 'JOIN'], 1,
      'BETWEEN checks whether a value is within an inclusive range.',
      'SELECT *\nFROM payments\nWHERE amount BETWEEN 100 AND 500;'],
    ['LIKE', 'Which condition finds customers whose email starts with "rahul"?',
      ['WHERE email = \'rahul%\'', 'WHERE email LIKE \'rahul%\'', 'WHERE email IN \'rahul%\'', 'WHERE email BETWEEN \'rahul\' AND \'%\''], 1,
      'LIKE supports pattern matching. The % wildcard matches zero or more characters.'],
    ['IS NULL', 'How do you find rows where the email column has no value stored as SQL NULL?',
      ['WHERE email = NULL', 'WHERE email == NULL', 'WHERE email IS NULL', 'WHERE email EQUALS NULL'], 2,
      'SQL uses IS NULL and IS NOT NULL to test for NULL. Ordinary equality comparisons with NULL do not work as expected.'],
    ['The IN operator', 'What does the IN operator do?',
      ['Checks whether a value matches any value in a specified list', 'Inserts a new record', 'Joins two tables', 'Sorts a column'], 0,
      'IN checks whether a value matches one of the listed values.',
      'SELECT *\nFROM payments\nWHERE status IN (\'failed\', \'pending\');'],
    ['Not failed', 'Which condition returns payments that are not marked as failed?',
      ['WHERE status != \'failed\'', 'WHERE status IS NOT \'failed\'', 'WHERE status NOT NULL \'failed\'', 'WHERE status <> NULL'], 0,
      'In PostgreSQL, != and <> both mean not equal. Rows with a NULL status will not pass this condition, because comparing with NULL gives "unknown".'],

    /* SQL joins */
    ['INNER JOIN', 'What does an INNER JOIN return?',
      ['All rows from the left table', 'Only rows that match the join condition in both tables', 'All rows from both tables, whether matched or not', 'Only rows without a match'], 1,
      'INNER JOIN returns the records with matching values in both tables, according to the join condition.'],
    ['LEFT JOIN result', 'What does a LEFT JOIN return?',
      ['Only matching rows', 'All rows from the right table', 'All rows from the left table and matching rows from the right table', 'Only rows that have NULL values'], 2,
      'Unmatched rows from the left table are kept, with NULL in the columns that come from the right table.'],
    ['Counting joined rows', 'Using the tables below, how many rows does this query return?',
      ['Two rows', 'Three rows', 'Four rows', 'Five rows'], 2,
      'Rahul has two matching payments, Amit has no payment and still appears once, and Neha has one payment. That is four rows.', null,
      {
        tables: [
          { name: 'customers', cols: ['id', 'name'], rows: [[1, 'Rahul'], [2, 'Amit'], [3, 'Neha']] },
          { name: 'payments', cols: ['id', 'customer_id', 'amount'], rows: [[101, 1, 500], [102, 1, 300], [103, 3, 700]] },
        ],
        code: 'SELECT c.name, p.amount\nFROM customers c\nLEFT JOIN payments p\nON c.id = p.customer_id;',
      }],
    ['Join condition', 'In a JOIN, which condition correctly connects payments to customers?',
      ['ON customers.id = payments.customer_id', 'ON customers.name = payments.amount', 'ON customers.id = payments.amount', 'ON customers.name = payments.id'], 0,
      'customers.id identifies the customer, and payments.customer_id points to that customer. Join on the columns that represent the real relationship.'],
    ['Order of join columns', 'Are these two JOIN conditions equivalent?',
      ['Only the first is valid', 'Only the second is valid', 'Both are valid and logically equivalent', 'Neither is valid'], 2,
      'Equality works the same in both directions, so swapping the two sides does not change which rows match.', null,
      'ON customers.id = payments.customer_id\n\nON payments.customer_id = customers.id'],

    /* Aggregation and grouping */
    ['SUM', 'Which function calculates the total of payment amounts?',
      ['COUNT()', 'SUM()', 'AVG()', 'MAX()'], 1,
      'SUM() adds numeric values.',
      'SELECT SUM(amount)\nFROM payments;'],
    ['COUNT(*)', 'What does COUNT(*) return?',
      ['The sum of all numeric columns', 'The number of rows returned by the query', 'The number of distinct customers only', 'The number of columns in a table'], 1,
      'COUNT(*) counts rows, including rows that have NULL in some columns.'],
    ['Purpose of GROUP BY', 'What is the purpose of GROUP BY?',
      ['To delete duplicate records', 'To group rows for aggregate calculations', 'To sort rows alphabetically', 'To rename columns'], 1,
      'GROUP BY allows calculations such as total payments per customer or failed payments per day.',
      'SELECT customer_id, COUNT(*)\nFROM payments\nGROUP BY customer_id;'],
    ['Filtering groups', 'Which clause filters groups after aggregation?',
      ['WHERE', 'ORDER BY', 'HAVING', 'LIMIT'], 2,
      'HAVING filters grouped results. WHERE filters individual rows before grouping.'],
    ['More than three payments', 'Which query finds customers with more than three payments?',
      ['SELECT customer_id, COUNT(*)\nFROM payments\nGROUP BY customer_id\nHAVING COUNT(*) > 3;',
       'SELECT customer_id, COUNT(*)\nFROM payments\nWHERE COUNT(*) > 3;',
       'SELECT customer_id\nFROM payments\nORDER BY COUNT(*) > 3;',
       'SELECT customer_id\nFROM payments\nLIMIT 3;'], 0,
      'Group the payments by customer and use HAVING to filter the groups by their count.'],

    /* Intermediate SQL */
    ['What a subquery is', 'What is a subquery?',
      ['A query nested inside another query', 'A type of primary key', 'A database server', 'A command that creates a table only'], 0,
      'A subquery can supply a value or a result set that the outer query uses.'],
    ['What a CTE is', 'What is a CTE in SQL?',
      ['A permanent table that always exists', 'A named query result defined using WITH', 'A foreign key', 'A type of database index'], 1,
      'Common Table Expressions make a query easier to read and break complex SQL into logical steps.',
      'WITH failed_payments AS (\n    SELECT *\n    FROM payments\n    WHERE status = \'failed\'\n)\nSELECT COUNT(*)\nFROM failed_payments;'],
    ['UNION vs UNION ALL', 'What is the difference between UNION and UNION ALL?',
      ['UNION keeps all duplicates; UNION ALL removes them', 'UNION removes duplicate result rows; UNION ALL retains duplicates', 'Both always remove duplicates', 'UNION sorts tables permanently'], 1,
      'UNION removes duplicate result rows, while UNION ALL combines the results without removing any. UNION ALL is usually faster when you do not need deduplication.'],
    ['What an index is for', 'What is the main purpose of an index?',
      ['To improve data retrieval performance for suitable queries', 'To delete duplicate rows automatically in every case', 'To encrypt every column', 'To replace all primary keys'], 0,
      'Indexes can speed up lookups and filtering, although they use storage and add some overhead to INSERT, UPDATE and DELETE.'],
    ['UPDATE', 'Which SQL command modifies existing records?',
      ['CREATE', 'UPDATE', 'SELECT', 'DROP'], 1,
      'UPDATE changes values in existing rows. The WHERE clause matters: without it, all rows may be updated.',
      'UPDATE customers\nSET name = \'Rahul Patel\'\nWHERE id = 1;'],

    /* Practical SQL and payment troubleshooting */
    ['A missing payment', 'A customer says a payment is missing. Which query is a good starting point if you know the payment ID?',
      ['SELECT *\nFROM payments\nWHERE id = \'PAYMENT_ID\';', 'DELETE FROM payments;', 'SELECT SUM(id)\nFROM customers;', 'DROP TABLE payments;'], 0,
      'Search for that exact payment by its identifier. If it is not found, check the environment, the database, the identifier type, and any delay in data ingestion.'],
    ['Failed payments per day', 'Which query finds the number of failed payments for each day?',
      ['SELECT DATE(created_at) AS payment_date, COUNT(*) AS failed_count\nFROM payments\nWHERE status = \'failed\'\nGROUP BY DATE(created_at)\nORDER BY payment_date;',
       'SELECT *\nFROM payments\nORDER BY status;',
       'DELETE FROM payments\nWHERE status = \'failed\';',
       'SELECT AVG(created_at)\nFROM payments;'], 0,
      'Filter for failed payments, group by creation date, and count each day\'s records. Date extraction syntax varies by database.'],
    ['JOIN returns extra rows', 'A JOIN returns more rows than expected. What should you investigate?',
      ['Whether the joined columns have one-to-many or many-to-many matches', 'Whether the database uses HTML', 'Whether the table name starts with a vowel', 'Whether the query contains a semicolon'], 0,
      'Several matches for one row can multiply the result. Check the join keys, the relationship between the tables, and whether aggregation or deduplication is needed.'],
    ['Duplicate emails', 'Which query finds duplicate email addresses in a customers table?',
      ['SELECT email, COUNT(*)\nFROM customers\nGROUP BY email\nHAVING COUNT(*) > 1;',
       'SELECT DISTINCT email\nFROM customers;',
       'DELETE FROM customers;',
       'SELECT email\nFROM customers\nORDER BY email;'], 0,
      'GROUP BY collects matching emails, and HAVING picks those that appear more than once. If email can be NULL, several NULL entries may also form a group.'],
    ['A slow query', 'A SQL query used in a support investigation is running slowly. What should you do first?',
      ['Delete indexes immediately', 'Run an execution plan, inspect filtering and JOIN conditions, and check relevant indexes', 'Drop the table and recreate it', 'Increase every column\'s data type'], 1,
      'An execution plan shows expensive scans, joins and other bottlenecks. Optimize based on evidence, not blind changes.'],
  ];


  /* Set Five: reading SQL. The query is shown under the question; the options stay hidden until "Show options". */
  const SET5 = [
    ['SELECT and WHERE', 'What does this query do?',
      ['Deletes all failed payments', 'Retrieves all payment records whose status is failed', 'Retrieves only successful payments', 'Counts all failed payments'], 1,
      'SELECT retrieves records, and WHERE filters the results to payments with a failed status.', null,
      'SELECT *\nFROM payments\nWHERE status = \'failed\';'],
    ['ORDER BY and LIMIT', 'What does this query return?',
      ['The five payments with the lowest amounts', 'All payments sorted by amount', 'The five payments with the highest amounts', 'Five random payments'], 2,
      'DESC sorts from highest to lowest, and LIMIT 5 returns the first five records.', null,
      'SELECT *\nFROM payments\nORDER BY amount DESC\nLIMIT 5;'],
    ['COUNT', 'What does this query return?',
      ['The total monetary value of failed payments', 'The number of failed payment records', 'The number of successful payment records', 'All failed payment records'], 1,
      'COUNT(*) counts the rows that satisfy the WHERE condition.', null,
      'SELECT COUNT(*)\nFROM payments\nWHERE status = \'failed\';'],
    ['GROUP BY', 'What does this query do?',
      ['Counts payments separately for each status', 'Deletes duplicate payment statuses', 'Returns only failed payments', 'Counts all customers'], 0,
      'GROUP BY groups the payments by status, and COUNT(*) counts the records in each group.', null,
      'SELECT status, COUNT(*)\nFROM payments\nGROUP BY status;'],
    ['SUM per customer', 'What does this query return?',
      ['The average payment amount for each customer', 'The number of payments made by each customer', 'The total payment amount for each customer', 'The largest payment made by each customer'], 2,
      'SUM(amount) calculates the total amount for each customer group.', null,
      'SELECT customer_id, SUM(amount)\nFROM payments\nGROUP BY customer_id;'],
    ['INNER JOIN', 'Assume customers.id is the customer ID and payments.customer_id references it. What does this query return?',
      ['All customers, including those without payments', 'Customers with matching payment records, alongside their payment amounts', 'Only customers without payments', 'Only payment records with NULL customer IDs'], 1,
      'INNER JOIN returns the rows where the join condition matches. Customers without matching payments are left out.', null,
      'SELECT customers.name, payments.amount\nFROM customers\nINNER JOIN payments\nON customers.id = payments.customer_id;'],
    ['LEFT JOIN', 'What is the main difference between this query and an INNER JOIN?',
      ['LEFT JOIN always returns fewer rows', 'LEFT JOIN includes all customers, even those without matching payments', 'LEFT JOIN removes customers with NULL values', 'LEFT JOIN returns only successful payments'], 1,
      'All rows from the left table (customers) are kept. If a customer has no payment, the payment columns are NULL.', null,
      'SELECT customers.name, payments.amount\nFROM customers\nLEFT JOIN payments\nON customers.id = payments.customer_id;'],
    ['Customers without payments', 'What does this query identify?',
      ['Customers who have made multiple payments', 'Customers whose payments failed', 'Customers who have no matching payment records', 'Payments that have no customer name'], 2,
      'LEFT JOIN keeps every customer. The condition payments.id IS NULL picks out customers without a matching payment, assuming payments.id is a non-NULL primary key.', null,
      'SELECT customers.id, customers.name\nFROM customers\nLEFT JOIN payments\nON customers.id = payments.customer_id\nWHERE payments.id IS NULL;'],
    ['HAVING', 'What does this query return?',
      ['Customers with exactly three payments', 'Customers with more than three payment records', 'The three customers with the highest payment amounts', 'Payments greater than three rupees'], 1,
      'The query groups the records by customer and keeps the groups that contain more than three payments.', null,
      'SELECT customer_id, COUNT(*) AS total_payments\nFROM payments\nGROUP BY customer_id\nHAVING COUNT(*) > 3;'],
    ['WHERE with dates', 'What does this query retrieve?',
      ['Payments created during October 2026', 'Payments created only on November 1, 2026', 'Payments created before October 2026', 'All payments regardless of date'], 0,
      'The inclusive start and exclusive end cover October 1 through October 31, including timestamps throughout those days.', null,
      'SELECT *\nFROM payments\nWHERE created_at >= \'2026-10-01\'\nAND created_at < \'2026-11-01\';'],
    ['DISTINCT', 'What does this query return?',
      ['Every payment record', 'Every unique customer ID appearing in the payments table', 'The total number of customers', 'Only customers with successful payments'], 1,
      'DISTINCT removes duplicate customer IDs from the result. It does not return a count, and NULL may appear once if it is present.', null,
      'SELECT DISTINCT customer_id\nFROM payments;'],
    ['CASE', 'What does this query do?',
      ['Deletes payments below 1,000', 'Categorizes payments of at least 1,000 as High and all others as Low', 'Counts high-value payments', 'Changes the actual amount stored in the database'], 1,
      'CASE creates a calculated category in the query output. It does not update the underlying table.', null,
      'SELECT\n    id,\n    CASE\n        WHEN amount >= 1000 THEN \'High\'\n        ELSE \'Low\'\n    END AS payment_category\nFROM payments;'],
    ['IN', 'Which records does this query retrieve?',
      ['Only successful payments', 'Payments whose status is either failed or pending', 'Payments whose status is both failed and pending simultaneously', 'All payments except pending payments'], 1,
      'IN checks whether the status matches any value in the list.', null,
      'SELECT *\nFROM payments\nWHERE status IN (\'failed\', \'pending\');'],
    ['LIKE', 'What does this query generally find?',
      ['Customers whose email contains no period', 'Customers whose email ends with gmail.com', 'Customers whose names begin with Gmail', 'All customers with NULL email addresses'], 1,
      '% matches zero or more characters, so the pattern matches strings that end in gmail.com. This is a simple pattern match, not a full email-domain check.', null,
      'SELECT *\nFROM customers\nWHERE email LIKE \'%gmail.com\';'],
    ['Subquery', 'What does this query return?',
      ['Payments whose amount is greater than the average payment amount', 'Payments whose amount is less than the average', 'Only the average payment amount', 'Payments equal to the highest amount'], 0,
      'The inner query calculates the average payment amount. The outer query returns the payments above that average.', null,
      'SELECT *\nFROM payments\nWHERE amount > (\n    SELECT AVG(amount)\n    FROM payments\n);'],
    ['CTE', 'What does this query do?',
      ['Creates a permanent table called failed_payments', 'Counts failed payment records using a named query result', 'Deletes failed payments', 'Counts all customers'], 1,
      'The CTE defines a named result set for this one statement. The outer query counts its rows. The CTE does not create a permanent table.', null,
      'WITH failed_payments AS (\n    SELECT *\n    FROM payments\n    WHERE status = \'failed\'\n)\nSELECT COUNT(*)\nFROM failed_payments;'],
    ['UPDATE', 'What does this query do?',
      ['Retrieves payment 101', 'Changes the status of payment 101 to review', 'Changes every payment to review', 'Deletes payment 101'], 1,
      'UPDATE modifies existing records. The WHERE clause limits the change to the row whose ID is 101, assuming the ID is unique.', null,
      'UPDATE payments\nSET status = \'review\'\nWHERE id = 101;'],
    ['Repeat customers', 'What does this query identify?',
      ['Customers associated with more than one payment record', 'Customers who have never paid', 'Payments with duplicate amounts only', 'Customers whose IDs are NULL only'], 0,
      'The query groups the payment records by customer and returns the customer IDs with more than one record. That does not necessarily mean the payments themselves are duplicates.', null,
      'SELECT customer_id, COUNT(*)\nFROM payments\nGROUP BY customer_id\nHAVING COUNT(*) > 1;'],
    ['LEFT JOIN with COUNT', 'What does this query return?',
      ['Only customers who have payments', 'Each customer and their number of matching payment records, including customers with zero payments', 'Only customers with failed payments', 'The total amount collected from every customer'], 1,
      'LEFT JOIN keeps all customers. COUNT(p.id) counts matching payment IDs and gives zero for customers without payments, assuming p.id is non-NULL for real payment records.', null,
      'SELECT\n    c.id,\n    c.name,\n    COUNT(p.id) AS payment_count\nFROM customers c\nLEFT JOIN payments p\nON c.id = p.customer_id\nGROUP BY c.id, c.name;'],
    ['Investigating a failure', 'A customer reports that a payment failed. What is the most appropriate interpretation of this query?',
      ['It retrieves the customer\'s ten most recent payment records', 'It retrieves the ten oldest payments from every customer', 'It updates the customer\'s payment status', 'It returns only successful payments'], 0,
      'The query filters the payments for customer 25, sorts them from newest to oldest, and returns up to ten records. A support specialist can use the results to look into recent failures and compare their statuses and timestamps.', null,
      'SELECT id, customer_id, amount, status, created_at\nFROM payments\nWHERE customer_id = 25\nORDER BY created_at DESC\nLIMIT 10;'],
  ];


  /* Set Six: reading harder SQL. Same layout as Set Five: the options stay hidden until "Show options". */
  const SET6 = [
    ['Customers with failed payments', 'What does this query return?',
      ['Customers who have made exactly 3 payments', 'Customers who have at least 3 failed payments', 'All customers whose payments failed once', 'Customers who have at least 3 successful payments'], 1,
      'WHERE keeps only the failed payments. GROUP BY groups them by customer, and HAVING keeps the customers with 3 or more failed payments.', null,
      'SELECT customer_id, COUNT(*) AS failed_count\nFROM payments\nWHERE status = \'failed\'\nGROUP BY customer_id\nHAVING COUNT(*) >= 3;'],
    ['Above the customer\'s average', 'What does this query return?',
      ['Payments greater than the average amount across all customers', 'Payments equal to the customer\'s average amount', 'Payments greater than that particular customer\'s average payment amount', 'Only the customer\'s latest payment'], 2,
      'The inner query calculates the average payment amount for the same customer. The outer query returns that customer\'s payments above their own average.', null,
      'SELECT *\nFROM payments p\nWHERE amount > (\n    SELECT AVG(amount)\n    FROM payments\n    WHERE customer_id = p.customer_id\n);'],
    ['Customers who never paid', 'What does this query return?',
      ['Customers who have only failed payments', 'Customers who have no matching payment records', 'Customers who have made successful payments', 'All customers who have duplicate payment records'], 1,
      'LEFT JOIN keeps all customers. When no payment matches a customer, p.id is NULL, so the WHERE condition selects those customers.', null,
      'SELECT c.id, c.name\nFROM customers c\nLEFT JOIN payments p\n    ON c.id = p.customer_id\nWHERE p.id IS NULL;'],
    ['Successful payments by currency', 'What does this query do?',
      ['Counts all payments and sorts currencies alphabetically', 'Counts successful payments for each currency and sorts from highest count to lowest', 'Calculates the total money received in each currency', 'Returns only the currency with the most failed payments'], 1,
      'COUNT(*) counts payment records, not their monetary value. ORDER BY total DESC puts the currency with the most successful payments first.', null,
      'SELECT currency, COUNT(*) AS total\nFROM payments\nWHERE status = \'succeeded\'\nGROUP BY currency\nORDER BY total DESC;'],
    ['Total above 10,000', 'What does this query return?',
      ['Individual payments greater than 10,000', 'Customers whose combined successful payment amount exceeds 10,000', 'Customers with exactly 10,000 in successful payments', 'Customers whose failed payments total more than 10,000'], 1,
      'The query first filters for successful payments, then adds up the amounts for each customer. HAVING filters the resulting customer totals.', null,
      'SELECT customer_id, SUM(amount) AS total_amount\nFROM payments\nWHERE status = \'succeeded\'\nGROUP BY customer_id\nHAVING SUM(amount) > 10000;'],
    ['WHERE vs HAVING', 'In this query, which condition is applied first?',
      ['HAVING, then WHERE', 'GROUP BY, then WHERE', 'WHERE, then grouping, then HAVING', 'ORDER BY, then HAVING'], 2,
      'Conceptually, SQL filters individual payment rows with WHERE, groups the remaining rows, and then filters those groups with HAVING.', null,
      'SELECT customer_id, COUNT(*) AS total\nFROM payments\nWHERE status = \'failed\'\nGROUP BY customer_id\nHAVING COUNT(*) > 2;'],
    ['Payments without a customer', 'What does this query help identify?',
      ['Customers who have multiple payments', 'Payment records that do not have a matching customer record', 'Customers with successful payments', 'Payments with an amount of zero'], 1,
      'Every payment is kept by the LEFT JOIN. If the related customer cannot be found, the customer columns are NULL.', null,
      'SELECT p.id, p.customer_id\nFROM payments p\nLEFT JOIN customers c\n    ON p.customer_id = c.id\nWHERE c.id IS NULL;'],
    ['Second-highest amount', 'What does this query return?',
      ['The highest payment amount', 'The lowest payment amount', 'The second-highest distinct payment amount', 'The average payment amount'], 2,
      'The inner query finds the maximum amount. The outer query finds the maximum amount below it. If several payments share the highest amount, it still finds the next lower distinct amount.', null,
      'SELECT MAX(amount)\nFROM payments\nWHERE amount < (\n    SELECT MAX(amount)\n    FROM payments\n);'],
    ['Both successful and failed', 'What does this query return?',
      ['Customers whose every payment failed', 'Customers who have at least one successful and at least one failed payment', 'Customers who have never made a payment', 'Customers with only one payment'], 1,
      'Each CASE counts the rows with a particular status. The AND requires both counts to be greater than zero.', null,
      'SELECT customer_id\nFROM payments\nGROUP BY customer_id\nHAVING\n    SUM(CASE WHEN status = \'succeeded\' THEN 1 ELSE 0 END) > 0\n    AND\n    SUM(CASE WHEN status = \'failed\' THEN 1 ELSE 0 END) > 0;'],
    ['Failure percentage', 'What does this query calculate?',
      ['The total amount of failed payments', 'The number of unique customers with failed payments', 'The percentage of all payment records that have failed status', 'The percentage of customers who have never paid'], 2,
      'The conditional COUNT counts the failed payment rows. Dividing that by all payment rows and multiplying by 100 gives the failure percentage. The 100.0 helps produce a decimal result.', null,
      'SELECT\n    COUNT(CASE WHEN status = \'failed\' THEN 1 END) * 100.0\n    / COUNT(*) AS failure_percentage\nFROM payments;'],
    ['LEFT JOIN with a WHERE filter', 'Does this query return customers with no payments?',
      ['Yes, because it uses LEFT JOIN', 'No, because the WHERE condition excludes rows where p.status is NULL', 'Yes, but only if the customer ID is unique', 'No, because LEFT JOIN only returns matching rows'], 1,
      'LEFT JOIN first keeps unmatched customers, but their p.status is NULL. The condition p.status = \'failed\' removes those rows, so only customers with failed payment records remain.', null,
      'SELECT c.id, p.id AS payment_id\nFROM customers c\nLEFT JOIN payments p\n    ON c.id = p.customer_id\nWHERE p.status = \'failed\';'],
    ['Counting including zero', 'What does this query return?',
      ['Only customers with successful payments', 'Every customer and their number of matching payment records, including zero', 'The number of payments for each currency', 'Only customers with more than one payment'], 1,
      'LEFT JOIN keeps customers with no payments. COUNT(p.id) ignores NULL, so those customers get a count of zero.', null,
      'SELECT c.id, COUNT(p.id) AS payment_count\nFROM customers c\nLEFT JOIN payments p\n    ON c.id = p.customer_id\nGROUP BY c.id;'],
    ['Duplicate references', 'Assume payment_reference should be unique. What does this query identify?',
      ['References that appear more than once', 'Payments with different references', 'Failed payments only', 'Payments with missing customer IDs only'], 0,
      'The query groups rows by reference and returns only the references that occur more than once. This can help investigate possible duplicate records, but it does not by itself prove that a customer was charged twice.', null,
      'SELECT payment_reference, COUNT(*) AS total\nFROM payments\nGROUP BY payment_reference\nHAVING COUNT(*) > 1;'],
    ['Successful payments in October', 'Which payments are included?',
      ['All payments made during October, regardless of status', 'Successful payments from October 1 through October 31', 'Successful payments made only on October 1', 'Successful payments made after November 1'], 1,
      'The lower bound includes October 1 onward, and the exclusive upper bound leaves out November 1 onward. This pattern also works well when created_at has a time component.', null,
      'SELECT *\nFROM payments\nWHERE status = \'succeeded\'\n  AND created_at >= \'2026-10-01\'\n  AND created_at < \'2026-11-01\';'],
    ['AND and OR', 'Which records are returned?',
      ['Failed payments of any amount, plus pending payments above 5,000', 'Only failed payments above 5,000', 'All pending payments and all successful payments', 'Failed and pending payments only when both have amounts above 5,000'], 0,
      'Every failed payment qualifies, whatever its amount. A pending payment qualifies only if its amount is greater than 5,000. The parentheses make that requirement explicit.', null,
      'SELECT *\nFROM payments\nWHERE status = \'failed\'\n   OR (status = \'pending\' AND amount > 5000);'],
    ['Latest payment per customer', 'Assume created_at records when each payment was created. What does this query return?',
      ['The latest payment across the entire database', 'The earliest payment for each customer', 'Payment records created at each customer\'s latest payment timestamp', 'Every customer\'s total payment amount'], 2,
      'The inner query finds the maximum timestamp for each customer. The outer query matches payment records to those timestamps. If a customer has several payments at the same latest timestamp, several rows can be returned.', null,
      'SELECT p.*\nFROM payments p\nJOIN (\n    SELECT customer_id, MAX(created_at) AS latest_date\n    FROM payments\n    GROUP BY customer_id\n) latest\n    ON p.customer_id = latest.customer_id\n   AND p.created_at = latest.latest_date;'],
    ['Average above 2,000', 'What does this query return?',
      ['Customers with at least one successful payment above 2,000', 'Customers whose average successful payment amount exceeds 2,000', 'Customers whose total successful payments exceed 2,000', 'Customers whose failed payments average more than 2,000'], 1,
      'AVG(amount) calculates the average, not the sum or the maximum. Only successful payments are considered before the average is calculated.', null,
      'SELECT customer_id, AVG(amount) AS average_amount\nFROM payments\nWHERE status = \'succeeded\'\nGROUP BY customer_id\nHAVING AVG(amount) > 2000;'],
    ['COUNT(*) vs COUNT(column)', 'Suppose a payments table has 100 rows, but 8 rows have a customer_id of NULL. What are the two results, in order?',
      ['100 and 100', '92 and 100', '100 and 92', '92 and 92'], 2,
      'COUNT(*) counts all rows. COUNT(customer_id) counts only the rows where customer_id is not NULL.', null,
      'SELECT COUNT(*), COUNT(customer_id)\nFROM payments;'],
    ['Customers who paid more than once', 'What does this query return?',
      ['Customers with exactly one successful payment', 'Customers with more than one successful payment record', 'Customers with duplicate payment IDs', 'Customers whose successful payments total more than one currency unit'], 1,
      'It counts the successful payment records for each customer and keeps customers with at least two. That does not necessarily mean the records are duplicates. They may be legitimate separate payments.', null,
      'SELECT customer_id\nFROM payments\nWHERE status = \'succeeded\'\nGROUP BY customer_id\nHAVING COUNT(*) > 1;'],
    ['No successful payments', 'What does this query return?',
      ['Customers who have never made any payment of any status', 'Customers who have no successful payment records, even if they have failed or pending payments', 'Customers who have at least one successful payment', 'Only customers with failed payments and no other payment statuses'], 1,
      'NOT EXISTS checks whether the subquery finds a successful payment for each customer. If none exists, the customer is returned. A customer with failed payments but no successful ones still qualifies.', null,
      'SELECT c.id\nFROM customers c\nWHERE NOT EXISTS (\n    SELECT 1\n    FROM payments p\n    WHERE p.customer_id = c.id\n      AND p.status = \'succeeded\'\n);'],
  ];


  /* ---------- SQL theory: plain-English review page, opened from the SQL sets ---------- */
  const sql = (text, label = 'SQL') => `<div class="code"><div class="code-bar">${label}</div><pre><code data-sql>${esc(text)}</code></pre></div>`;
  /* A small table. A null cell is shown as NULL. */
  const tv = (name, cols, rows) =>
    `<div class="tv"><div class="tv-head">${esc(name)}<small>${rows.length} ${rows.length === 1 ? 'row' : 'rows'}</small></div><div class="tv-scroll"><table>` +
    `<thead><tr>${cols.map((c) => `<th>${esc(c)}</th>`).join('')}</tr></thead>` +
    `<tbody>${rows.map((r) => `<tr>${r.map((v) => `<td>${v === null ? '<span class="tv-null">NULL</span>' : esc(v)}</td>`).join('')}</tr>`).join('')}</tbody></table></div></div>`;
  const grid = (...boxes) => `<div class="tv-grid">${boxes.join('')}</div>`;

  const CUSTOMERS = tv('customers', ['id', 'name'], [[1, 'Rahul'], [2, 'Amit'], [3, 'Neha']]);
  const PAYMENTS = tv('payments', ['id', 'customer_id', 'amount', 'status', 'created_at'], [
    [101, 1, 500, 'succeeded', '2026-10-02'], [102, 1, 300, 'failed', '2026-10-03'], [103, 3, 700, 'succeeded', '2026-10-03'],
    [104, 3, 200, 'failed', '2026-10-04'], [105, 1, 900, 'succeeded', '2026-10-05'],
  ]);

  const sqlTheory = [
    block('What is SQL?', 'The language you use to <strong>ask a database questions</strong> and to change its data.',
      `<p class="line">A database keeps data in <strong>tables</strong>. A table has <strong>columns</strong> (the kinds of information) and <strong>rows</strong> (one record each). SQL lets you pick the rows and columns you want, count them, add them up and combine tables.</p>` +
      table(['Word', 'Plain meaning', 'Example'], [
        ['Table', 'A list of one kind of thing', '<code>payments</code>'],
        ['Row', 'One record in the table', 'One payment'],
        ['Column', 'One piece of information about each row', '<code>amount</code>, <code>status</code>'],
        ['Primary key', 'A column that is different for every row. It identifies the row.', '<code>payments.id</code>'],
        ['Foreign key', 'A column that points to a row in another table', '<code>payments.customer_id</code> points to <code>customers.id</code>'],
        ['NULL', 'No value. Not zero, not empty text: unknown.', 'A customer with no email'],
      ]) +
      `<p class="line">All the examples on this page use these two tables.</p>` + grid(CUSTOMERS, PAYMENTS)),

    block('The order you write a query', 'Most queries are built from the same parts, always in this order.',
      table(['Part', 'Job', 'Needed?'], [
        ['<code>SELECT</code>', 'Which columns or calculations do I want?', 'Yes'],
        ['<code>FROM</code>', 'Which table?', 'Yes'],
        ['<code>JOIN … ON</code>', 'Bring in another table', 'Optional'],
        ['<code>WHERE</code>', 'Keep only the rows that pass a test', 'Optional'],
        ['<code>GROUP BY</code>', 'Put rows into groups', 'Optional'],
        ['<code>HAVING</code>', 'Keep only the groups that pass a test', 'Optional'],
        ['<code>ORDER BY</code>', 'Sort the result', 'Optional'],
        ['<code>LIMIT</code>', 'Keep only the first N rows', 'Optional'],
      ]) +
      callout('green', 'How the database reads it', 'It works in a different order: <strong>FROM, JOIN, WHERE, GROUP BY, HAVING, SELECT, ORDER BY, LIMIT</strong>. That is why a <code>WHERE</code> cannot use a total that <code>GROUP BY</code> has not made yet.')),

    block('SELECT and FROM', '<code>SELECT</code> says which columns. <code>FROM</code> says which table.',
      sql('SELECT *\nFROM payments;               -- every column, every row\n\nSELECT id, amount\nFROM payments;               -- only these two columns') +
      callout('amber', 'Habit', '<code>SELECT *</code> is fine for a quick look. In real work, name the columns you need.')),

    block('WHERE: choose rows', '<code>WHERE</code> keeps only the rows where the test is true.',
      sql('SELECT *\nFROM payments\nWHERE status = \'failed\';') +
      grid(tv('result', ['id', 'customer_id', 'amount', 'status', 'created_at'], [[102, 1, 300, 'failed', '2026-10-03'], [104, 3, 200, 'failed', '2026-10-04']])) +
      table(['Tool', 'What it does', 'Example'], [
        ['<code>= != &lt; &gt; &lt;= &gt;=</code>', 'Compare', '<code>amount &gt; 500</code>'],
        ['<code>AND</code>, <code>OR</code>, <code>NOT</code>', 'Combine tests. <code>AND</code> is worked out before <code>OR</code>, so use brackets.', '<code>status = \'failed\' OR (status = \'pending\' AND amount &gt; 5000)</code>'],
        ['<code>IN</code>', 'Matches any value in a list', '<code>status IN (\'failed\', \'pending\')</code>'],
        ['<code>BETWEEN</code>', 'Inside a range, ends included', '<code>amount BETWEEN 100 AND 500</code>'],
        ['<code>LIKE</code>', 'Pattern. <code>%</code> means any characters.', '<code>email LIKE \'%gmail.com\'</code>'],
        ['<code>IS NULL</code>', 'Is the value missing?', '<code>email IS NULL</code>'],
      ]) +
      callout('amber', 'Text goes in single quotes', '<code>\'failed\'</code> is text. A number like <code>500</code> has no quotes.')),

    block('NULL: the trap', 'NULL means "unknown", so a normal comparison with it is never true.',
      sql('WHERE email = NULL      -- wrong: returns nothing\nWHERE email IS NULL     -- right') +
      callout('amber', 'Also remember', '<code>status != \'failed\'</code> does <strong>not</strong> return rows where status is NULL. Unknown is not "not failed". Use <code>COALESCE(amount, 0)</code> to turn a NULL into a value.')),

    block('ORDER BY, LIMIT and DISTINCT', 'Sort the rows, keep the first few, and remove repeats.',
      sql('SELECT id, amount\nFROM payments\nORDER BY amount DESC      -- DESC = biggest first, ASC = smallest first (the default)\nLIMIT 2;') +
      grid(tv('result', ['id', 'amount'], [[105, 900], [103, 700]])) +
      sql('SELECT DISTINCT customer_id\nFROM payments;      -- each customer once') +
      grid(tv('result', ['customer_id'], [[1], [3]])) +
      callout('green', 'Use LIMIT with ORDER BY', 'Without a sort, "the first 5" is just any 5.')),

    block('Counting and adding: aggregate functions', 'They turn many rows into one number.',
      table(['Function', 'Returns', 'Notes'], [
        ['<code>COUNT(*)</code>', 'How many rows', 'Counts every row, even ones with NULLs'],
        ['<code>COUNT(column)</code>', 'How many rows have a value in that column', 'Skips NULL'],
        ['<code>COUNT(DISTINCT column)</code>', 'How many different values', 'Skips NULL'],
        ['<code>SUM(column)</code>', 'The total', 'Skips NULL'],
        ['<code>AVG(column)</code>', 'The average', 'Skips NULL'],
        ['<code>MIN</code> / <code>MAX</code>', 'The smallest / biggest', ''],
      ]) +
      sql('SELECT COUNT(*) AS failed_count\nFROM payments\nWHERE status = \'failed\';') +
      grid(tv('result', ['failed_count'], [[2]]))),

    block('GROUP BY: one answer per group', 'Put rows into groups, then count or add up each group.',
      sql('SELECT status, COUNT(*) AS total\nFROM payments\nGROUP BY status;') +
      grid(tv('result', ['status', 'total'], [['succeeded', 3], ['failed', 2]])) +
      sql('SELECT customer_id, SUM(amount) AS total_amount\nFROM payments\nGROUP BY customer_id;') +
      grid(tv('result', ['customer_id', 'total_amount'], [[1, 1700], [3, 900]])) +
      callout('amber', 'The rule', 'Every column in <code>SELECT</code> must be either in <code>GROUP BY</code> or inside an aggregate like <code>COUNT</code> or <code>SUM</code>.')),

    block('WHERE vs HAVING', 'Both filter. They filter at different moments.',
      table(['', 'WHERE', 'HAVING'], [
        ['Filters', 'Individual rows', 'Groups'],
        ['When', 'Before grouping', 'After grouping'],
        ['Can use COUNT, SUM?', 'No', 'Yes'],
      ]) +
      sql('SELECT customer_id, COUNT(*) AS payments_made\nFROM payments\nWHERE status = \'succeeded\'     -- 1) keep only successful rows\nGROUP BY customer_id            -- 2) one group per customer\nHAVING COUNT(*) > 1;            -- 3) keep groups with more than one') +
      grid(tv('result', ['customer_id', 'payments_made'], [[1, 2]])) +
      `<p class="line">Customer 1 has two successful payments (101 and 105). Customer 3 has only one (103), so that group is dropped.</p>`),

    block('JOIN: bring tables together', 'A JOIN matches rows of two tables using a column they share.',
      table(['Join', 'Returns', 'Use it to'], [
        ['<code>INNER JOIN</code>', 'Only rows that match in both tables', 'See payments with their customer'],
        ['<code>LEFT JOIN</code>', 'Every row of the left table, plus matches. Missing matches show NULL.', 'Keep customers who have no payments'],
      ]) +
      sql('SELECT c.name, p.amount\nFROM customers c\nINNER JOIN payments p\n    ON c.id = p.customer_id;') +
      `<p class="line"><strong>INNER JOIN</strong>: Amit has no payment, so he is not in the result. 5 rows.</p>` +
      grid(tv('result', ['name', 'amount'], [['Rahul', 500], ['Rahul', 300], ['Neha', 700], ['Neha', 200], ['Rahul', 900]])) +
      sql('SELECT c.name, p.amount\nFROM customers c\nLEFT JOIN payments p\n    ON c.id = p.customer_id;') +
      `<p class="line"><strong>LEFT JOIN</strong>: Amit is kept, with NULL for the payment. 6 rows.</p>` +
      grid(tv('result', ['name', 'amount'], [['Rahul', 500], ['Rahul', 300], ['Rahul', 900], ['Amit', null], ['Neha', 700], ['Neha', 200]]))),

    block('Find what is missing', 'A very common support question: "which customers never paid?"',
      sql('SELECT c.id, c.name\nFROM customers c\nLEFT JOIN payments p\n    ON c.id = p.customer_id\nWHERE p.id IS NULL;') +
      grid(tv('result', ['id', 'name'], [[2, 'Amit']])) +
      `<p class="line">The <code>LEFT JOIN</code> keeps every customer. Where there is no matching payment, <code>p.id</code> is NULL, and the <code>WHERE</code> picks exactly those customers.</p>` +
      steps([
        '<strong>Too many rows?</strong> One row matches several rows in the other table, so the result multiplies. Check the join columns, or group the result.',
        '<strong>Lost the customers with no payments?</strong> A <code>WHERE p.status = \'failed\'</code> after a <code>LEFT JOIN</code> removes them, because their <code>p.status</code> is NULL. Put that test in the <code>ON</code> instead.',
        '<strong>Count per customer, including zero?</strong> <code>LEFT JOIN</code> and <code>COUNT(p.id)</code>, not <code>COUNT(*)</code>.',
      ])),

    block('Subquery and CTE', 'A query inside another query. A CTE gives that inner query a name so the whole thing reads top to bottom.',
      sql('-- Payments above the overall average\nSELECT *\nFROM payments\nWHERE amount > (\n    SELECT AVG(amount)\n    FROM payments\n);') +
      sql('-- The same idea as a CTE\nWITH failed_payments AS (\n    SELECT *\n    FROM payments\n    WHERE status = \'failed\'\n)\nSELECT COUNT(*)\nFROM failed_payments;') +
      callout('green', 'Good to know', 'A CTE lives only for that one statement. It does not create a table. A subquery that uses a column of the outer query (such as <code>p.customer_id</code>) is a <strong>correlated subquery</strong>: it is run for each outer row.')),

    block('CASE: if this, then that', 'Makes a new column from a rule. It never changes the stored data.',
      sql('SELECT id,\n       CASE\n           WHEN amount >= 500 THEN \'High\'\n           ELSE \'Low\'\n       END AS payment_category\nFROM payments;') +
      grid(tv('result', ['id', 'payment_category'], [[101, 'High'], [102, 'Low'], [103, 'High'], [104, 'Low'], [105, 'High']])) +
      sql('-- Failure percentage\nSELECT COUNT(CASE WHEN status = \'failed\' THEN 1 END) * 100.0\n       / COUNT(*) AS failure_percentage\nFROM payments;') +
      grid(tv('result', ['failure_percentage'], [[40.0]]))),

    block('UNION, dates and window functions', 'Three tools that appear in support queries.',
      table(['Tool', 'What it does', 'Example'], [
        ['<code>UNION</code>', 'Stacks two results and removes duplicate rows', ''],
        ['<code>UNION ALL</code>', 'Stacks two results and keeps everything. Faster.', ''],
        ['Date range', 'Use "from this day, up to but not including that day". It works even when there is a time.', '<code>created_at &gt;= \'2026-10-01\' AND created_at &lt; \'2026-11-01\'</code>'],
        ['<code>ROW_NUMBER() OVER (...)</code>', 'Numbers the rows inside each group, in an order you choose', '<code>ROW_NUMBER() OVER (PARTITION BY customer_id ORDER BY created_at DESC)</code>'],
      ]) +
      sql('-- Failed payments per day\nSELECT DATE(created_at) AS day, COUNT(*) AS failed_count\nFROM payments\nWHERE status = \'failed\'\nGROUP BY DATE(created_at)\nORDER BY day;') +
      grid(tv('result', ['day', 'failed_count'], [['2026-10-03', 1], ['2026-10-04', 1]]))),

    block('Changing data: use care', 'These commands change the database. Read them twice.',
      table(['Command', 'What it does'], [
        ['<code>INSERT INTO</code>', 'Adds a new row'],
        ['<code>UPDATE … SET … WHERE</code>', 'Changes values in existing rows'],
        ['<code>DELETE FROM … WHERE</code>', 'Removes rows. The table stays.'],
        ['<code>DROP TABLE</code>', 'Removes the whole table and its data'],
      ]) +
      sql('UPDATE payments\nSET status = \'review\'\nWHERE id = 101;') +
      callout('amber', 'No WHERE, no mercy', 'An <code>UPDATE</code> or <code>DELETE</code> without a <code>WHERE</code> changes <strong>every row</strong>. Run it first as a <code>SELECT</code> with the same <code>WHERE</code> to see which rows it would touch.')),

    block('Keys, indexes and slow queries', 'Why some queries are fast and some are slow.',
      table(['Idea', 'Plain meaning'], [
        ['Index', 'Like the index of a book. It lets the database find rows without reading every row. It speeds up reading, and costs a little on every write.'],
        ['Execution plan', 'The database\'s own description of how it will run your query. Ask for it with <code>EXPLAIN</code>.'],
      ]) +
      sql('EXPLAIN ANALYZE\nSELECT *\nFROM payments\nWHERE customer_id = 25;') +
      callout('green', 'A slow query', 'Look at the plan first. See where it reads every row, and check the columns in <code>WHERE</code> and <code>JOIN</code>. Do not guess, and do not delete indexes.')),

    block('Read a query: four questions', 'For any query, say these four things out loud.',
      steps([
        '<strong>Which table or tables</strong>, and how are they joined?',
        '<strong>Which rows</strong> are kept? Read the <code>WHERE</code>.',
        '<strong>How are they grouped</strong>, and what is counted or added?',
        '<strong>What does one row of the result mean?</strong> Is it a payment, a customer, or a day?',
      ]) +
      sql('SELECT customer_id, COUNT(*) AS failed_count\nFROM payments\nWHERE status = \'failed\'\nGROUP BY customer_id\nHAVING COUNT(*) >= 3;') +
      `<p class="line">"From payments, keep the failed ones, make one group per customer, keep groups of three or more. Each result row is a customer, and the number is how many times their payment failed."</p>`),

    block('Support patterns to remember', 'These queries answer most customer questions.',
      table(['The question', 'The pattern'], [
        ['A customer says a payment is missing', '<code>WHERE id = \'…\'</code>. Then check the right environment and the identifier.'],
        ['What did this customer do lately?', '<code>WHERE customer_id = 25 ORDER BY created_at DESC LIMIT 10</code>'],
        ['What went wrong this week?', '<code>GROUP BY</code> day or status, then <code>COUNT(*)</code>'],
        ['Who keeps failing?', '<code>WHERE status = \'failed\' GROUP BY customer_id HAVING COUNT(*) &gt;= 3</code>'],
        ['Who never paid?', '<code>LEFT JOIN … WHERE p.id IS NULL</code>'],
        ['Are there duplicates?', '<code>GROUP BY</code> the column that should be unique, <code>HAVING COUNT(*) &gt; 1</code>'],
      ]) +
      callout('amber', 'Practise explaining, not memorizing', 'In an interview, say what the data tells you about the customer\'s problem. A repeated count is not always a duplicate payment: check before you say it.')),
  ];

  const bulb = '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 12.5h4M6.5 14.5h3M8 1.5a4.5 4.5 0 0 0-2.4 8.3c.5.4.9 1 .9 1.7h3c0-.7.4-1.3.9-1.7A4.5 4.5 0 0 0 8 1.5z"/></svg>';

  /* Options that hold SQL (several lines) are shown as code */
  const text = (t) => (/\n|^curl |^-{1,2}[A-Za-z]/.test(t) ? `<code class="qz-code" data-sql>${esc(t)}</code>` : esc(t));

  /* Under the question: a code box, or sample tables followed by a code box */
  const qextra = (x) => {
    if (!x) return '';
    const codeBox = (t) => `<code class="qz-code qz-qcode" data-sql>${esc(t)}</code>`;
    if (typeof x === 'string') return codeBox(x);
    const tv = (t) =>
      `<div class="tv"><div class="tv-head">${esc(t.name)}<small>${t.rows.length} rows</small></div><div class="tv-scroll"><table>` +
      `<thead><tr>${t.cols.map((c) => `<th>${esc(c)}</th>`).join('')}</tr></thead>` +
      `<tbody>${t.rows.map((r) => `<tr>${r.map((v) => `<td>${esc(v)}</td>`).join('')}</tr>`).join('')}</tbody></table></div></div>`;
    return `<div class="tv-grid">${x.tables.map(tv).join('')}</div>${x.code ? codeBox(x.code) : ''}`;
  };

  const quiz = ([, , opts, right, why, example], reveal) => {
    const o = opts.map((t, k) =>
      `<button type="button" class="qz-opt" data-k="${k}"><span class="qz-letter">${L[k]}</span><span class="qz-text">${text(t)}</span></button>`).join('');
    return `<div class="qz" data-right="${right}">` +
      `<div class="qz-main"><div class="qz-bar"><button type="button" class="qz-hint" aria-expanded="false">${bulb}<span>Hint</span></button></div>` +
      (reveal ? `<div class="qz-reveal"><button type="button" class="qz-show">Show options</button></div>` : '') +
      `<div class="qz-opts"${reveal ? ' hidden' : ''}>${o}</div>` +
      `<div class="qz-result" hidden><div class="qz-verdict"></div><button type="button" class="qz-retry">Try again</button></div></div>` +
      `<aside class="qz-side" hidden><div class="qz-side-title">Answer</div>` +
      `<div class="qz-answer"><span class="qz-letter">${L[right]}</span><span class="qz-text">${text(opts[right])}</span></div>` +
      `<p class="qz-why">${esc(why)}</p>${example ? `<code class="qz-code" data-sql>${esc(example)}</code>` : ''}</aside></div>`;
  };

  /* Progress card (right side): ring plus a few counts */
  const progress = (n, extra = '') =>
    `<div class="block qz-prog">` +
    `<div class="qz-ring"><svg viewBox="0 0 120 120" aria-hidden="true"><circle class="qz-ring-bg" cx="60" cy="60" r="52"/><circle class="qz-ring-fg" cx="60" cy="60" r="52"/></svg>` +
    `<div class="qz-ring-text"><b class="qz-pct">0%</b><span>answered</span></div></div>` +
    `<div class="qz-count-line"><b class="qz-count">0</b> of ${n} questions</div>` +
    `<div class="qz-stats"><div class="ok"><b class="qz-ok">0</b><span>Correct</span></div><div class="no"><b class="qz-no">0</b><span>Wrong</span></div><div><b class="qz-left">${n}</b><span>Left</span></div></div>` +
    `<div class="qz-done" hidden></div>${extra}</div>`;

  /* One section per set, holding every question; each question is one block (one slide) */
  const section = (key, title, lead, Q, extra, reveal) => ({
    key, title, lead,
    blocks: [progress(Q.length, extra), ...Q.map((item, i) =>
      `<div class="block qz-block" id="qz-${key}-${i + 1}"><div class="qz-label"><span class="qz-qn">Question ${i + 1} of ${Q.length}</span><span class="qz-topic">${esc(item[0])}</span></div>` +
      `<h2 class="qz-q">${esc(item[1])}</h2>${qextra(item[6])}${quiz(item, reveal)}</div>`)],
  });

  const theoryBtn = (href) => `<div class="theory-card-btn"><a class="theory-btn" href="${href}">` +
    `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2 3.5C2 3 2.4 2.7 3 2.7c1.9 0 3.4.4 5 1.6 1.6-1.2 3.1-1.6 5-1.6.6 0 1 .3 1 .8v8.5c0 .5-.4.8-1 .8-1.9 0-3.4.4-5 1.6-1.6-1.2-3.1-1.6-5-1.6-.6 0-1-.3-1-.8z"/><path d="M8 4.3v9.5"/></svg>` +
    `<span>Review theory</span></a></div>`;

  const subs = [
    section('set-one', 'Stripe API and Troubleshooting', '30 questions. Idempotency, pagination, expand and rate limits; status codes, webhooks and signatures; reading failures with SQL.', SET1),
    section('set-two', 'SQL and API Essentials', '30 questions. Keys, JOINs and grouping; data analysis with HAVING, CTEs and window functions; HTTP methods, status codes and webhooks.', SET2),
    section('set-three', 'cURL and API Requests', '30 questions. cURL options, headers and authentication, HTTP methods and bodies, response codes, and Stripe-style requests. Includes a theory review.', SET3, theoryBtn('#s6-curl-theory')),
    { key: 'curl-theory', under: 'set-three', num: '6.3.1', title: 'cURL Theory', noCard: true, lead: 'cURL in plain English: what it is, the request types, the options, logging in, and the status codes you will meet most.',
      head: '<div class="theory-actions"><a class="theory-btn" href="#s6-set-three">Back to cURL and API Requests</a></div>', blocks: theory },
    section('set-four', 'SQL Concepts', '30 questions. SELECT and WHERE, filtering, JOINs, aggregation, subqueries, CTEs, indexes and payment troubleshooting. Links to the SQL module for theory.', SET4, theoryBtn('#s6-sql-theory')),
    { key: 'sql-theory', under: 'set-four', num: '6.4.1', title: 'SQL Theory', noCard: true, lead: 'SQL in plain English: SELECT, WHERE, GROUP BY, HAVING, JOINs, subqueries and the other tools these questions use, with small tables to follow along.',
      head: '<div class="theory-actions"><a class="theory-btn" href="#s6-set-four">Back to SQL Concepts</a></div>', blocks: sqlTheory },
    section('set-five', 'Reading SQL Queries', '20 questions. You see a query and explain what it returns. The options stay hidden until you ask for them.', SET5, theoryBtn('#s6-sql-theory'), true),
    section('set-six', 'Advanced SQL Reading', '20 questions. Harder queries: correlated subqueries, CASE, NOT EXISTS, and what a WHERE does to a LEFT JOIN. Options stay hidden until you ask.', SET6, theoryBtn('#s6-sql-theory'), true),
  ];

  Ops.content['quiz'] = Ops.h.module({
    id: 'session-6', prefix: 's6', num: 6, title: 'Quiz',
    lead: 'Six question sets on the Stripe API, SQL and cURL. Pick an answer: green means right, red means wrong.',
    subs,
  });

  const CIRC = 2 * Math.PI * 52;
  const refresh = (from) => {
    const page = from.closest('.page');
    const prog = page.querySelector('.qz-prog');
    const items = Array.from(page.querySelectorAll('.qz-block .qz'));
    let ok = 0, no = 0;
    items.forEach((q) => {
      if (q.querySelector('.qz-opt.is-wrong')) no++;
      else if (q.querySelector('.qz-opt.is-right')) ok++;
    });
    const done = ok + no;
    const set = (c, v) => { prog.querySelector(c).textContent = v; };
    set('.qz-pct', `${Math.round((done / items.length) * 100)}%`); set('.qz-count', done);
    set('.qz-ok', ok); set('.qz-no', no); set('.qz-left', items.length - done);
    prog.querySelector('.qz-ring-fg').style.strokeDashoffset = String(CIRC * (1 - done / items.length));
    const fin = prog.querySelector('.qz-done');
    fin.hidden = done < items.length;
    if (done === items.length) fin.textContent = `Finished. You got ${ok} of ${items.length} right (${Math.round((ok / items.length) * 100)}%).`;
  };

  /* Hint toggles the answer panel on the right. Picking an option locks it and colours the choice. */
  document.addEventListener('click', (e) => {
    const show = e.target.closest('.qz-show');
    if (show) {
      const qz = show.closest('.qz');
      qz.querySelector('.qz-opts').hidden = false;
      show.closest('.qz-reveal').remove();
      return;
    }
    const hint = e.target.closest('.qz-hint');
    const retry = e.target.closest('.qz-retry');
    const opt = e.target.closest('.qz-opt');
    const hit = hint || retry || opt;
    const root = hit && hit.closest('.qz');
    if (!root) return;
    const buttons = root.querySelectorAll('.qz-opt');
    const result = root.querySelector('.qz-result');
    const side = root.querySelector('.qz-side');
    if (hint) {
      side.hidden = !side.hidden;
      root.classList.toggle('has-side', !side.hidden);
      hint.setAttribute('aria-expanded', String(!side.hidden));
      return;
    }
    if (retry) {
      buttons.forEach((b) => { b.disabled = false; b.classList.remove('is-right', 'is-wrong', 'is-reveal'); });
      result.hidden = true;
      refresh(root);
      return;
    }
    if (opt.disabled) return;
    const right = Number(root.dataset.right);
    const pick = Number(opt.dataset.k);
    buttons.forEach((b) => { b.disabled = true; });
    buttons[right].classList.add(pick === right ? 'is-right' : 'is-reveal');
    if (pick !== right) opt.classList.add('is-wrong');
    const verdict = root.querySelector('.qz-verdict');
    verdict.textContent = pick === right ? 'Correct' : `Not quite. The answer is ${L[right]}.`;
    verdict.className = `qz-verdict ${pick === right ? 'ok' : 'no'}`;
    result.hidden = false;
    refresh(root);
  });
})();
