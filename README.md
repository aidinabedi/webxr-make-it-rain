Simple WebXR example that shows how PlayCanvas can be integrated with AR.


Build instructions:
- Run: `npm install`
- Run: `npm run build`
- Copy the following files to an **HTTPS** server:
  - `files`
  - `__game-scripts.js`
  - `802005.json`
  - `ammo.dcab07b.js`
  - `bundle.js`
  - `config.json`
  - `index.html`
  - `logo.png`
  - `styles.css`


Run-time requirements:
- Most up-to-date available version of Android that the device manufacturer provides
- Must be listed as a [ARCore supported device](https://developers.google.com/ar/discover/supported-devices)
- Installed latest [Google Play Services for AR](https://play.google.com/store/apps/details?id=com.google.ar.core)
- Installed latest [Chrome Canary](https://play.google.com/store/apps/details?id=com.chrome.canary)
- These flags ([`chrome://flags`](chrome://flags)) in [Chrome Canary](https://play.google.com/store/apps/details?id=com.chrome.canary) must be enabled:
  - `WebXR Device API`
  - `WebXR AR Module`
  - `WebXR Hit Test`
- The WebXR example must be hosted using **HTTPS**
