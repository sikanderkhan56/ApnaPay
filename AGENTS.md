# AGENTS.md

Instructions for coding agents (and humans using them) working in **this ApnaPay demo**. Follow this file before changing code.

| Doc | Use when |
| --- | --- |
| [`architecture-essentials.md`](./architecture-essentials.md) | Need the constraints in 30 seconds |
| [`ARCHITECTURE.md`](./ARCHITECTURE.md) | Need models, sequences, persistence |
| [`PRD.md`](./PRD.md) | Need product behaviour, mocked rails, acceptance |

Do not invent a live backend, iOS product surface, or new state library.

---

## Mission

Keep a walkable **Android wallet demo** that looks production-shaped: dumb UI, pure `domain`, swappable `services/api`. OTP / NADRA / 1LINK / IBFT / cards stay mocked behind those adapters.

**Out of scope unless the user explicitly asks:** live APIs, iOS/Pods/Face ID, Redux/React Query/Axios, rewriting screens to bypass `quote`/`confirm`.

---

## Commands

Run from `apnaPay/`:

```sh
npx tsc --noEmit
npm test -- --watchAll=false
npm run lint
npm start                 # Metro
npm run android           # device / emulator
```

Typecheck with `./node_modules/.bin/tsc --noEmit` if `npx tsc` picks the wrong package. Android SDK: `android/local.properties` (`sdk.dir`). Do not commit machine-specific SDK paths as “the” path.

---

## Where new code goes

| Change | Put it here |
| --- | --- |
| Screen / flow | `src/features/<area>/` |
| Shared widget | `src/shared/components/` |
| Navigation params | `src/app/navigation/types.ts` then the navigator |
| Session / wallet orchestration | `src/store/` — do not add a third store |
| HTTP-shaped API | `src/services/api/index.ts` |
| Persistence keys | `src/services/storage/keys.ts` |
| Money, limits, MPIN, Result | `src/domain/` + a Jest test beside it |
| Fees, limits, timeouts, demo OTP | `src/config/demo.ts` |
| Types | `src/types/index.ts` |

Path alias: `@/` → `src/` (Babel **and** `tsconfig` — keep both in sync).

---

## Hard rules

1. **`domain` stays pure.** No React, Zustand, Navigation, AsyncStorage.
2. **Screens do not do wallet math.** Use `parseAmount`, then a `PaymentDraft`. Limits run in `authorizeDraft`.
3. **Every debit/credit** goes `quote` → `confirm`. Do not write `mockDb.applyDebit` from a screen.
4. **Adapters return `ApiResult<T>`.** Stores `unwrap()`. UI uses `toErrorMessage` + `ErrorText` (field errors on `TextField`).
5. **Money:** only `addMoney` / `subtractMoney` / `compareMoney`. Debit total is `amount + fee` (balance **and** monthly outflow).
6. **Credits** (`add_card`, `add_agent`, `request`) skip debit caps.
7. **No `as never` on navigate.** Extend param lists instead.
8. **Android only.** `KeyboardAvoidingView` behaviour is `height`. Fingerprint, not Face ID. Do not add `ios` npm scripts or reinstall Pods.
9. **Secrets:** MPIN hashed via `hashSecret`; PAN/CVV never persist; OTP lives in the in-memory map only.
10. **Storage keys** are `SECURE_KEYS` / `APP_KEYS`, not raw strings.

---

## Patterns to copy

- New payment rail: feature screen → `PaymentDraft` → existing `ConfirmPayment` / `MpinSheet` / `Receipt`.
- New coded failure: `fail('CODE', 'human message')` in the adapter; add a domain test if it is a rule.
- New screen error: `ErrorText`, not a one-off red `Text` style.
- Session time: `touch()` / `lock()` on the session store. Idle UI must call `touch()` on “Stay signed in”.
- Catalog data: constants in `mockDb`, exposed through `catalogApi`.

---

## Do not

- Call NADRA, SMS, 1LINK, or a bank URL “to make it real.”
- Store MPIN, OTP, or PAN in `db`.
- Bypass MPIN for a payment because it is a demo (except the existing biometric opt-in path).
- Put business rules in `useEffect`.
- Snapshot-test every screen.
- Delete `ios/` (folder may remain; it is not a product surface).
- Expand the PRD with savings pots, card issuing, or push unless asked.

---

## Done means

- `tsc --noEmit`, `npm test`, `npm run lint` are green when the change can break types or rules.
- Domain rule change has a test in `src/domain/__tests__` or `src/utils/__tests__`.
- Manual path still matches `PRD.md` §15 if you touched auth, pay, KYC, or session.
- Docs: update `architecture-essentials.md` only if a **decision** changed; update `ARCHITECTURE.md` if models/flows changed; update `PRD.md` if user-visible behaviour changed.

Default: change code, not docs. Touch docs when the contract actually moved.
