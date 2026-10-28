/* Quiz: Advanced Stripe Concepts, topics 5 and 6 (refunds, disputes and payouts; playbooks and cheat sheets).
   These pages explain; they do not ask. Every fact shows the Stripe docs page it was read from (checked 2026-10-28).
   Defined after quiz-adv-2.js, which sets Ops.advTopics. */
(() => {
  const { block, table, list, steps, callout, source } = Ops.h;
  const { D, ref, check } = Ops.adv;

  /* ---------- Topic 5: refunds, disputes and payouts ---------- */
  Ops.advTopics.push({
    key: 'adv-flows', title: 'Refunds, Disputes and Payouts',
    lead: 'Money going back to a customer, a bank reversing a payment, and money going out to the merchant\'s bank account.',
    blocks: [
      block('How a refund travels', 'Stripe sends the refund request to the customer\'s bank or card issuer straight away. The customer usually sees the credit about <strong>5 to 10 business days</strong> later, depending on the bank. Do not promise a date.',
        table(['Status', 'Meaning'], [
          ['<code>pending</code>', 'Being processed'],
          ['<code>requires_action</code>', 'Stripe needs bank details from the customer first (see "Cancelling a refund")'],
          ['<code>succeeded</code>', 'Refund sent. The customer\'s bank still needs time to show it'],
          ['<code>failed</code>', 'The refund could not be completed'],
          ['<code>canceled</code>', 'The refund was cancelled'],
        ]) +
        list([
          'A refund issued soon after the charge may appear as a <strong>reversal</strong>: the original charge drops off the statement and no separate credit shows',
          'Give the customer the refund reference to take to their bank: an ARN (or STAN or RRN). It can take up to 7 business days to appear, and there is none for a reversal. Find it in the payment timeline, under View details on the refund',
        ]) +
        source([[`${D}/refunds`, 'Refund and cancel payments, "Trace a refund"']])),

      block('Refund rules', 'You can refund all or part of a payment, more than once, but never more than the original amount in total.',
        list([
          'Stripe\'s processing fees from the original payment are <strong>not</strong> returned',
          'Refunds go only to the original payment method, never to another card or bank account',
          'Refunding by PaymentIntent is the same as refunding the charge. For a partial refund, pass <code>amount</code> in the smallest currency unit',
          'A refund uses your available balance. If it is too low, card refunds wait as pending, and refunds for other methods fail',
          'A card that expired or was cancelled is handled by the issuer, usually credited to the replacement card',
          'Bank debits (SEPA, Bacs, ACH and others) carry a risk of a double refund if the bank also starts a dispute',
          'A payment that is only authorized cannot be refunded: cancel the PaymentIntent instead',
        ]) +
        source([[`${D}/refunds`, 'Refund and cancel payments']])),

      block('When a refund fails', 'The customer\'s bank or card issuer could not process it, for example a closed account or a card problem. The bank returns the money to Stripe, Stripe adds it back to your balance (this can take up to 30 days), and the refund moves to <code>failed</code>. You must arrange <strong>another way</strong> to pay the customer.',
        table(['<code>failure_reason</code>', 'Meaning'], [
          ['<code>expired_or_canceled_card</code>', 'The customer cancelled the card, or it expired'],
          ['<code>lost_or_stolen_card</code>', 'The original card was lost or stolen'],
          ['<code>insufficient_funds</code>', 'Pending for lack of funds, past the pending expiry window'],
          ['<code>charge_for_pending_refund_disputed</code>', 'The charge was disputed while the refund was pending. Accept or challenge the dispute instead'],
          ['<code>declined</code>, <code>merchant_request</code>, <code>unknown</code>', 'Declined by Stripe\'s partners, at your request, or for an unknown reason'],
        ]) +
        callout('amber', 'Events', 'Stripe sends a <code>refund.failed</code> event. At minimum, listen for <code>refund.created</code>.') +
        source([[`${D}/refunds`, 'Refund and cancel payments, "Handle failed refunds" and "Refund events"']])),

      block('Cancelling a refund, and refunds that need action', 'Some refunds can be cancelled. Some wait for the customer.',
        list([
          'Some card refunds can be cancelled for a short time, from the Dashboard only, and not if the refund was processed as a charge reversal. A cancelled refund shows as <code>canceled</code>',
          'Some methods have no native refund support (for example Konbini, PromptPay, Boleto and bank transfers). The refund waits in <code>requires_action</code> while Stripe emails the customer for bank details',
          'When the customer replies it becomes <code>pending</code>, then <code>succeeded</code>. If they never respond it becomes <code>failed</code>',
          'For this kind of refund you can cancel from the Dashboard or the API',
        ]) +
        source([[`${D}/refunds`, 'Refund and cancel payments, "Cancel a refund" and "Refunds that require action"']])),

      block('Refund or dispute?', 'A <strong>refund</strong> is you sending money back. A <strong>dispute</strong> (chargeback) is the customer\'s bank reversing the payment.',
        table(['', 'Refund', 'Dispute'], [
          ['Started by', 'The business', 'The customer\'s bank, after the customer contacts it'],
          ['Money', 'Goes back to the customer when you choose', 'The card network pulls the amount at once. Stripe takes it <strong>plus a dispute fee</strong> from your balance'],
          ['Your part', 'Create the refund', 'Respond with evidence, or accept'],
          ['Who decides', 'You', 'The customer\'s bank. Stripe guides you but does not influence the result'],
        ]) +
        list([
          'While a dispute is open you cannot issue a refund outside the dispute process',
          'A dispute raises your dispute rate with that card network',
        ]) +
        source([[`${D}/disputes`, 'Disputes'], [`${D}/disputes/how-disputes-work`, 'How disputes work']])),

      block('The dispute timeline', 'From the first complaint to the final decision usually takes 2 to 3 months.',
        table(['Step', 'Timing'], [
          ['Customer can dispute', 'Typically within <strong>120 days</strong> of the payment. For a future event or service, the window usually starts on the event date'],
          ['You respond', 'Usually <strong>7 to 21 days</strong>, depending on the card network. Miss it and you lose the dispute'],
          ['The bank decides', 'Usually <strong>60 to 75 days</strong> after you respond'],
          ['Won', 'The bank returns the amount to Stripe, and Stripe passes it to you'],
          ['Lost', 'No money moves, because Stripe already paid the bank. The dispute fee is not returned'],
        ]) +
        callout('green', 'The outcome is final, with one exception', 'You and the customer cannot overturn a lost dispute, but a customer can still withdraw one, even after a loss.') +
        source([[`${D}/disputes/how-disputes-work`, 'How disputes work, "Dispute timing" and "After the decision"'], [`${D}/disputes/responding`, 'Respond to disputes']])),

      block('Enquiries and early fraud warnings', 'Two warnings that come <em>before</em> a formal dispute.',
        table(['', 'What it is', 'What to do'], [
          ['Enquiry (inquiry)', 'A pre-dispute request from the card issuer for information, often because the customer does not recognise the charge. Statuses: <code>warning_needs_response</code>, <code>warning_under_review</code>, <code>warning_closed</code> (after 120 days with no escalation)', 'Answer at once with evidence or a full refund and you avoid the dispute fee. An unanswered enquiry can escalate to a chargeback that is probably unwinnable'],
          ['Early fraud warning', 'A message from the card network that a payment might be fraud. About 40% of Visa and Mastercard warnings become fraud disputes if you do not refund', 'No response needed. Only a refund processed as a reversal (usually within 2 hours of capture) can prevent a fraud report. A later refund does not remove the warning'],
        ]) +
        source([[`${D}/disputes/how-disputes-work`, 'How disputes work, "Before the dispute"']])),

      block('Responding to a dispute', 'Decide whether to <strong>accept</strong> or <strong>counter</strong>. If you counter, you get <strong>one</strong> chance to submit: Stripe sends the evidence straight to the bank, and you cannot edit it or add files afterwards.',
        list([
          'Missing the deadline loses the dispute automatically',
          'One file per evidence type, so combine pages into one. Combined size limit 4.5 MB; Mastercard evidence limit 19 pages',
          'The bank reads only what you upload. Do not include audio, video, requests to phone or email, or links',
          'Keep a record of all messages with the customer, because they are good evidence',
          'After you submit, the status becomes <code>under_review</code>, then <code>won</code> or <code>lost</code>',
        ]) +
        callout('amber', 'A customer says they withdrew the dispute', 'Still respond. While a dispute is active, the only way to overturn it is to <strong>submit evidence</strong>. Submitting is what tells the issuer you do not accept the dispute and want the funds back.') +
        source([[`${D}/disputes/responding`, 'Respond to disputes'], [`${D}/disputes/how-disputes-work`, 'How disputes work, "Respond to a dispute"']])),

      block('Dispute fees', '',
        list([
          'When a dispute arrives, Stripe debits the disputed amount plus a <strong>dispute received</strong> fee. Outside Mexico that fee is <strong>not refundable</strong>, even if you win',
          'If you counter, a <strong>dispute countered</strong> fee applies as well, and it is returned if you win. It does not apply to businesses in Mexico and Japan',
          'In Mexico the received fee may be returned if you win or the cardholder withdraws',
          'Fees vary with your business location, so check the Stripe pricing page for the amount',
        ]) +
        source([[`${D}/disputes/how-disputes-work`, 'How disputes work, "Dispute fees"'], [`${D}/disputes/responding`, 'Respond to disputes']])),

      block('Testing disputes in a sandbox', 'Use a test dispute card, then submit special evidence to win or lose the simulated dispute.',
        table(['Card number', 'What happens'], [
          ['<code>4061 2199 4639 3810</code>', 'Fraudulent dispute, created shortly after the payment. The docs say to use it for most test cases'],
          ['<code>4000 0000 0000 0259</code>', 'Fraudulent dispute, created during the payment request'],
          ['<code>4000 0000 0000 1976</code>', 'The charge succeeds, then is disputed as an enquiry'],
          ['<code>4000 0000 0000 2685</code>', 'Disputed as product not received'],
          ['<code>4000 0000 0000 5423</code>', 'Receives an early fraud warning'],
        ]) +
        '<p class="line">To win or lose, submit the evidence value <code>winning_evidence</code> or <code>losing_evidence</code>. Use <code>escalate_inquiry_evidence</code> to escalate an enquiry.</p>' +
        source([[`${D}/testing`, 'Test your integration, "Disputes"']])),

      block('Pending and available balance', '<strong>Pending</strong> funds are payments that have not settled yet (the charge amount minus Stripe\'s fee). You cannot withdraw them. <strong>Available</strong> funds have settled and can be used for payouts, refunds and transfers. Money moves from pending to available after the <strong>settlement time</strong>.',
        table(['Where / method', 'Settlement time'], [
          ['United States', '2 business days (a Monday payment is available on Wednesday)'],
          ['Japan', 'First payout 7 calendar days; afterwards 4 business days'],
          ['Most of Europe', 'First payout 7 calendar days; afterwards 3 business days'],
          ['ACH debit; SEPA debit', '4 business days; 6 business days'],
        ]) +
        callout('amber', 'A balance can go negative', 'Refunds, fees and chargebacks can push a balance below zero. Stripe may also hold a <strong>reserve balance</strong> that cannot be paid out until the reserve period ends. A minimum balance setting protects automatic payouts.') +
        source([[`${D}/payments/balances`, 'Balances and settlement time']])),

      block('Payout statuses and failures', 'A payout is <code>pending</code> until Stripe submits it to the bank, then <code>in_transit</code>. It becomes <code>paid</code> if it succeeds, or <code>failed</code> or <code>canceled</code>, within 5 business days. <strong>Some failed payouts first show as <code>paid</code></strong> and later change to <code>failed</code>.',
        table(['<code>failure_code</code>', 'Meaning'], [
          ['<code>account_closed</code>', 'The bank account is closed'],
          ['<code>no_account</code>', 'The details on file are probably wrong: no account was found'],
          ['<code>invalid_account_number</code>', 'The routing number looks right but the account number is invalid'],
          ['<code>incorrect_account_holder_name</code>', 'The bank says the holder name on file is wrong'],
          ['<code>insufficient_funds</code>', 'Your Stripe account lacks the funds to cover the payout'],
          ['<code>debit_not_authorized</code>', 'Debits are not approved on the bank account. Stripe needs both credit and debit'],
          ['<code>invalid_currency</code>', 'The bank cannot accept payments in that currency'],
          ['<code>bank_account_restricted</code>', 'Limits on the type or number of payouts; often a savings account'],
          ['<code>declined</code>', 'The bank declined. Contact the bank before retrying'],
        ]) +
        list([
          '<code>arrival_date</code> is when the payout should reach the bank, and it already allows for weekends and bank holidays',
          '<code>trace_id</code> is a reference from the receiving bank, so the merchant can track the payout with the bank',
          'A failed payout returns the money to the balance (see <code>failure_balance_transaction</code>)',
        ]) +
        source([[`${D}/api/payouts/object`, 'API Reference: The Payout object']])),

      block('First payout and payout schedules', 'After the first live payment, Stripe typically schedules the first payout to complete within <strong>7 to 14 days</strong>, depending on industry, country and risk level. After that, payouts follow the merchant\'s schedule: manual, daily, or weekly or monthly.',
        list([
          'Japan: daily payouts are not available and the default schedule is <strong>manual</strong>',
          'Brazil and India: payouts are always automatic and daily',
          'The bank account currency must match the currency in the payout settings',
          'If the available balance is below the minimum payout (usually one base unit of the currency), it stays in the Stripe balance',
        ]) +
        source([[`${D}/payouts`, 'Receive payouts']])),

      block('Reconciling a payout', 'To match a payout with the payments inside it, check the payout\'s <code>reconciliation_status</code>.',
        table(['Value', 'Meaning'], [
          ['<code>completed</code>', 'List the balance transactions that were paid out in this payout with the Balance Transactions API (the <code>payout</code> filter)'],
          ['<code>in_progress</code>', 'Try again soon'],
          ['<code>not_applicable</code>', 'Stripe does not support listing for this payout. It is supported only for standard automatic payouts'],
        ]) +
        source([[`${D}/api/payouts/object`, 'API Reference: The Payout object, "reconciliation_status"']])),

      block('Subscription statuses', 'The status shows where billing stands.',
        table(['Status', 'Meaning'], [
          ['<code>incomplete</code>', 'Charged automatically, and the first payment failed. Becomes <code>active</code> once the first invoice is paid'],
          ['<code>incomplete_expired</code>', 'The first invoice stayed unpaid for 23 hours. A final state: the invoice is voided'],
          ['<code>trialing</code>', 'In a trial. Becomes <code>active</code> when it ends'],
          ['<code>active</code>', 'Billing normally'],
          ['<code>past_due</code>', 'A payment is needed but failed or awaits the customer. Stripe retries'],
          ['<code>canceled</code> or <code>unpaid</code>', 'After retries run out, depending on settings. With <code>unpaid</code>, invoices are still created but closed straight away. You may reopen and pay them once the customer updates payment details'],
          ['<code>paused</code>', 'No new billing period and no invoices until resumed. Different from "pausing collection", which keeps invoices and leaves the status unchanged'],
        ]) +
        source([[`${D}/api/subscriptions/object`, 'API Reference: The Subscription object, "status"']])),

      check([
        'A customer says the refund has not arrived. What do you tell them?',
        'What are the rules for refunds? What if a refund fails?',
        'What is the difference between a refund and a dispute?',
        'Walk through the dispute timeline. What is an enquiry?',
        'How do you respond to a dispute, and what are the traps? What if the customer says they withdrew it?',
        'Are dispute fees refunded?',
        'A merchant asks why they cannot withdraw money they were paid yesterday. Explain pending and available balance.',
        'Explain the payout statuses. Can a payout that says "paid" still fail?',
        'When does a new merchant get their first payout?',
        'Explain the subscription statuses.',
      ]),
    ],
  });

  /* ---------- Topic 6: playbooks and cheat sheets ---------- */
  Ops.advTopics.push({
    key: 'adv-playbooks', title: 'Playbooks and Cheat Sheets',
    lead: 'Three step-by-step investigations, then one-page summaries of statuses and numbers to read before an interview.',
    blocks: [
      block('Playbook: "I was charged twice"', 'First find out whether it is <strong>two real payments</strong> or one payment plus a hold or a failed attempt.',
        steps([
          'Get both payment IDs. Are they two PaymentIntents, or one PaymentIntent with several attempts? List the charges with the <code>payment_intent</code> parameter to see every attempt, including failed ones',
          'Check for a hold. An uncaptured payment or a blocked or failed attempt can show as a pending authorization, and some banks do not show the difference between an authorization and a settled payment. For a blocked payment, the issuer typically removes the authorization within a few days',
          'If both are real, read the request logs. A retry without an idempotency key creates a second PaymentIntent. A <code>duplicate_transaction</code> decline means an identical payment was just submitted',
          'If the customer really paid twice, refund the extra payment, which takes about 5 to 10 business days to show. Tell the developer to send an idempotency key on retries',
        ]) +
        source([[`${D}/payments/payment-intents/verifying-status`, 'Payment status updates'], [`${D}/declines`, 'Declines'], [`${D}/payments/place-a-hold-on-a-payment-method`, 'Place a hold on a payment method'], [`${D}/api/idempotent_requests`, 'API Reference: Idempotent requests'], [`${D}/refunds`, 'Refund and cancel payments']])),

      block('Playbook: "I paid, but the order says unpaid"', 'Suspect the <strong>webhook</strong>. The payment is probably fine; the merchant\'s system did not hear about it.',
        steps([
          'Find the PaymentIntent and confirm it is <code>succeeded</code>. The funds are in the account and the order can be fulfilled',
          'In Workbench, open the endpoint\'s <strong>Event deliveries</strong> and see whether the event was Delivered, Pending or Failed, and the HTTP status of each attempt',
          'Match the status to its cause: not public, a redirect, a 4xx, a 5xx, a TLS error or a timeout. Check that the signature check is not rejecting the event (raw body, secret for this endpoint and mode)',
          'Resend the event from the Dashboard (up to 15 days), or wait for the automatic retry (live mode: up to 3 days)',
          'Make sure the handler is safe to run twice, so the order is updated only once',
        ]) +
        source([[`${D}/webhooks`, 'Receive Stripe events in your webhook endpoint'], [`${D}/payments/payment-intents/verifying-status`, 'Payment status updates']])),

      block('Playbook: escalating a problem', 'Write something short that a stranger can act on: <strong>what you saw, the IDs, and what you already checked</strong>.',
        list([
          'The request ID (<code>req_...</code>), which Stripe asks for when you contact them about a specific request',
          'The object ID: <code>pi_</code>, <code>ch_</code>, <code>re_</code> or <code>evt_</code>',
          'Whether it is sandbox or live, and which account',
          'The time, with the time zone, and the endpoint and method',
          'The HTTP status and the error <code>code</code>',
          'What you already checked, the impact (how many customers), and what you need',
        ]) +
        callout('amber', 'Never include', 'A secret or restricted key, a full card number or a password. Keys do not belong in email or chat.') +
        source([[`${D}/api/request_ids`, 'API Reference: Request IDs'], [`${D}/error-low-level`, 'Advanced error handling'], [`${D}/keys`, 'API keys, "Protect your keys"']])),

      block('Statuses cheat sheet', 'Know the words each object uses.',
        table(['Object', 'Statuses', 'Source'], [
          ['PaymentIntent', '<code>requires_payment_method</code> &rarr; <code>requires_confirmation</code> &rarr; <code>requires_action</code> &rarr; <code>processing</code> &rarr; <code>requires_capture</code> &rarr; <code>succeeded</code>, or <code>canceled</code>. A failed attempt goes back to <code>requires_payment_method</code>', ref('/payments/paymentintents/lifecycle')],
          ['Dashboard payment status', 'Incomplete (the three <code>requires_</code> states except capture), Pending (<code>processing</code>), Uncaptured or Partial capture (<code>requires_capture</code>), Succeeded, Cancelled', ref('/payments/payment-intents/verifying-status')],
          ['Refund', '<code>pending</code>, <code>requires_action</code>, <code>succeeded</code>, <code>failed</code>, <code>canceled</code>', ref('/refunds')],
          ['Dispute', '<code>needs_response</code>, <code>under_review</code>, <code>won</code>, <code>lost</code>. Enquiries: <code>warning_needs_response</code>, <code>warning_under_review</code>, <code>warning_closed</code>', ref('/disputes/how-disputes-work')],
          ['Payout', '<code>pending</code> &rarr; <code>in_transit</code> &rarr; <code>paid</code>, or <code>failed</code> / <code>canceled</code>', ref('/api/payouts/object')],
          ['Subscription', '<code>incomplete</code>, <code>incomplete_expired</code>, <code>trialing</code>, <code>active</code>, <code>past_due</code>, <code>canceled</code>, <code>unpaid</code>, <code>paused</code>', ref('/api/subscriptions/object')],
        ])),

      block('Numbers worth memorising: webhooks', '',
        table(['Thing', 'The number', 'Source'], [
          ['Automatic retries, live', 'Up to 3 days, with exponential backoff', ref('/webhooks')],
          ['Automatic retries, sandbox', '3 times over a few hours', ref('/webhooks')],
          ['Resend an event', 'Dashboard: up to 15 days after creation. Stripe CLI: up to 30 days', ref('/webhooks')],
          ['Signature timestamp tolerance', 'Default 5 minutes in the libraries. Never use 0: it turns the check off', ref('/webhooks')],
          ['Roll a signing secret', 'The old secret can stay active for up to 24 hours', ref('/webhooks')],
          ['Registered endpoints', 'Up to 16 event destinations', ref('/webhooks')],
          ['Transport', 'HTTPS in live mode; TLS 1.2 or 1.3 only', ref('/webhooks')],
          ['Your reply', '2xx, quickly, before any slow work. A redirect (3xx) counts as a failure', ref('/webhooks')],
        ])),

      block('Numbers worth memorising: money movement', '',
        table(['Thing', 'The number', 'Source'], [
          ['Refund shows on the customer\'s side', 'About 5 to 10 business days, depending on the bank', ref('/refunds')],
          ['Card refund reference (ARN)', 'Up to 7 business days after the refund starts. None for a reversal', ref('/refunds')],
          ['A failed refund returns to your balance', 'Can take up to 30 days', ref('/refunds')],
          ['Card authorization hold', 'Usually 7 days online; 2 days in person on a terminal', ref('/payments/place-a-hold-on-a-payment-method')],
          ['Japanese accounts, JPY holds', 'Up to 30 days for Visa, Mastercard, JCB, Diners Club and Discover. Not American Express', ref('/payments/place-a-hold-on-a-payment-method')],
          ['Settlement, United States', 'Pending to available in 2 business days', ref('/payments/balances')],
          ['Settlement, Japan', 'First payout 7 calendar days; afterwards 4 business days', ref('/payments/balances')],
          ['ACH debit settlement', '4 business days', ref('/payments/balances')],
          ['First payout, new account', 'Typically 7 to 14 days after the first live payment', ref('/payouts')],
          ['A payout can still fail', 'Status can change to failed or canceled within 5 business days', ref('/api/payouts/object')],
        ])),

      block('Numbers worth memorising: disputes and subscriptions', '',
        table(['Thing', 'The number', 'Source'], [
          ['Customer can dispute', 'Typically within 120 days of the payment', ref('/disputes/how-disputes-work')],
          ['You must respond', 'Usually 7 to 21 days, depending on the card network. Miss it and you lose', ref('/disputes/responding')],
          ['The bank decides', 'Usually 60 to 75 days after you respond. Whole dispute: 2 to 3 months', ref('/disputes/how-disputes-work')],
          ['An unanswered enquiry', 'Closes after 120 days with no escalation (<code>warning_closed</code>)', ref('/disputes/how-disputes-work')],
          ['Early fraud warnings', 'About 40% of Visa and Mastercard warnings become fraud disputes', ref('/disputes/how-disputes-work')],
          ['Evidence', 'One submission only. 4.5 MB combined; Mastercard 19 pages; one file per evidence type', ref('/disputes/responding')],
          ['Subscription <code>incomplete</code>', 'Becomes <code>incomplete_expired</code> if the first invoice is unpaid after 23 hours', ref('/api/subscriptions/object')],
        ])),

      block('Habits that show you know the job', 'Each one comes from a rule in the docs.',
        list([
          'Fulfil an order from the <code>payment_intent.succeeded</code> webhook, not from the browser redirect. The customer can close the page first',
          'Do not explain a <code>fraudulent</code>, <code>lost_card</code>, <code>stolen_card</code> or <code>merchant_blacklist</code> decline. Show it like a <code>generic_decline</code>',
          'Do not promise a refund date. Banks take about 5 to 10 business days, and a refund can fail',
          'Ask for the request ID (<code>req_...</code>) when you escalate. Stripe asks for it too',
          'Put your own order ID in <code>metadata</code> when you create an object, so a webhook can be matched to your records',
          'Keep card details, bank numbers and personal data out of metadata, descriptions and idempotency keys',
          'Never share a secret or restricted key in email or chat. Keys belong in a secrets vault or environment variables',
          'After a timeout or a 500, check what happened before you retry with a new key',
        ]) +
        source([
          [`${D}/payments/payment-intents/verifying-status`, 'Payment status updates'], [`${D}/declines/codes`, 'Decline codes'], [`${D}/refunds`, 'Refunds'],
          [`${D}/api/request_ids`, 'Request IDs'], [`${D}/error-low-level`, 'Advanced error handling'], [`${D}/api/metadata`, 'Metadata'],
          [`${D}/api/idempotent_requests`, 'Idempotent requests'], [`${D}/keys`, 'API keys'],
        ])),

      block('Names that have changed: know both', 'Older tutorials and newer docs use different words for the same thing.',
        table(['Older word', 'Current docs wording', 'Source'], [
          ['Test mode', 'Sandbox. Its keys still start with <code>_test_</code>', ref('/keys')],
          ['Developers Dashboard', 'Workbench: request logs, the Webhooks tab (with Event deliveries) and the Inspector', ref('/webhooks')],
          ['Webhook endpoint', 'Event destination. A webhook endpoint is one kind of destination', ref('/webhooks')],
          ['One kind of event', 'Snapshot events (full object) and thin events (a notification you then fetch)', ref('/webhooks')],
          ['PaymentIntents for everything', 'Stripe recommends the Checkout Sessions API with the Payment Element for most integrations. PaymentIntents still track the payment underneath', ref('/payments/paymentintents/lifecycle')],
          ['Version names', 'Dated, with a release name, for example <code>2024-09-30.acacia</code>. Monthly releases have no breaking changes; a major release comes twice a year', ref('/api/versioning')],
        ])),

      check([
        'A customer says they were charged twice. How do you investigate?',
        'A customer paid, but the merchant\'s order still says unpaid. How do you investigate?',
        'You cannot solve a problem and need to escalate. What do you include, and what do you leave out?',
        'Which habits do you follow when you handle money-related tickets?',
        'What is the difference between "test mode" and "sandbox"?',
      ]),
    ],
  });
})();
