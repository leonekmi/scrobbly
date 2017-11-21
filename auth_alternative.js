chrome.storage.sync.get({
    enable_altauth: false,
    altauth_clientid: "",
    altauth_clientsecret: "",
}, function(items) {
    if (items.enable_altauth == true) {
        var url = new URL(document.location.href);
        var c = url.searchParams.get("code");
        if (c !== null) {
            var jsonreq = {
                'grant_type': 'authorization_code',
                'client_id': items.altauth_clientid,
                'client_secret': items.altauth_clientsecret,
                'redirect_uri': "https://leonekmi.twittolabel.fr/anilist-scrobble-altcallback/callback.html",
                'code': c,
            };
            $.ajax("https://anilist.co/api/v2/oauth/token", {method: "POST", data: JSON.stringify(jsonreq), dataType: "json", headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }, success: function(data) {
                chrome.storage.local.set({'access_token': data.access_token}, function() {
                    console.log('Token saved in Chrome local Storage');
                });
                window.alert(chrome.i18n.getMessage('connected'));
            }});
        }
    } else {
        window.alert(chrome.i18n.getMessage('altauth_not_configured'));
    }
});
