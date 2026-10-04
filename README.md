# ApnaPay

Android wallet demo for **ApnaPay / AMT Technologies** — a JazzCash / Easypaisa-style app you can tap through in an interview, with code structured like a 6–7 year mobile engineer’s client.

It is a **product demo, not a live payment system**. SMS OTP, NADRA, 1LINK, IBFT, and card acquiring sit behind the same adapter layer a production app would call. There is no server in this repo.

**Platform:** Android only (`com.apnapay`). The `ios/` folder may exist from React Native scaffolding; it is not a product surface.

To install and run the app, use **[GETTING_STARTED.md](./GETTING_STARTED.md)**.

---

## What you can walk through

| Area | In this build |
| --- | --- |
| Auth | Pakistani mobile + OTP, 4-digit MPIN, Android fingerprint opt-in, lockout after 5 failures |
| KYC | Simulated CNIC scan; NADRA-shaped upgrade that raises send limits |
| Send | Wallet-to-wallet, IBFT (PK IBAN), CNIC cash pickup |
| Receive | QR payload `apnapay://pay?…`; camera scan is simulated |
| Bills | Electricity / gas / water / internet / landline fetch, pay, save consumer IDs |
| Load | Jazz, Telenor, Zong, Ufone — prepaid, postpaid, bundles |
| Wallet | Balance, ledger, e-receipts, add cash (test card / Al Makkah agent) |
| Session | Idle lock, background lock, one active device |

---

## Stack

React Native `0.87` · React `19` · TypeScript · React Navigation 7 · Zustand · AsyncStorage (behind storage ports) · Jest.

Money is integer paisa. Debit limits and MPIN policy live in `src/domain`, not in screens. Two stores only: session and wallet.

---

## Layout

```
src/
  domain/             money, debit rules, MPIN policy, Result
  app/navigation/     typed Auth / Unlock / App trees
  features/           screens by product area
  services/api/       mock adapters + mockDb
  services/storage/   secure vs app ports (Keystore-shaped)
  store/              Zustand session + wallet
  shared/             UI kit, PIN pad, biometric prompt, session guard
```

Production swap: replace `src/services/api` and the bodies of `secureStorage` / `biometricService`. Screens stay.

---

## Documents

| File | What it is |
| --- | --- |
| [GETTING_STARTED.md](./GETTING_STARTED.md) | Prerequisites, install, run, demo credentials |
| [PRD.md](./PRD.md) | Product contract for *this* repo (mocked rails, acceptance) |
| [ARCHITECTURE.md](./ARCHITECTURE.md) | Layers, data models, persistence, sequences |
| [architecture-essentials.md](./architecture-essentials.md) | Critical decisions only |
| [AGENTS.md](./AGENTS.md) | How to change the code |

---

## For reviewers

- Wallet math is paisa-accurate (`src/domain/money.ts`). Insufficient funds and KYC caps are in `src/domain/paymentRules.ts`.
- MPIN is a salted hash. The demo storage adapter is AsyncStorage; the port is EncryptedSharedPreferences / Keystore.
- Fingerprint is an Android `BiometricPrompt`-shaped UI so emulators without enrolled biometrics still demo the seam.
- Card PAN/CVV never leave Add cash; receipts keep last-4 only.
- No real SMS, NADRA, 1LINK, or bank calls.
