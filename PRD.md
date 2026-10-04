# ApnaPay Android Demo — Project PRD

This document describes **the application that lives in this repository**, not the commercial ApnaPay product vision. It is the contract for the interview demo: what is built, how it is layered, which rails are mocked, and what a reviewer should judge.

| Field | Value |
| --- | --- |
| Product | ApnaPay wallet (JazzCash / Easypaisa-style) |
| Audience | Interviewer evaluating a ~6–7 year mobile engineer |
| Platform | Android only (`com.apnapay`) |
| Runtime | React Native `0.87.1`, React `19`, TypeScript |
| Nature | Walkable product demo with mocked payment rails |
| Source of truth | This repo’s `src/` tree |

---

## 1. Purpose

Ship a **complete Android wallet you can tap through**, with production-shaped code:

- Feature screens that look and feel like a Pakistani wallet.
- Domain rules that do not live in React components.
- Service adapters a backend team could replace without rewriting UI.
- Honest demo seams (OTP, NADRA, IBFT, 1LINK, card acquiring, camera) instead of fake “live” integrations.

Success is not “all PRD integrations are live.” Success is: an interviewer can run the app, complete money-in / money-out flows, and open the code and see senior layering.

---

## 2. Goals and non-goals

### Goals

1. Onboard with Pakistani mobile + OTP, then a 4-digit MPIN, then optional fingerprint.
2. Hold a PKR wallet, show a ledger, and produce receipts.
3. Send money (wallet, IBFT, CNIC pickup), receive via QR, pay bills, buy load, add cash.
4. Enforce unverified vs verified send limits, insufficient funds, and MPIN lockout in domain code.
5. Lock the session on idle / background, and bind one active device.
6. Keep Android as the only supported client. The `ios/` folder may exist from RN scaffolding; it is not a product surface.

### Non-goals

- Live SMS, NADRA, 1LINK, IBFT, card processor, or agent cash-in APIs.
- Real camera QR scanning.
- Face ID / iOS product work.
- Backend, KYC vendor, or PCI-DSS card vault.
- Multi-user cloud accounts. State is local to the device.

---

## 3. Stack

| Layer | Choice | Why |
| --- | --- | --- |
| UI | React Native + TypeScript | Matches the candidate’s primary stack |
| Navigation | React Navigation 7 (native stack + tabs) | Typed routes, Android-native transitions |
| State | Zustand (`useSessionStore`, `useWalletStore`) | Thin stores; no business math in components |
| Persistence | AsyncStorage behind `secureStorage` / `appStorage` | Swap-ready seams |
| Money | Integer paisa in `src/domain/money.ts` | No float drift on fees and balances |
| Tests | Jest on domain + utils | Rules are testable without rendering screens |

Path alias: `@/` → `src/`.

---

## 4. Architecture

```
App.tsx
  ErrorBoundary
    RootNavigator          Auth | Unlock | App (gated by session)
      AuthNavigator        Welcome → Phone → OTP → MPIN → fingerprint
      AppNavigator         SessionGuard + tabs + payment stack
        features/*         Screens only: collect input, navigate, show errors
        store/*            Orchestrate adapters; unwrap ApiResult
        services/api       Mock HTTP: latency, coded errors, mockDb
        domain/*           Pure rules: money, debit, MPIN policy, Result
        services/storage   Keyed persistence
        shared/*           UI kit
```

**Dependency rule:** `features` may import `store`, `shared`, `utils`, `domain`, and typed navigation. `domain` must not import React, stores, or navigation. `services/api` is the only place that talks to `mockDb`.

Production swap: replace `src/services/api` and the bodies of `secureStorage` / `biometricService`. Screens and stores stay.

---

## 5. Session state machine

`RootNavigator` chooses one root from persisted flags:

| Condition | Root |
| --- | --- |
| `hydrated === false` | Splash |
| no user, or no MPIN, or onboarding incomplete | `Auth` |
| user + MPIN + onboarding, `unlocked === false` | `Unlock` |
| otherwise | `App` |

Transitions:

1. **Phone** → request OTP → **OTP**.
2. OTP success → bind this `deviceId` as the active device.
3. New user or missing MPIN → **Create MPIN** → **Biometric opt-in** → `completeOnboarding()` unlocks into App.
4. Returning user → Unlock with MPIN (or fingerprint if opted in).
5. `SessionGuard`: any `AppState !== 'active'` locks; 3 minutes idle locks; 30 seconds before timeout shows “Stay signed in” (must call `touch()`).
6. Another device takeover (`simulateOtherDevice`) sets `remoteLock`; this phone must re-enter MPIN to reclaim.

---

## 6. Implemented product surfaces

### 6.1 Auth

| Screen | Behaviour |
| --- | --- |
| Welcome | Positions the demo; does not skip OTP |
| Phone | `03XXXXXXXXX` only (`normalizeMobile` / `isValidMobile`) |
| OTP | 6 digits, demo code `123456`, 30s resend, in-flight request cancelled on resend |
| Create MPIN | 4 digits, confirm match, stored as salted hash |
| Biometric opt-in | Android fingerprint copy; enable writes `SECURE_KEYS.biometricEnabled` |
| Unlock | MPIN + optional fingerprint prompt; remote-lock banner |

MPIN policy (`src/domain/mpinPolicy.ts`): 5 failures → 20s lock; attempts while locked are rejected even if the PIN matches.

### 6.2 Home and account

- Greeting, hideable PKR balance, KYC chip, four actions (Send, Add cash, Bills, Load).
- Recent activity → transaction detail.
- Account: KYC/limits, fingerprint toggle, lock, device id, simulate other device, reset demo.

### 6.3 Send

Three methods on one screen, then a shared confirm + MPIN sheet + receipt.

| Method | Input | Fee | Extra rules |
| --- | --- | --- | --- |
| Wallet | PK mobile | `0` | Lookup contact; cannot send to self |
| IBFT | Bank + PK IBAN (`PK` + 2 digits + 4 letters + 16 digits) | `10` | Default demo IBAN `PK12MUCB0000001234567890` |
| CNIC | 13-digit CNIC + name | `25` | Cash-pickup framing |

Amount must pass `parseAmount` (finite, `> 0`, at most two decimals).

### 6.4 Receive / QR

- Payload: `apnapay://pay?m=<mobile>&n=<name>&a=<optional amount>`.
- Optional request amount on “My QR”.
- Scan tab is **mocked**: “Simulate QR scan” presets Send to Ayesha Malik / `03219876543` / `750`.

### 6.5 Bills

Categories: saved, electricity, gas, water, internet, landline. Fetch requires a biller + consumer id (≥ 8 chars). Pay uses the shared payment stack. Save persists a nickname + consumer id.

Seeded saved bill: LESCO `14123456789012`.

### 6.6 Mobile load

Jazz / Telenor / Zong / Ufone.

- Prepaid: amount chips.
- Postpaid: fetch derived due (`1200 + last-4 % 1800`).
- Bundles: catalog prices from `mockDb`.

### 6.7 Add cash (credits — skip debit limits)

- Card: 16-digit PAN, MM/YY expiry, 3-digit CVV. PAN/CVV never leave the screen; receipt stores `last4` + `expiry` only. Test PAN `4242424242424242`.
- Agent: Al Makkah Telecom locations; amount still validated.

### 6.8 KYC

Simulated CNIC scan fills name `Sikander Khan` and CNIC `3520212345671`. Submit upgrades `tier` to `verified` and raises limits. No NADRA network call.

### 6.9 Ledger

History is a `FlatList` with pull-to-refresh (mock latency). Detail + receipt show reference, fee, type, timestamp.

---

## 7. Domain rules (must not be duplicated in UI)

### 7.1 Money

All arithmetic goes through paisa (`toPaisa` / `fromPaisa`). `addMoney` / `subtractMoney` / `compareMoney` are the only permitted wallet math.

### 7.2 Limits (`src/config/demo.ts` + `authorizeDraft`)

| Tier | Per transaction | Monthly outflow |
| --- | --- | --- |
| Unverified (`kycStatus: none`) | Rs 10,000 | Rs 25,000 |
| Verified | Rs 50,000 | Rs 200,000 |

`authorizeDraft`:

- Incoming types `add_card`, `add_agent`, `request` → amount `> 0` only.
- All other types → `evaluateDebit` (funds, per-tx, monthly). Monthly uses **amount + fee**.

Quote and confirm both call `authorize` so a stale draft cannot bypass limits.

### 7.3 Fees

| Type | Fee (PKR) |
| --- | --- |
| wallet, load, add_card, add_agent | 0 |
| bill | 5 |
| ibft | 10 |
| cnic | 25 |

Confirm screen shows amount, fee, and `addMoney(amount, fee)` as total debit.

---

## 8. Service contract

Adapters return `ApiResult<T>`:

```ts
{ ok: true, data: T } | { ok: false, error: { code: string; message: string } }
```

Stores call `unwrap()`. UI never switches on `{ ok }` except at the edge that already has a result (bill fetch, wallet lookup). Failures become `Error` with `name = code` and are shown via `toErrorMessage`.

### Error codes the demo actually emits

| Code | When |
| --- | --- |
| `INVALID_MOBILE` | Bad Pakistani number |
| `INVALID_OTP` / `OTP_EXPIRED` | Wrong or consumed OTP |
| `INVALID_CNIC` / `INVALID_NAME` | KYC submit |
| `SELF_TRANSFER` | Send to own wallet |
| `UNKNOWN_BILLER` / `INVALID_CONSUMER` | Bill fetch |
| `UNAUTHENTICATED` | Payment with no user |
| `INVALID_AMOUNT` | Amount ≤ 0 |
| `INSUFFICIENT_FUNDS` | Debit > balance |
| `LIMIT_TX` / `LIMIT_MONTHLY` | Tier caps |
| `MPIN_LOCKED` / `INVALID_MPIN` | PIN policy |
| `UNEXPECTED` | Thrown exception inside `withLatency` |

`withLatency` always `mockDb.init()`s, then waits 420–860 ms.

---

## 9. Persistence

| Store | Keys | Contents |
| --- | --- | --- |
| `secureStorage` (`apnapay.secure.*`) | `mpinHash`, `biometricEnabled`, `onboardingComplete` | Secrets / flags. Demo = AsyncStorage. Production = Keystore / EncryptedSharedPreferences |
| `appStorage` (`apnapay.app.*`) | `deviceId`, `db` | Device bind + wallet snapshot |

MPIN hash: FNV-1a of `deviceId:pin` (`hashSecret`). Demo-only; not a KDF.

Reset demo: wipes `mockDb`, MPIN, biometric flag, onboarding flag.

---

## 10. Navigation map

**Auth stack:** `Welcome` → `Phone` → `Otp` → `CreateMpin` → `BiometricOptIn`

**Tabs:** `HomeTab` · `HistoryTab` · `QrTab` · `AccountTab`

**App stack (over tabs):** `SendMoney` · `ConfirmPayment` · `Receipt` · `Bills` · `MobileLoad` · `AddCash` · `Kyc` · `TransactionDetail`

Shared payment path for every debit/credit:

`feature screen → PaymentDraft → ConfirmPayment → verifyMpin or fingerprint → paymentApi.quote + confirm → Receipt`

---

## 11. Demo data (first launch)

| Item | Value |
| --- | --- |
| Default phone | `03001234567` |
| OTP | `123456` |
| Opening balance | Rs 48,250.75 |
| Seeded monthly outflow | Rs 15,135 |
| Wallet contacts | Ayesha Malik `03219876543`, Ahmed Raza `03331234567` |
| Seeded ledger | inbound Ayesha, Jazz load, LESCO bill, outbound Ahmed, card cash-in, MCB IBFT |

After first OTP, the user record is created as `Sikander Khan`, `unverified`, until KYC.

---

## 12. UI kit and quality bar

Required of this codebase (not optional polish):

- `ErrorBoundary` at the app root.
- Screen-level errors through `ErrorText`; field errors through `TextField`.
- Buttons: `accessibilityRole`, disabled/busy state, Android ripple.
- Lists: `TransactionRow` memoized; History refreshable.
- Typed navigation — no `as never` on Home actions.
- Feature-sliced folders; no god-file API mixed into screens.

Commands a reviewer can run:

```sh
npx tsc --noEmit
npm test -- --watchAll=false
npm run lint
npm run android
```

---

## 13. Security model (honest)

| Concern | This demo | Production swap |
| --- | --- | --- |
| OTP | Constant `123456` | SMS / WhatsApp gateway |
| MPIN | Salted FNV hash in AsyncStorage | Server-side verify + hardware-backed storage |
| Fingerprint | `BiometricPrompt`-shaped UI; `biometricService.isAvailable()` always true | `androidx.biometric.BiometricPrompt` native module |
| Card data | Local state only; last-4 on receipt | PCI tokenizer; never touch PAN |
| Device bind | `activeDeviceId` in mockDb | Auth session + device certificate |
| Transport | In-process functions | TLS to ApnaPay API |

Do not present this build as PCI-compliant or as a live wallet.

---

## 14. Out of scope in this repo

- iOS product behaviour (Face ID, CocoaPods workflow, iOS keyboard avoiding).
- Push notifications, SMS auto-read.
- Real maps / agent locator GPS.
- Split bills, scheduled payments, card issuing, savings pots.
- Backend OpenAPI, env-based API hosts, auth tokens.

Those belong in a later production PRD, not in this demo.

---

## 15. Acceptance (this project)

A build is acceptable when all of the following are true:

1. Fresh install: phone → OTP `123456` → MPIN → Home with seeded balance.
2. Wallet send to `03219876543` debiting balance and writing a receipt.
3. Unverified send above Rs 10,000 is rejected with `LIMIT_TX` before MPIN success is enough to post.
4. KYC scan + verify raises the cap; the same amount then posts.
5. IBFT rejects a non-PK IBAN; card add-cash rejects bad expiry.
6. Backgrounding or 3 minutes idle returns Unlock.
7. “Simulate login on another device” remote-locks; MPIN reclaims.
8. Reset demo returns to Auth with empty wallet flags.
9. Domain tests for money, debit, MPIN, IBAN, amounts, and `unwrap` pass.

If a flow needs a live NADRA or 1LINK call to “work,” it is out of contract for this repository.
