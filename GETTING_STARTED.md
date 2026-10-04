# Getting started

Install and run the **ApnaPay** Android demo. What the app is, and how it is built: [README.md](./README.md).

This interview build is **Android-only**. Do not use `npm run ios` or CocoaPods.

---

## Prerequisites

- Node `>= 22.11.0` (see `package.json` `engines`)
- npm
- JDK 17 (React Native Android toolchain)
- Android Studio with Android SDK
- An emulator or a USB-debuggable device
- `ANDROID_HOME` or `android/local.properties` with `sdk.dir`

Example `android/local.properties` (do not commit your machine path as a universal default):

```
sdk.dir=/Users/<you>/Library/Android/sdk
```

---

## Install

```sh
cd apnaPay
npm install
```

---

## Run

Terminal 1 — Metro:

```sh
npm start
```

Terminal 2 — install and launch on a booted emulator or device:

```sh
npm run android
```

Package id: `com.apnapay`. Display name: ApnaPay.

If the emulator shows a white screen, Metro is not reachable (`ws://10.0.2.2:8081`). Keep `npm start` running, or reload from the Metro terminal.

After changing `metro.config.js`, restart the bundler with a clean cache:

```sh
npm start -- --reset-cache
```

---

## Demo credentials

| Step | Value |
| --- | --- |
| Mobile | Any valid `03XXXXXXXXX` (field is pre-filled with `03001234567`) |
| OTP | `123456` |
| MPIN | You choose a 4-digit PIN on first launch |
| Wallet receivers | Ayesha Malik `03219876543` · Ahmed Raza `03331234567` |
| Test Visa | `4242 4242 4242 4242`, expiry `12/28`, CVV `123` |
| Demo IBAN | `PK12MUCB0000001234567890` |

Reset from **Account → Reset demo data**.

Session auto-locks after **3 minutes** idle (30s “Stay signed in” warning). Backgrounding the app also locks. **Account → Simulate login on another device** remote-locks this phone until MPIN is entered again.

---

## Checks (optional)

From `apnaPay/`:

```sh
npx tsc --noEmit
npm test -- --watchAll=false
npm run lint
```

If `npx tsc` resolves the wrong package, use `./node_modules/.bin/tsc --noEmit`.

Walkthrough acceptance is in [PRD.md](./PRD.md) §15.
