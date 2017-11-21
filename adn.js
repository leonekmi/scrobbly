/*
Get Metadata from an episode of animedigitalnetwork.fr with Anilist Scrobbler
(c) leonekmi 2017
*/

async function main() {
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
            var regex = /http:\/\/animedigitalnetwork.fr\/video\/([a-zA-Z0-9-]+)\/([a-zA-Z0-9-]+)/;
            if (regex.test(document.documentURI)) {
                var series_title = $('.adn-big-title h1 a').text().replace('Nouvelle Saison', '');
                var episode_number = $('.current .adn-playlist-block a').attr('title').replace('Épisode ', '');
                function message() {
                    $( '.adn-big-title h1 span' ).append('<span id="anilist_scrobbler_notice">Anilist Scrobbler : '+ chrome.i18n.getMessage("starting") +'</span></li>');
                    return true;
                }
                initScrobble(series_title, episode_number, message);
            }
        }
    });
}

$( window ).on( "load", function() {
    chrome.storage.sync.get({
        ignore_adn: false
    }, function (items) {
        if (items.ignore_adn == false) {
            main();
        }
    });
});
