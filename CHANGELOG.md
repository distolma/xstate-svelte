# Change Log

This project adheres to [Semantic Versioning](http://semver.org/).

## 1.0.1

- Published JavaScript files no longer include inlined TypeScript helpers such as `__assign`. Instead, helpers are now imported from the [`tslib`](https://github.com/microsoft/tslib) module dependency. This reduces code size by allowing multiple components to share the same helpers, and eliminates _"this has been rewritten to undefined"_ errors from Rollup. ([#36](https://github.com/distolma/xstate-svelte/issues/36))

## 1.0.0

- Drop Node.js v8 support ([fd0e09][https://github.com/distolma/xstate-svelte/commit/fd0e09edc23aeece84174a74b07e398494f1e4bd])

## 0.1.1

- Fix CI ([ee72d7][https://github.com/distolma/xstate-svelte/commit/ee72d710f21cf5b131600ac07b361383fd8b5e07])
- Provide documentation ([cf3800][https://github.com/distolma/xstate-svelte/commit/cf3800318f9eb4f23d0f1062bb3800b96d5ec38a])

## 0.1.0

- Initial release.
