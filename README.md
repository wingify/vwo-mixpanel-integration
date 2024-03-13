# VWO Mixpanel Integration plugin

This plugin allows to send VWO data to Mixpanel using `mixpanel-browser`.

## Package Installation

For NodeJs/JavasScript SDK

```bash
# via npm
npm install vwo-mixpanel-integration

# via yarn
yarn add vwo-mixpanel-integration
```

## Usage

This plugin works with Mixpanel's `mixpanel-browser` libraries.

Initialize VWOMixpanelPlugin with your mixpanel Instance:

**In your App.js file**
```js
import mixpanel from 'mixpanel-browser';
import VWOMixpanelPlugin from 'vwo-mixpanel-integration';
mixpanel.init(API_KEY, {
    // optional configuration options
});

VWOMixpanelPlugin(mixpanel); 
```
For more details around `mixpanel-browser` plugin, refer to this [document](https://www.npmjs.com/package/mixpanel-browser)

Ensure that the code is rendered and executed exclusively on the client side, as this plugin is designed for client-side functionality only.

## Code of Conduct

[Code of Conduct](https://github.com/wingify/vwo-mixpanel-integration/blob/master/CODE_OF_CONDUCT.md)

## License

[Apache License, Version 2.0](https://github.com/wingify/vwo-mixpanel-integration/blob/master/LICENSE)

Copyright 2024 Wingify Software Pvt. Ltd.