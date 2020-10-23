# roar-extension
Web Extension for ROAR! (Public Feedback Project)

### Setup

```bash
npm install
npm run build # Builds once
npm run build:watch # Builds in watch mode
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

The same artifact is used by both chrome and firefox. Bear this in mind when adding a feature that might only work in chrome or only work in firefox. To create the artifacts, select an appropriate semantic version and run

```bash
npm run publish -- stage X.Y.Z      # Creates artifacts/stage vX.Y.Z.zip
```

### Project Overview

The [manifest.json](manifest.json) file declares the [popup](html/popup.html) and the [background page](html/background-page.html) which are largely just responsible for loading their corresponding scripts that are compiled & bundled from [src/popup/popup.tsx](src/popup/popup.tsx) and [src/background/background.tsx](src/background/background.tsx) respectively. All state management and interaction with the server takes place in the background script as the popup can be closed at any time. The popup is responsible solely for painting the user interface and sending callbacks that trigger changes to [the store](src/background/store.ts). Those changes are observed in the singleton [background subscription](src/background/subscribe.ts) which will then call functions of its own to do things like take screenshots, etc. Globally available type definitions are declared in [src/types](src/types).