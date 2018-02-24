/*
Authentication script
(c) leonekmi 2017-2018
*/
var url = new URL(document.location.href);
var c = url.searchParams.get('code');
if (c !== null) {
    $.getJSON('https://leonekmi.twittolabel.fr/anilist_backend/requestToken.php?code=' + c, function(data) {
        chrome.storage.local.set({
            'access_token': data.code
        }, function() {
            window.alert(chrome.i18n.getMessage('connected'));
        });
    });
}
