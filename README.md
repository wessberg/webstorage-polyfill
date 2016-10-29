## Tiny WebStorage polyfill for all browsers

This tiny polyfill makes [localStorage](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage) and [sessionStorage](https://developer.mozilla.org/en-US/docs/Web/API/Window/sessionStorage) work in *all* browsers (also in Incognito mode!)

There are several polyfills that already attempts to solve this problem. This one is different:
- It is much smaller than similar existing solutions.
- It doesn't fallback to cookies, userData or any flash-based solution.
- It also works in Safari's incognito mode, but localStorage becomes sessionStorage which is what you (and more importantly the user) probably want in Incognito mode anyway.

If you simply load the polyfill, it will use the native implementation whenever possible.
If you want to load the polyfill based on a detection for support, please be aware that
you should include the polyfill for all Safari or iOS Safari users, even though WebStorage is
supported. An impressive number of popular websites doesn't handle this scenario (even [Wikipedia](https://en.wikipedia.org)).

### Dependencies
- It requires `Object.defineProperty` and `Object.getOwnPropertyNames` to be present in the browsers JavaScript engine. They are easily polyfilled.

### Install
Install with
```javascript
npm install webstorage-poly
```

### Usage
Load it in your code with an import statement:
```javascript
import "webstorage-polyfill";
```
Or from a script tag:
```html
<script src="../node_modules/webstorage-polyfill/polyfill.min.js"></script>
```

The polyfill will be applied automatically if necessary.
It works outside a global context too.
