var url = new URL(document.location.href);
var c = url.searchParams.get("code");
if (c !== null) {
    $.getJSON("https://leonekmi.twittolabel.fr/anilist_backend/requestToken.php?code=" + c, function(data) {
        chrome.storage.local.set({
            'access_token': data.code
        }, function() {
            console.log('Token saved in Chrome local Storage');
        });
        window.alert(chrome.i18n.getMessage('connected'));
    });
}
