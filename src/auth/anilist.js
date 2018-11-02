var $ = require('jquery');
var browser = require('webextension-polyfill');
var token = $('token').text();
console.log(token);
browser.runtime.sendMessage({action:'auth', service:'anilist', response:JSON.parse(token)}).then(result => {
    if (!result) {
        console.warn(result);
        alert('ow...');
    } else {
        $('body').append(browser.i18n.getMessage('youCanClose'));
    }
});
