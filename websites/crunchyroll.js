/*
Get Metadata from an episode of Crunchyroll with Anilist Scrobbler
(c) leonekmi 2017-2018
*/

function message() {
    $('#template_body').prepend('<div class="message-container cf"><div class="message-list"><div id="anilist_scrobbler_notice" class="message-item clearfix message-type-warning">Anilist Scrobbler : ' + chrome.i18n.getMessage('starting') + '</div></div></div>');
    return true;
}

function main() {
    var regex = /http:\/\/www.crunchyroll.com\/([a-zA-Z0-9-]+)\/([a-zA-Z0-9-]+)/;
    var regex2 = /\((Season|Saison) ([0-9])\)/;
    var regex3 = /(Season|Saison) ([0-9])/;

    chrome.storage.local.get('access_token', function(items) {
        if (typeof items['access_token'] == 'undefined') {
            message();
            $('#anilist_scrobbler_notice').text(chrome.i18n.getMessage('appName') + ' : ' + chrome.i18n.getMessage('please_login'));
        } else {
            if (regex.test(document.documentURI)) {
                var episodeId = null;
                episodeId = retrieveWindowVariables(['DYNAMIC.MEDIA_ID']);
                episodeId = episodeId['DYNAMIC.MEDIA_ID'];
                if (episodeId == null) {
                    // Fallback by documentURI (firefox)
                    var uri = document.documentURI;
                    episodeId = uri.substr(uri.length - 6);
                }
                $.get('http://www.crunchyroll.com/xml?req=RpcApiVideoPlayer_GetMediaMetadata&media_id=' + episodeId, function(data) {
                    var series_title = data.getElementsByTagName('series_title')[0].innerHTML;
                    series_title = series_title.replace(regex2, '');
                    series_title = series_title.replace(regex3, '');
                    var episode_number = data.getElementsByTagName('episode_number')[0].innerHTML;

                    initScrobble(series_title, episode_number, message);
                }, 'xml');
            }
        }
    });
}

$(window).on('load', function() {
    chrome.storage.sync.get({
        ignore_cr: false
    }, function(items) {
        if (items.ignore_cr == false) {
            main();
        }
    });
});
