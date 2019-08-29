try {
    window.$ = window.jQuery = require('jquery');

    require('fomantic-ui-css');
} catch (e) {
    console.error('Cannot load Fomantic UI, CSS is broken!');
}