# Architecture essentials

Quick reference for this client. Full design, models, and sequences: [`ARCHITECTURE.md`](./ARCHITECTURE.md). Product contract: [`PRD.md`](./PRD.md).

---

## What this is

Android-only RN wallet. **No server.** Screens → adapters → `mockDb` + domain rules. Swap `src/services/api` (and storage/biometric ports) for production.

**Boundary:** `com.apnapay`, API 24+. `ios/` is unused.

---

## Stack (locked)

RN `0.87` · React `19` · TypeScript · Navigation 7 · Zustand · AsyncStorage · SVG/QR.

Not in this repo: Redux, React Query, Axios, SQLite, native biometric SDK.

---

## Layers

```
features / shared     UI only
store                 session + wallet
services/api          adapters + mockDb
services/storage      secure.* vs app.* ports
domain                money, debit, MPIN, Result   ← no React, no I/O
```

```
features → store | shared | domain | utils
store    → services | domain
services → domain | config
domain   → types | config
```

If a rule needs a hook or AsyncStorage, it is in the wrong layer.

---

## Decisions that must not drift

| Decision | Rule |
| --- | --- |
| Mock adapters, not fake buttons | Money always `quote` → `confirm` |
| Two Zustand stores | `useSessionStore` + `useWalletStore`. No god store |
| `ApiResult<T>` | Adapters return `{ ok, data \| error }`. Stores `unwrap()` |
| Paisa integers | Only `addMoney` / `subtractMoney` / `compareMoney` mutate wallet |
| Authorize twice | `authorizeDraft` on quote **and** confirm |
| Credits skip debit caps | `add_card`, `add_agent`, `request` |
| Android-only | No Face ID / iOS product paths |
| Catalog in code | Banks, billers, bundles, agents are constants |

---

## Navigation

Root is **one** of: `Auth` | `Unlock` | `App` (not an overlay).

```
Splash → Auth (no user/mpin/onboarding)
       → Unlock (session, locked)
       → App (unlocked)
App    → Unlock on lock / idle 3 min / background / remoteLock
```

Every payment:

`feature → PaymentDraft → ConfirmPayment → MPIN/fingerprint → quote → confirm → Receipt`

Types: `src/app/navigation/types.ts`. No `as never`.

---

## Models (minimum)

| Entity | Notes |
| --- | --- |
| `User` | `tier` unverified \| verified |
| `Wallet` | `balance`, `monthlyOutflow`, `PKR` |
| `Transaction` | immutable ledger; `meta` string map |
| `PaymentDraft` | untrusted intent; re-authorized at confirm |
| `SavedBill` | unique `(billerId, consumerId)` |
| `ApiResult<T>` | coded errors, not thrown-only APIs |

Source: `src/types/index.ts`. DB blob: `DbState` in `mockDb`.

---

## Persistence

| Port | Keys | Disk |
| --- | --- | --- |
| `secureStorage` | `mpinHash`, biometric, onboarding | `apnapay.secure.*` |
| `appStorage` | `deviceId`, `db` | `apnapay.app.*` |

MPIN = salted hash, never plaintext. OTP + PAN/CVV **not** on disk. `unlocked` is process-only (cold start always locked).

---

## Money & session

- Debit total = `amount + fee`. That total hits balance **and** monthly outflow.
- Limits live in `src/config/demo.ts`, not screens.
- MPIN: 5 fails → 20s lock (`evaluateMpinAttempt`).
- One `activeDeviceId`. Mismatch → `remoteLock`.
- Idle warning must call `touch()`.

---

## Errors

`ApiResult` → `unwrap` / `asError` → `toErrorMessage` + `ErrorText`. Render: `ErrorBoundary`. Do not swallow in adapters.

---

## Production seams

Replace bodies only: `services/api`, `secureStorage` → Keystore, `biometricService` → `BiometricPrompt`, delete `mockDb`.
