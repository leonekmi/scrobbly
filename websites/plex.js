/*
Get Metadata from an episode on Plex.tv
(c) tnessy 2018
*/

function message() {
    if(!$('#anilist_scrobbler_notice').length) {
        $("div[class*='AudioVideoPlayerControlsMetadata-titlesContainer']").append('<span id="anilist_scrobbler_notice" style="font-family: Open Sans Semibold,Helvetica Neue,Helvetica,Arial,sans-serif; font-size: 13px;">Anilist Scrobbler : ' + chrome.i18n.getMessage('starting') + '</span>');
    }
    return true;
}

function main() {
    var regex = /https?:\/\/app.plex.tv\/desktop/;

    if (regex.test(document.documentURI)) {
        var title = $('title').text();
        var series_episode_regex = /([\w\s]+)\s-\s.*E([\d]+)/;
        var match = series_episode_regex.exec(title);
        if (match) {
            var series_title = match[1];
            var episode_number = match[2];
            initScrobble(series_title, episode_number, message);
        }
    }
}

$(window).on('load', function () {
    chrome.storage.sync.get({
        ignore_plex: false
    }, function (items) {
        console.log(items);
        if (items.ignore_plex === false) {
            main();
        }
    });
});
