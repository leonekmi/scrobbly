/*
Get Metadata from an episode of hulu.com with Anilist Scrobbler
(c) leonekmi 2017-2018
*/

function message() {
    $('h1.video-titles').append('<span id="anilist_scrobbler_notice" style="font-family: Flama; font-size: 15px;">Anilist Scrobbler : ' + chrome.i18n.getMessage('starting') + '</span>');
    return true;
}

function main() {
    var regex = /https:\/\/www.hulu.com\/watch\/([0-9]+)/;

    var isLoggedIn = false;
    chrome.storage.local.get('access_token', function(items) {
        if (typeof items['access_token'] == 'undefined') {
            isLoggedIn = false;
        } else {
            isLoggedIn = true;
        }
        if (isLoggedIn == true) {
            if (regex.test(document.documentURI)) {
                var title = $('title').text();
                var regex1 = /Watch\s*(.*?)\s*Season/g;
                var regex2 = /Episode\s*(.*?)\s*\| Hulu/g;
                var series_title = regex1.exec(title)[1];
                var episode_number = regex2.exec(title)[1];
                initScrobble(series_title, episode_number, message);
            }
        }
    });
}

$(window).on('load', function() {
    chrome.storage.sync.get({
        ignore_hulu: false
    }, function(items) {
        if (items.ignore_hulu == false) {
            main();
            $('title').bind('DOMSubtreeModified', function() {
                $('h1.video-titles #anilist').remove();
                main();
            });
        }
    });
});
