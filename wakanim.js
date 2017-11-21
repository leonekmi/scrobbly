/*
Get Metadata from an episode of Wakanim.tv with Anilist Scrobbler
(c) leonekmi 2017
*/

async function main() {
    var regex = /https:\/\/www.wakanim.tv\/fr\/v2\/catalogue\/episode\/([a-zA-Z0-9-]+)\/([a-zA-Z0-9-]+)/;

    var isLoggedIn = false;
    var ChromeProcessed = false;
    chrome.storage.local.get('access_token', function (items) {
        if (typeof items['access_token'] == 'undefined') {
            isLoggedIn = false;
            ChromeProcessed = true;
        } else {
            isLoggedIn = true;
            ChromeProcessed = true;
        }
        if (isLoggedIn == true) {
            if (regex.test(document.documentURI)) {
                var series_title = $('.episode_title').text();
                var episode_number = $('.episode_subtitle span span').text();
                function message() {
                    $( '.border-list' ).prepend('<li class="border-list_item"><span class="border-list_title">Anilist Scrobbler</span><span id="anilist_scrobbler_notice" class="border-list_text">'+ chrome.i18n.getMessage("starting") +'</span></li>');
                    return true;
                }
                initScrobble(series_title, episode_number, message);
            }
        }
    });
}

$( window ).on( "load", function() {
    chrome.storage.sync.get({
        ignore_wk: false
    }, function (items) {
        if (items.ignore_wk == false) {
            main();
        }
    });
});
