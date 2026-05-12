# E2E Tests

End-to-end tests for FurniCycle using [Playwright](https://playwright.dev/).

## What is tested

| File                     | Coverage                                                                       |
| ------------------------ | ------------------------------------------------------------------------------ |
| `tests/auth.test.js`     | Login session persists, profile page accessible, logout redirects to dashboard |
| `tests/listings.test.js` | Dashboard shows listing cards, create a listing, view listing detail           |
| `tests/profile.test.js`  | Update full name, posted items tab, requested items tab                        |
| `tests/requests.test.js` | User2 requests a listing created by User1, User1 can see incoming requests     |

## Prerequisites

Both servers must be running before executing the tests:

```bash
# Terminal 1 — backend
cd backend
uvicorn main:app --reload

# Terminal 2 — frontend
cd frontend
npm start
```

## Setup

```bash
cd backend/e2e
npm install
```

Create a `.env` file in `backend/e2e/` with two dedicated test accounts:

```
TEST_USER_EMAIL=yuchungchian+test@umass.edu
TEST_USER_PASSWORD=00000000
TEST_USER2_EMAIL=yuchungchian+test2@umass.edu
TEST_USER2_PASSWORD=00000000
```

> These accounts must already exist in the Supabase project. The tests use them
> to simulate the owner/requester interaction without touching real user data.

## Running the tests

```bash
# Run all tests (headless)
npm test

# Run with visible browser (useful for debugging)
npm run test:headed

# Open Playwright UI mode
npm run test:ui
```

## Notes

- `auth.json` and `auth2.json` are generated automatically on each run by the
  global setup step — do not commit them.
- The requests test creates a real listing in the database. It is titled
  `"E2E Request Test Item - Please Ignore"` and can be safely deleted from
  Supabase after each run.
