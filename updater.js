// Update Checker
var version = "1.9.1\n";
$.get( {url: "https://leonekmi.twittolabel.fr/anilist-scrobble/version.txt", cache: false} , function (data) {
    console.log("Version " + data);
    if (version != data) {
        console.log("Update available");
        var options = {
            type: "basic",
            iconUrl: "https://leonekmi.twittolabel.fr/anilist-scrobble/update.png",
            title: "Anilist Scrobbler",
            message: chrome.i18n.getMessage('update')
        }
        chrome.notifications.create('update', options);
        chrome.notifications.onClicked.addListener(function (notifId) {
            chrome.tabs.create({ url: "https://leonekmi.twittolabel.fr/anilist-scrobble/update.html" });
            chrome.notifications.clear(notifId);
        });
    } else {
        console.log("No update available");
    }
});
