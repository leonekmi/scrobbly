// Update Checker
// This updater is discontinued, it will be deleted in 1.10
/*var version = "1.9.4\n";
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
});*/
chrome.runtime.onInstalled.addListener(function(details){
    if(details.reason == "install"){
        console.log("This is a first install!");
        var options = {
            type: "basic",
            iconUrl: "https://leonekmi.twittolabel.fr/anilist-scrobble/login.png",
            title: "Anilist Scrobbler",
            message: chrome.i18n.getMessage('welcome')
        }
        chrome.notifications.create('welcome', options);
    }else if(details.reason == "update"){
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
