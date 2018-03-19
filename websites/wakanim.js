/*
Get Metadata from an episode of Wakanim.tv with Anilist Scrobbler
(c) leonekmi 2017-2018
*/

function message() {
    $('.border-list').prepend('<li class="border-list_item"><span class="border-list_title">Anilist Scrobbler</span><span id="anilist_scrobbler_notice" class="border-list_text">' + chrome.i18n.getMessage('starting') + '</span></li>');
    return true;
}

function main() {
    var regex = /https:\/\/www.wakanim.tv\/fr\/v2\/catalogue\/episode\/([a-zA-Z0-9-]+)\/([a-zA-Z0-9-]+)/;

    if (regex.test(document.documentURI)) {
        var series_title = $('.episode_title').text();
        var episode_number = $('.episode_subtitle span span').text();
        initScrobble(series_title, episode_number, message);
    }
}

$(window).on('load', function() {
    chrome.storage.sync.get({
        ignore_wk: false
    }, function(items) {
        if (items.ignore_wk == false) {
            main();
        }
    });
});
