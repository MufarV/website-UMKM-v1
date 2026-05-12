# Firebase Security Specification - Wirausaha Muda Hub

## 1. Data Invariants
- **Transactions**: Must have `amount` (number > 0), `type` (income/expense), and `date`.
- **Inventory**: `stock` must be a non-negative number. `name` must be a non-empty string.
- **Assets**: `status` must be one of ['active', 'maintenance', 'retired'].
- **Ownership**: All documents must be owned by the creator. Users can only access their own documents.

## 2. The Dirty Dozen Payloads (Identity, Integrity, State)

1. **Identity Spoofing**: Attempt to create a transaction with a `userId` field belonging to another user.
2. **Resource Poisoning**: Use a 2KB string for a `transactionId` or `itemId`.
3. **Type Poisoning**: Sending `amount` as a string `"1000"` instead of a number.
4. **Range Violation**: Setting `stock` to `-50`.
5. **Enum Bypass**: Setting asset `status` to `"broken_beyond_repair"`.
6. **Shadow Update**: Adding a field `isAdmin: true` to a user profile or transaction.
7. **Orphaned Write**: Creating a transaction without a timestamp.
8. **PII Leak**: Attempting to read a transaction that doesn't belong to the authenticated user.
9. **Query Scraping**: Attempting to list all transactions in the root collection without a filter.
10. **Timestamp Manipulation**: Providing a client-side `date` that is in the future instead of using `request.time`.
11. **Bulk Deletion**: Attempting to delete a collection without being the owner of each individual document.
12. **Locked State Mutation**: Attempting to update a "retired" asset's location.

## 3. Security Rules Implementation Strategy
- Use `isValidId()` for all path variables.
- Use `isValid[Entity]()` helpers for all writes.
- Enforce `request.auth.uid` matches the `ownerId` field in the document.
- Use `request.time` for all timestamp validations.
