# KingCalc

A clean, fast, free calculator for Android. Calculator, currency converter, unit converter, percentage tools and a loan/EMI calculator, in one small app.

**Free for everyone. No ads. No tracking. No account. Open source.**

A [TeamExyKings](https://teamexykings.in) product, built by Yashwanth Ram Somireddy.

<!-- Add screenshots here once available:
<p>
  <img src="docs/screenshots/calculator-black.png" width="220" />
  <img src="docs/screenshots/currency-white.png" width="220" />
</p>
-->

## Features

- **Calculator:** live result preview, calculation history, `%` and `()` handling, `00` key, haptic feedback
- **Currency:** convert between about 160 currencies, favourites, works offline using the last saved rates
- **Units:** length, weight, temperature, area (including cent, guntha and ground), volume, speed, time and data
- **Percent:** X% of Y, X is what % of Y, and percentage change
- **Loan / EMI:** monthly EMI, total interest, total payable and an optional amortization table
- **Themes:** Black (pure AMOLED), White, or follow the system setting
- **Fonts:** Inter, Poppins, JetBrains Mono, Space Grotesk, Nunito
- **Number format:** Indian (1,00,000) or international (100,000) grouping
- **FAQ:** built-in how-to for every feature (Settings > FAQ)
- **Private by design:** everything stays on your device

## Install

- Google Play Store: _link will be added after release_
- APK builds: see [Releases](../../releases)

## Tech stack

- React Native + Expo (SDK 57) with Expo Router
- TypeScript
- A small built-in expression parser for safe evaluation (no `eval`, no heavy math library)
- AsyncStorage for local history, settings and cached rates
- EAS Build for release builds

There is no backend, database, login, payment system or analytics.

## Getting started

Requirements: Node.js 20+, npm, and the Expo Go app on your phone.

```bash
git clone https://github.com/yashwanthramsomireddy/KingCalc.git
cd KingCalc
npm install
npx expo start
```

Scan the QR code with Expo Go (Android) or the Camera app (iOS). The app runs fully in Expo Go, so no custom dev client is needed. If your phone cannot reach your computer on the same Wi-Fi, run `npx expo start --tunnel` instead.

Useful scripts: `npm run typecheck` checks the TypeScript.

The repo includes an `.npmrc` with `legacy-peer-deps=true`, so a plain `npm install` works. Some Expo SDK 57 packages declare optional peer dependencies (such as `react-dom` and `react-native-worklets`) that npm would otherwise resolve to versions that do not match the SDK.

### Release build

```bash
npm install -g eas-cli
eas login
eas init                                      # first time only, links the project to your Expo account
eas build -p android --profile preview        # installable .apk for testing
eas build -p android --profile production     # .aab for the Play Store
```

The Android package name is `in.teamexykings.kingcalc` (change it in `app.json` if you fork).

## Project structure

```
app/                 Expo Router screens: calculator, currency, units, percent, loan, settings, faq, about
src/calc/            Expression parser and keypad input rules
src/components/      Drawer, screen wrapper, picker, shared UI
src/unitsData.ts     Unit tables and conversion
src/currency.ts      Rates fetching, caching, currency names
src/faqData.ts       Questions and answers for the in-app FAQ
src/theme.ts         Black and White theme tokens
src/fonts.ts         The five bundled fonts
src/settings.tsx     Saved settings (theme, font, number format, haptics)
assets/              Icon, adaptive icon, splash
```

## Currency rates

Exchange rates come from the free open-access endpoint of [ExchangeRate-API](https://www.exchangerate-api.com) (`open.er-api.com`, no API key). It updates once a day and requires attribution, which the app shows on the Currency and About screens. Rates are cached on the device, refreshed at most once an hour, and work offline with a "last updated" time. Rates are for information only and are not suitable for financial transactions.

## Contributing

Issues and pull requests are welcome.

1. Fork the repo and create a branch
2. Keep changes focused and follow the existing code style
3. Test in Expo Go on a real device
4. Open a pull request describing what changed and why

Please do not add ads, analytics, trackers or paid features. They go against the goals of this project.

## Privacy

KingCalc collects no personal data. See [PRIVACY.md](PRIVACY.md).

## License

Code is released under the [MIT License](LICENSE).

The KingCalc name, icon and TeamExyKings branding are not covered by the MIT License. If you fork or redistribute this app, please use your own name and icon.

Third-party libraries and fonts keep their own licenses (Inter, Poppins, JetBrains Mono, Space Grotesk and Nunito are under the SIL Open Font License).

## Credits

Built by **Yashwanth Ram Somireddy** at **TeamExyKings**. Website: https://teamexykings.in
