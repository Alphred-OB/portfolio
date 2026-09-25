Building software has never been faster. You can describe an app to an AI tool on Monday and click around a working version by Wednesday. The pages load, the buttons respond and it looks ready.

Then real people start using it, and things break in ways the demo never showed.

I have written a whole open source handbook about this, [Vibe 404](https://github.com/Alphred-OB/Vibe_404). This note is the short version, for developers building with AI and for business owners paying someone who does.

## The demo is not the product

In the handbook I follow a made up founder called Alex, who builds a subscription platform with AI in three days. Within the first week of launch:

- A customer on a slow connection clicked "Upgrade" twice and was **charged twice**. They disputed it with their bank, and Alex paid the refund plus a penalty fee.
- A customer asked for a refund three hours after buying. The site said "all sales are final", the customer went to their bank, and the payment provider **froze Alex's payouts** for review.
- A user asked for their account to be deleted. The AI written delete button **wiped their invoices and payment history** along with the account, and months later the accounts did not add up.

None of these problems showed up in testing, because testing was one person clicking carefully on a good connection.

## AI is a mirror, not an architect

This is the key idea. An AI tool builds exactly what you ask for, and it is very good at it. But it will almost never stop and ask:

- "What should happen if someone clicks this twice?"
- "Where is your refund policy?"
- "Do you really want to erase this customer's receipts?"
- "What if this page gets a thousand visitors at once?"

It did not leave those things out on purpose. It left them out because nobody asked, and nobody asked because they did not know to.

## What experience adds

The gap between a prototype and a system people can trust is mostly made of questions like these. It is the unglamorous work:

- **Payments** that are confirmed by the payment provider directly, not by whether the customer's browser made it back to your site, and that cannot be triggered twice.
- **Clear policies** for refunds, cancellations and privacy, so payment providers and app stores approve you and customers know where they stand.
- **Data that is never truly thrown away** by accident, with old records hidden instead of destroyed and backups that have actually been tested.
- **Security** checked on every page and every form, not just the login screen.
- **Plans for busy days**, so a sudden rush of visitors does not take everything down.

## If you are building with AI

Keep using it. Just treat its output as a very fast first draft from a junior developer. Ask it the uncomfortable questions yourself: what happens if this fails halfway, if this runs twice, if someone sends fake data, if this table has a million rows. Then make it fix what it missed.

## If you are hiring someone

Ask them what happens when a payment fails, when a customer asks to be deleted and when the site gets busy. A good developer will have clear, calm answers. If they only talk about how quickly it will look finished, be careful.

Looking finished and being ready are two different things. I care about the second one.
