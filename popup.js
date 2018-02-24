/*
Popup page script
(c) leonekmi 2017-2018
*/
chrome.storage.sync.get({
    enable_altauth: false,
    access_token: null,
    altauth_clientid: null
}, function(items) {
    if (items.enable_altauth == true & items.access_token === null) {
        $('p').prepend('<a target="_blank" href="https://anilist.co/api/v2/oauth/authorize?client_id=' + items.altauth_clientid + '&redirect_uri=https%3A%2F%2Fleonekmi.twittolabel.fr%2Fanilist-scrobble-altcallback%2Fcallback.html&response_type=code"><button class="ui labeled icon blue button"><i class="external square icon"></i><div classs="lab-anilist">" + chrome.i18n.getMessage("popup_login_altauth") + "</div></button></a><br/><br/>');
    }
});
chrome.storage.local.get('access_token', function(items) {
    if (typeof items.access_token == 'string') {
        $('.lab-anilist').text(chrome.i18n.getMessage('popup_logged_in'));
        $('.external.square.icon').attr('class', 'info circle icon');
        $('.ui.labeled.icon.blue.button').attr('class', 'ui labeled icon blue basic button');
    }
});

function localizeHtmlPage() {
    //Localize by replacing __MSG_***__ meta tags
    var objects = document.getElementsByTagName('html');
    for (var j = 0; j < objects.length; j++) {
        var obj = objects[j];

        var valStrH = obj.innerHTML.toString();
        var valNewH = valStrH.replace(/__MSG_(\w+)__/g, function(match, v1) {
            return v1 ? chrome.i18n.getMessage(v1) : '';
        });

        if (valNewH != valStrH) {
            obj.innerHTML = valNewH;
        }
    }
}

localizeHtmlPage();
