/* Quiz: Stripe Docs Practice (ADV). 20 advanced questions, no options. Same format as quiz-docs.js.
   Every answer was read from the page it links to (docs.stripe.com, checked 2026-10-28).
   quiz.js adds Ops.docsPractice5 to the Quiz module. */
(() => {
  const { D, KEY } = Ops.docsConst;

  const Q = [
    /* Idempotency and retries */
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
    { topic: 'Refund, low balance',
      q: `A merchant issues a 200 USD card refund but their available balance is 50 USD. What happens to a card refund, and to a refund for another payment method?`,
      why: `Refunds use the available balance (not pending amounts). For card payments Stripe holds the refund as pending until the balance is enough. For other payment method types the refund fails. A negative balance can be fixed by collecting payments or topping up.`,
      url: `${D}/refunds`, page: 'Refund and cancel payments' },


    /* Webhooks */
    { topic: 'Rolled secret',
      q: `You roll a webhook signing secret and keep the old one active for 24 hours. During that time, how many signatures does Stripe put in the Stripe-Signature header?`,
      why: `One for each active secret. The header contains a timestamp (t=) and one or more v1 signatures, so your endpoint can verify with either the old or the new secret during the overlap. The old secret can stay active for up to 24 hours. Ignore signature schemes other than v1.`,
      url: `${D}/webhooks`, page: 'Webhooks (roll endpoint signing secrets)' },

    /* Money movement and disputes */
    { topic: 'Dispute withdrawn',
      q: `A customer emails "I withdrew the dispute" and the merchant does nothing. What is wrong, and how many chances does the merchant get to send evidence?`,
      why: `While a dispute is active, the only way to overturn it is to submit evidence, even if the customer claims to have withdrawn it. Evidence can be submitted once: it cannot be edited or added to afterwards. Missing the deadline (usually 7 to 21 days) loses the dispute.`,
      url: `${D}/disputes/how-disputes-work`, page: 'How disputes work (respond to a dispute)' },

    /* Disputes, declines and money movement (new) */
    { topic: 'Dispute timeline',
      q: `A merchant receives a dispute today. Roughly how long do they have to respond, how long does the bank take to decide after that, and how long does the whole process usually run?`,
      why: `The merchant usually has 7 to 21 days to respond (depending on the card network), and missing it loses the dispute. The bank usually takes 60 to 75 days to decide after evidence is submitted. The whole lifecycle often takes 2 to 3 months. Customers can typically open a dispute within 120 days of the payment.`,
      url: `${D}/disputes/how-disputes-work`, page: 'How disputes work (dispute timing)' },
    { topic: 'Early fraud warning',
      q: `Stripe shows an early fraud warning on a 12 USD payment, with no dispute yet. Is a response required? Can a refund still prevent a fraud report, and when?`,
      why: `No response is required; it is only a signal. About 40% of Visa and Mastercard warnings become fraud disputes if the charge is not refunded. A refund can prevent the fraud report only when it is processed as a reversal, which usually happens within 2 hours of capture. A later refund does not remove the warning.`,
      url: `${D}/disputes/how-disputes-work`, page: 'How disputes work (early fraud warnings)' },
    { topic: 'Blocked payment',
      q: `A customer says their bank shows a pending charge, but Stripe shows the payment as blocked by Radar. Were they charged? The merchant knows the customer is genuine. What can they do?`,
      why: `They were not charged: Stripe blocked it before asking the card issuer. For some cards the issuer's authorization can still show on the statement, and the issuer typically removes it within a few days. For a genuine customer, find the payment in the Dashboard and click Add to allow list. That does not retry the payment; it stops the rules blocking future attempts that match the same attribute.`,
      url: `${D}/declines`, page: 'Declines (blocked payments)' },
    { topic: 'Do not reveal',
      q: `Which decline codes should support not explain to the customer, what should the customer be shown instead, and what does duplicate_transaction tell you to check?`,
      why: `fraudulent, lost_card, stolen_card and merchant_blacklist: show the customer the same message as a generic_decline, with no detail. duplicate_transaction means a transaction with identical amount and card information was submitted very recently, so check whether a recent payment already exists before asking for another payment.`,
      url: `${D}/declines/codes`, page: 'Stripe decline codes' },
    { topic: 'Refund, requires_action',
      q: `A refund for a Konbini payment sits in requires_action. What is Stripe waiting for, what are the next statuses, and can the merchant cancel it?`,
      why: `Some methods (Konbini, PromptPay, Boleto, bank transfers) have no native refund support, so Stripe emails the customer to collect bank details. When the customer submits them the refund becomes pending, then succeeded. If they do not respond before the expiry it becomes failed. If their bank cannot complete it, it returns to requires_action. The merchant can cancel while it is in requires_action, from the Dashboard or the API.`,
      url: `${D}/refunds`, page: 'Refund and cancel payments (refunds that require action)' },
    { topic: 'Japan settlement',
      q: `A new Japan-based merchant asks when they get money and why daily payouts are not offered. What do the docs say about settlement timing and the default payout schedule?`,
      why: `For Japan the initial settlement is 7 calendar days, and afterwards 4 business days from pending to available. Daily payouts are not available in Japan, and the default payout schedule is manual (see Receive payouts). Payouts only draw on the available balance.`,
      url: `${D}/payments/balances`, page: 'Balances and settlement time' },
    { topic: 'Which limit',
      q: `A script updates the same PaymentIntent 1,200 times in an hour, while a flash sale pushes 60 requests in progress at once in live mode. Which published limits apply?`,
      why: `A PaymentIntent allows 1000 update requests per PaymentIntent per hour, so 1,200 updates exceed it. The default global concurrency limit in live mode is 50 requests in progress, so 60 can trigger a concurrency 429. The global rate limit is 100 requests per second in live mode (25 in a sandbox). Back off with exponential delay and jitter.`,
      url: `${D}/rate-limits`, page: 'Rate limits' },
    { topic: 'Two 3DS test cards',
      q: `Two test cards both involve 3D Secure: 4000 0025 0000 3155 and 4000 0027 6000 3184. What is the difference?`,
      why: `4000 0025 0000 3155 requires authentication for off-session payments unless the card was set up for future payments. 4000 0027 6000 3184 requires authentication on all transactions, however the card was set up. Use any valid future expiry and any 3-digit CVC.`,
      url: `${D}/testing`, page: 'Test your integration (3D Secure test cards)' },
    { topic: 'Key rotation',
      q: `A developer leaves the company. How do you rotate a live secret key without downtime, and what if the key was leaked and must stop working immediately?`,
      why: `Rotate it in the Dashboard. A rotation creates a replacement key that works at once, and the old and new key both work for up to 7 days, so servers can be moved gradually. If the key was leaked, choose expiry Now, which deletes the old key straight away. Watch the old key's request logs before it expires. Keys unused for transfers or payouts for over 180 days can have access limited.`,
      url: `${D}/keys`, page: 'API keys (rotate an API key)' },
  ];

  Ops.docsPractice5 = Ops.docsMake('set-eleven', 'Stripe Docs Practice (ADV)',
    '20 advanced questions with no options. Idempotency and retries, expand and metadata, special currencies, authorize and capture, refunds, webhooks, disputes, payouts and subscriptions. Find the answer in the Stripe docs, then click Show answer.', Q);
})();
