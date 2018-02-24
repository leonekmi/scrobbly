/*
Updater script
(c) leonekmi 2017-2018
*/
chrome.runtime.onInstalled.addListener(function(details) {
    if (details.reason == 'install') {
        var options = {
            type: 'basic',
            iconUrl: 'https://leonekmi.twittolabel.fr/anilist-scrobble/login.png',
            title: 'Anilist Scrobbler',
            message: chrome.i18n.getMessage('welcome')
        };
        chrome.notifications.create('welcome', options);
    } else if (details.reason == 'update') {
        var thisVersion = chrome.runtime.getManifest().version;
        var options = {
            type: 'basic',
            iconUrl: 'https://leonekmi.twittolabel.fr/anilist-scrobble/update.png',
            title: 'Anilist Scrobbler',
            message: chrome.i18n.getMessage('updated', thisVersion)
        };
        chrome.notifications.create('update', options);
    }
});
