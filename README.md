<p align="center">
  <a href="https://morehumaninternet.org">
    <img alt="More Human Internet" src="https://raw.githubusercontent.com/morehumaninternet/roar-extension/main/img/roar_128.png" width="180" />
  </a>
</p>
<h1 align="center">
  Roar! Web Extension
</h1>

Built with ❤️ by the team at <a href="https://morehumaninternet.org">More Human Internet</a>

### Setup

```bash
npm install
npm run build # Builds once, pointing to https://localhost:5004
npm run build:watch # Builds in watch mode, pointing to https://localhost:5004
ROAR_SERVER_URL=https://roar-server.herokuapp.com npm run build:watch # Pointing to https://roar-server.herokuapp.com
```

### Chrome

Visit [chrome://extensions](chrome://extensions). Turn on Developer Mode if it's not already on. Click "Load Unpacked Extension" and choose this folder.

### Firefox

```bash
npm install -g web-ext
web-ext run
```

### Testing

```bash
npm test
```

### Publishing the Staging Extension

Both stage and production point to https://roar-server.herokuapp.com. The same artifact is used by both chrome and firefox. Bear this in mind when adding a feature that might only work in chrome or only work in firefox. To create the artifacts, select an appropriate semantic version and run

```bash
npm run publish -- stage X.Y.Z # Creates artifacts/stage vX.Y.Z.zip
npm run publish -- production X.Y.Z # Creates artifacts/production vX.Y.Z.zip
```

### Project Overview

The [manifest.json](manifest.json) file declares the [popup](html/popup.html) and the [background page](html/background-page.html) which are largely just responsible for loading their corresponding scripts that are compiled & bundled from [src/popup/popup.tsx](src/popup/popup.tsx) and [src/background/background.tsx](src/background/background.tsx) respectively. All state management and interaction with the server takes place in the background script as the popup can be closed at any time. The popup is responsible solely for painting the user interface and sending callbacks that trigger changes to [the store](src/background/store.ts). Those changes are observed in the singleton [background subscription](src/background/subscribe.ts) which will then call functions of its own to do things like take screenshots, etc. Globally available type definitions are declared in [src/types](src/types).
