Here is a request every app eventually gets: "Please delete my account."

It sounds simple. Most AI tools, and plenty of developers, will write the obvious thing: find the customer and erase them. And that one line of code can quietly destroy a business's records.

## Why erasing is dangerous

In most databases, a customer is connected to everything they have ever done: orders, invoices, payments, bookings, messages. Erase the customer and, depending on how the database is set up, all of that can go with them. Or the records stay behind pointing at a customer who no longer exists, and pages start breaking in strange ways.

Months later the accountant asks why there are payments in the bank with no matching receipts, and nobody has an answer.

## The trash can rule

Think about how your computer handles deleted files. They go to the trash first. They disappear from your folders, but they are not gone.

Good software does the same thing. When an account is deleted, it is marked as deleted with a date, and hidden everywhere in the app. The customer sees it as gone. Your sales history is still intact. And if they change their mind next week, it can be restored. Developers call this a soft delete.

## But what about privacy?

This is where many people get stuck. Privacy laws, and simple respect for your customers, say you should remove their personal information when they ask. Tax rules say you must keep sales records for years.

Both can be true at once. Think of a paper receipt. If a customer asks you to forget them, you do not burn the receipt. You take a black marker and cross out their name and phone number, and keep the receipt for the tax office.

In software, that means:

1. Mark the account as deleted and sign them out everywhere.
2. Replace their name, email, phone number and address with anonymous placeholders.
3. Keep the orders, invoice numbers and amounts exactly as they were.

The person is gone from your system. Your books still balance.

## A small trap to watch for

If someone deletes their account and later tries to sign up again with the same email, a badly set up system says "this email is already taken" because the old hidden record is still there. The fix is to only require emails to be unique among active accounts. It is a one line change, but only if someone thinks of it before launch.

## Backups: untested means you do not have one

Every hosting company shows a reassuring "daily backups" label. But backups fail more often than people think: the disk fills up, a password changes, a file gets corrupted. You usually find out on the worst day of your year.

I follow a simple rule for every system I look after:

- **Three copies** of the data.
- On **two different kinds** of storage.
- With **one copy somewhere else entirely**, with a different provider, so a single outage or locked account cannot take everything.

And once a month, restore the latest backup onto a test database and check the numbers look right. It takes ten minutes. It is the difference between a scary afternoon and losing a business.

## The takeaway

Deleting should be a careful, deliberate process, not a single line of code. Hide instead of destroy. Remove the person, keep the records. Test your backups before you need them.

The database chapter of [Vibe 404](https://github.com/Alphred-OB/Vibe_404), my open source handbook, goes into the technical details for developers, including the exact patterns and a pre launch checklist.
