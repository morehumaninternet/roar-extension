<p align="center">
  <a href="https://morehumaninternet.org">
    <img alt="More Human Internet" src="https://raw.githubusercontent.com/morehumaninternet/roar-extension/main/img/roar_128.png" width="180" />
  </a>
</p>
<h1 align="center">
  Roar! Web Extension
</h1>

Built with ❤️ by the team at <a href="https://morehumaninternet.org">More Human Internet</a>. See also [Roar! Server]()

### Install

```bash
npm install
```

### Build

Run the build once

```bash
npm run build

# 🛠 Building a local version of Roar! that points to https://roar.morehumaninternet.org
# [scss] ...
# [bundle:popup] ...
# [bundle:background] ...
# 🎉 Build successful!
```

Run the build in watch mode

```bash
npm run build:watch

# 🛠 Building a local version of Roar! in watch mode that points to https://roar.morehumaninternet.org
# [scss] ...
# [bundle:popup] ...
# [bundle:background] ...
# 🎉 First build successful! Continuing to watch files...
```

Run the build in watch mode against a local server

```bash
npm run build:watch -- --local-server

# 🛠 Building a local version of Roar! in watch mode that points to https://localhost:5004
# [scss] ...
# [bundle:popup] ...
# [bundle:background] ...
# 🎉 First build successful! Continuing to watch files...
```

### Chrome

Visit [chrome://extensions](chrome://extensions). Turn on Developer Mode if it's not already on. Click "Load Unpacked Extension" and choose this folder.

### Firefox

```bash
npm install -g web-ext
web-ext run
```

### Testing

To run tests and view coverage report:

```bash
npm test
```

#### Developing Tests 

In general, integration tests are favored. As Roar! is a browser extension, the test setup needs to mimic that environment. This includes mocking the browser (tabs, windows, active tab,
etc.), mounting/starting the extension background window, and mounting the extension popup.
This environment needs to be established before the ```describe``` block.

The basic skeleton for an integration test is:
```
  const mocks = createMocks() // create mocks

  // background opts include whether user is already authenticated. If needed,
  // specific windows and tabs can be configured for the tests
  runBackground(mocks, opts) 

  // mount the popup. Options include whether user needs authentication and the state 
  // of the webpage twitter handle for the tests
  mountPopup(mocks, options)

  // specific tests start here
  describe('test topic', () => { ... })
```

### Publishing the Staging Extension

Both stage and production point to https://roar.morehumaninternet.org. The same artifact is used by both chrome and firefox. Bear this in mind when adding a feature that might only work in chrome or only work in firefox. To create the artifacts, select an appropriate semantic version and run

```bash
npm run publish -- stage X.Y.Z # Creates artifacts/stage vX.Y.Z.zip
npm run publish -- production X.Y.Z # Creates artifacts/production vX.Y.Z.zip
```

### Project Overview

The [manifest.json](manifest.json) file declares the [popup](html/popup.html) and the [background page](html/background-page.html) which are largely just responsible for loading their corresponding scripts that are compiled & bundled from [src/popup/index.tsx](src/popup/index.tsx) and [src/background/index.ts](src/background/index.ts) respectively. All state management and interaction with the server takes place in the background script as the popup can be closed at any time. The popup is responsible solely for painting the user interface and sending callbacks that trigger changes to [the store](src/background/store.ts). Those changes are observed in the singleton [background subscription](src/background/subscribe.ts) which will then call functions of its own to do things like take screenshots, etc. Globally available type definitions are declared in [src/types](src/types).
