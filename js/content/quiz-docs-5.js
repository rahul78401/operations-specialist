/* Quiz: Stripe Docs Practice (ADV). 20 advanced questions, no options. Same format as quiz-docs.js.
   Every answer was read from the page it links to (docs.stripe.com, checked 2026-10-28).
   quiz.js adds Ops.docsPractice5 to the Quiz module. */
(() => {
  const { D, KEY } = Ops.docsConst;

  const Q = [
    /* Idempotency and retries */
    { topic: 'Key, new amount',
      q: `A developer sent a PaymentIntent with Idempotency-Key "order-77" and amount=1500. It timed out. They fix a pricing bug and retry with the SAME key but amount=2000. What happens, and what is the right move?`,
      req: `curl https://api.stripe.com/v1/payment_intents \\\n  ${KEY} \\\n  -H "Idempotency-Key: order-77" \\\n  -d amount=2000 \\\n  -d currency=usd`,
      why: `Stripe compares the incoming parameters with the first request and returns an error (type idempotency_error) because they differ. A key is tied to its first request. Do not just switch keys: first find out whether the 1500 payment was created. If it was not, use a new key for the corrected request.`,
      url: `${D}/api/idempotent_requests`, page: 'API reference: Idempotent requests' },
    { topic: '409 conflict',
      q: `A POST returns 409. The first request with the same Idempotency-Key is still running. Should the client generate a fresh key and send it again?`,
      why: `No. A new key could start a second operation. Wait, then retry with the same key and the same parameters. A 409 means the request conflicts with another one, perhaps because of the same idempotent key.`,
      url: `${D}/error-low-level`, page: 'Advanced error handling (content errors)' },
    { topic: '500 on a POST',
      q: `A POST with an idempotency key returns 500. The code generates a new key and retries immediately. What is the risk, and what should happen instead?`,
      why: `The outcome of a 500 is unknown: the operation might already have had side effects, so a new key could create a second object. Retrieve the object, inspect the request in the Dashboard and use webhook events to reconcile. With the same key you get the cached 500 back while Stripe still holds it. Putting your own ID in metadata helps match objects that arrive through webhooks.`,
      url: `${D}/error-low-level`, page: 'Advanced error handling (server errors)' },
    { topic: 'Key too old',
      q: `A job retries a failed POST with the same idempotency key 30 hours later. Why is that unsafe?`,
      why: `Stripe can remove keys once they are at least 24 hours old, and a reused key after that generates a new request, which may duplicate the operation. Limit retries to the first 24 hours. After that, stop retrying and reconcile: retrieve the object, check the Dashboard and webhook events, and contact support if you cannot tell what happened.`,
      url: `${D}/error-low-level`, page: 'Advanced error handling (POST requests)' },
    { topic: 'Lock timeout',
      q: `A 429 comes back without a Stripe-Rate-Limited-Reason header, and the response has no request ID. What is it, and how do you reduce it?`,
      why: `It is probably an object lock timeout (code lock_timeout): another request or Stripe process was using the same object. Stripe did not process the request, so it has no request ID. Retry on an exponential backoff (the SDKs retry these for you) and queue changes to the same object so they run one after another.`,
      url: `${D}/rate-limits`, page: 'Rate limits (object lock timeouts)' },

    /* Reading data */
    { topic: 'Expand depth',
      q: `You list charges and ask to expand data.payment_intent.customer.default_source. How deep can an expansion go, and does it work on a list?`,
      req: `curl -G https://api.stripe.com/v1/charges \\\n  ${KEY} \\\n  -d "expand[]=data.payment_intent.customer.default_source"`,
      why: `The maximum depth is four levels, and this example is the deepest the docs allow when listing charges. On a list call the path starts with data. Deep expansions on many list calls can be slow.`,
      url: `${D}/api/expanding_objects`, page: 'API reference: Expanding responses' },
    { topic: 'Metadata limits',
      q: `A team wants to save a structured object with 60 keys and a key named "order[id]" in metadata. What breaks?`,
      why: `Metadata allows up to 50 keys, key names up to 40 characters and values up to 500 characters, and square brackets are not allowed in keys. Use a flat key such as order_id, and keep the number of keys under 50. Never store card details or other sensitive data there.`,
      url: `${D}/api/metadata`, page: 'API reference: Metadata' },

    /* Money */
    { topic: 'ISK amount',
      q: `A merchant in Iceland wants to charge 5 ISK. ISK is described as zero-decimal. What amount do you send?`,
      why: `500. ISK transitioned to zero-decimal, but for backward compatibility it is sent as a two-decimal value whose last two digits are always 00. You cannot charge fractions of ISK. UGX works the same way.`,
      fix: `curl https://api.stripe.com/v1/payment_intents \\\n  ${KEY} \\\n  -d amount=500 \\\n  -d currency=isk`,
      url: `${D}/currencies`, page: 'Supported currencies (special cases)' },
    { topic: 'HUF payout',
      q: `The available balance is HUF 10.45. The finance team tries a manual payout of the full balance with amount=1045. Why does it fail, and what is the largest amount that works?`,
      why: `Stripe treats HUF as zero-decimal for payouts, so a manual payout amount must be a whole number divisible by 100. 1045 is not. Pay out HUF 10 with amount=1000. HUF charges stay two-decimal; TWD behaves the same way.`,
      fix: `curl https://api.stripe.com/v1/payouts \\\n  ${KEY} \\\n  -d amount=1000 \\\n  -d currency=huf`,
      url: `${D}/currencies`, page: 'Supported currencies (special cases)' },

    /* Authorize, capture, cancel */
    { topic: 'Hold on JPY',
      q: `A Japan-based merchant authorizes a JPY payment on a Visa card and captures it on day 20. A French merchant does the same with EUR. Which capture works, and why?`,
      why: `The Japanese account can hold JPY payments on Visa, Mastercard, JCB, Diners Club and Discover for up to 30 days. Non-JPY and American Express payments use the standard windows (usually 7 days online), so the EUR capture on day 20 would be too late: the hold expires, the funds are released and the payment becomes canceled.`,
      url: `${D}/payments/place-a-hold-on-a-payment-method`, page: 'Place a hold on a payment method' },
    { topic: 'Partial capture',
      q: `A PaymentIntent authorized 10.99 USD. The shop captures 7.50 USD. What happens to the other 3.49, and can the shop capture it later?`,
      req: `curl https://api.stripe.com/v1/payment_intents/pi_123/capture \\\n  ${KEY} \\\n  -d amount_to_capture=750`,
      why: `A partial capture releases the remaining amount automatically. For most payments only one capture is possible, so the shop cannot capture the difference later. (Some card payments support multicapture.) To charge more later, save the payment method and create a new payment.`,
      url: `${D}/payments/place-a-hold-on-a-payment-method`, page: 'Place a hold on a payment method (capture the funds)' },
    { topic: 'Refund before capture',
      q: `Support tries to refund a PaymentIntent whose status is requires_capture. What should they do instead?`,
      why: `The charge is uncaptured and cannot be refunded directly. Cancel the PaymentIntent, which releases the held funds. Cancelling cannot be undone, and it is not possible after succeeded.`,
      fix: `curl -X POST https://api.stripe.com/v1/payment_intents/pi_123/cancel \\\n  ${KEY}`,
      url: `${D}/refunds`, page: 'Refund and cancel payments (cancel a payment)' },
    { topic: 'Refund, low balance',
      q: `A merchant issues a 200 USD card refund but their available balance is 50 USD. What happens to a card refund, and to a refund for another payment method?`,
      why: `Refunds use the available balance (not pending amounts). For card payments Stripe holds the refund as pending until the balance is enough. For other payment method types the refund fails. A negative balance can be fixed by collecting payments or topping up.`,
      url: `${D}/refunds`, page: 'Refund and cancel payments' },

    { topic: 'After a decline',
      q: `A customer's card is declined on a PaymentIntent. They enter a different card on the same checkout page. Which status is the PaymentIntent in after the decline, and should the shop create a new PaymentIntent?`,
      why: `After a failed attempt (for example a decline) the PaymentIntent returns to requires_payment_method, so the payment can be retried. Reuse the same PaymentIntent so the purchase stays on one object. Each attempt creates a Charge; list charges with the payment_intent parameter to see every attempt, including the failed one.`,
      url: `${D}/payments/paymentintents/lifecycle`, page: 'How Payment Intents and Setup Intents work' },

    /* Webhooks */
    { topic: 'Event order',
      q: `A handler receives invoice.paid before customer.subscription.created and crashes because the subscription is not in its database yet. What does Stripe guarantee, and what should the handler do?`,
      why: `Stripe does not guarantee that events arrive in the order they were generated. Do not depend on order or on the created timestamp (it is in seconds, so events can share it). Track event IDs to catch duplicates, and fetch the related objects from the API when you need them.`,
      url: `${D}/webhooks`, page: 'Webhooks (event ordering)' },
    { topic: 'Rolled secret',
      q: `You roll a webhook signing secret and keep the old one active for 24 hours. During that time, how many signatures does Stripe put in the Stripe-Signature header?`,
      why: `One for each active secret. The header contains a timestamp (t=) and one or more v1 signatures, so your endpoint can verify with either the old or the new secret during the overlap. The old secret can stay active for up to 24 hours. Ignore signature schemes other than v1.`,
      url: `${D}/webhooks`, page: 'Webhooks (roll endpoint signing secrets)' },
    { topic: 'Missed events',
      q: `An endpoint was down. Which events can you still resend from the Dashboard, which from the CLI, and how far back can the Events API reach?`,
      why: `The Dashboard Resend button works up to 15 days after the event was created. The Stripe CLI (stripe events resend) works up to 30 days. The Events API keeps events for 30 days. A manual resend does not cancel Stripe's automatic retries.`,
      url: `${D}/webhooks`, page: 'Webhooks (manual retries)' },

    /* Money movement and disputes */
    { topic: 'Dispute withdrawn',
      q: `A customer emails "I withdrew the dispute" and the merchant does nothing. What is wrong, and how many chances does the merchant get to send evidence?`,
      why: `While a dispute is active, the only way to overturn it is to submit evidence, even if the customer claims to have withdrawn it. Evidence can be submitted once: it cannot be edited or added to afterwards. Missing the deadline (usually 7 to 21 days) loses the dispute.`,
      url: `${D}/disputes/how-disputes-work`, page: 'How disputes work (respond to a dispute)' },
    { topic: 'Failed payout',
      q: `A payout shows paid on Monday and failed on Thursday with failure_code debit_not_authorized. Is that possible, and what does the code mean?`,
      why: `Yes: some payouts that fail first show as paid and later change to failed (or canceled, within 5 business days). debit_not_authorized means debit transactions are not approved on the bank account; Stripe requires accounts to be set up for both credit and debit payouts. The money returns to the balance.`,
      url: `${D}/api/payouts/object`, page: 'API reference: The Payout object' },
    { topic: 'Subscription start',
      q: `A new subscription created with charge_automatically has status incomplete. Nobody fixes the card. What is the status 24 hours later?`,
      why: `incomplete_expired. If the first invoice is not paid within 23 hours, the subscription moves to incomplete_expired, a terminal status: the open invoice is voided and no further invoices are generated. Once the first invoice is paid, it would have moved to active.`,
      url: `${D}/api/subscriptions/object`, page: 'API reference: The Subscription object (status)' },
  ];

  Ops.docsPractice5 = Ops.docsMake('set-eleven', 'Stripe Docs Practice (ADV)',
    '20 advanced questions with no options. Idempotency and retries, expand and metadata, special currencies, authorize and capture, refunds, webhooks, disputes, payouts and subscriptions. Find the answer in the Stripe docs, then click Show answer.', Q);
})();
