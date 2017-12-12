chrome.runtime.onInstalled.addListener(function(details) {
    if (details.reason == "install") {
        console.log("This is a first install!");
        var options = {
            type: "basic",
            iconUrl: "https://leonekmi.twittolabel.fr/anilist-scrobble/login.png",
            title: "Anilist Scrobbler",
            message: chrome.i18n.getMessage('welcome')
        }
        chrome.notifications.create('welcome', options);
    } else if (details.reason == "update") {
        var thisVersion = chrome.runtime.getManifest().version;
        console.log("Updated from " + details.previousVersion + " to " + thisVersion + "!");
        var options = {
            type: "basic",
            iconUrl: "https://leonekmi.twittolabel.fr/anilist-scrobble/update.png",
            title: "Anilist Scrobbler",
            message: chrome.i18n.getMessage('updated', thisVersion)
        }
        chrome.notifications.create('update', options);
    }
});
