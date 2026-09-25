If your website or app takes money, payments are where small mistakes turn into real losses. Not just lost sales, but chargebacks, penalty fees and frozen accounts. Here are the problems I see most often and how I handle them, in plain language. Most of this comes from the payments chapter of [Vibe 404](https://github.com/Alphred-OB/Vibe_404), my open source handbook.

## Problem one: the customer paid, but the app never noticed

The most common setup is simple. The customer pays on the payment page, gets sent back to your site, and your site sees them arrive and unlocks what they bought.

The trouble is that people close the tab as soon as they see the green tick. Phones lose signal. Browsers refresh. If they never arrive back on your site, your app never finds out they paid. Their money is gone and their account still says Free. That is a fast route to angry messages and bank disputes.

**What I do:** the payment provider (Paystack, Stripe, Flutterwave and others all support this) sends a direct message to your server when a payment succeeds. That message, not the customer's browser, is what unlocks the purchase. It arrives even if the customer has already put their phone away.

## Problem two: charged twice

A slow connection, an impatient tap, and the customer has paid twice.

**What I do:** the button locks and shows that it is working the moment it is tapped. Behind the scenes each checkout gets a unique reference, so even if the same request arrives twice, only one payment is created and only one order is fulfilled.

## Problem three: someone changes the price

If the price comes from the customer's browser, anyone who knows how to open the developer tools can change it. It is one of the first things an attacker will try.

**What I do:** the browser only says what the customer wants to buy. The price always comes from the server's own list. And the server checks that the amount the provider confirms matches what it expected.

## Problem four: the same confirmation, counted three times

Payment providers resend their confirmation message if your server does not answer quickly, which is good. But if your system is not ready for that, the same payment can be counted two or three times.

**What I do:** every confirmation is checked to make sure it genuinely came from the provider, and every payment reference can only ever be processed once.

## Problem five: money that does not add up

Computers are surprisingly bad at decimals. Add 0.1 and 0.2 in most programming languages and you do not get exactly 0.3. Over thousands of transactions those tiny errors turn into real reconciliation headaches.

**What I do:** money is stored in whole units, like pesewas or cents, never as decimals. And every movement of money is written to a record that is never edited or deleted, so you can always trace exactly what happened and when.

## The part that is not code

Payment providers want to see clear terms, a refund and cancellation policy and a way to contact you. "All sales are final" is not a policy, and it is one of the fastest ways to get your payouts held. Write a fair refund window, put it where customers will see it, and follow it.

## The checklist

Before any system of mine takes real money, I make sure:

- Payments are confirmed by the provider directly.
- Double taps and repeated messages cannot cause double charges.
- Prices come from the server.
- Money is stored in whole units with a permanent record.
- Customers see clear states: processing, paid, or failed with a way to try again.
- Refund and cancellation terms are written and easy to find.

None of it is visible when it works. That is the point.
