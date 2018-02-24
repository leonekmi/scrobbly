/*
Get Metadata from an episode of netflix.com with Anilist Scrobbler (beta)
(c) leonekmi 2017
*/

function main() {
    var regex = /https:\/\/www.netflix.com\/watch\/([a-zA-Z0-9-]+)/;

    var isLoggedIn = false;
    chrome.storage.local.get('access_token', function(items) {
        if (typeof items['access_token'] == 'undefined') {
            isLoggedIn = false;
        } else {
            isLoggedIn = true;
        }
        if (isLoggedIn == true) {
            if (regex.test(document.documentURI)) {
                var series_title = $('.player-status-main-title').text();
                var episode_number = $('.player-status:nth-child(2)').text().split(" ").splice(-1);

                function message() {
                    $('.player-status').append('<span id="anilist_scrobbler_notice">Anilist Scrobbler : ' + chrome.i18n.getMessage("starting") + '</span>');
                    return true;
                }
                initScrobble(series_title, episode_number, message);
            }
        }
    });
}

jQuery.fn.exists = function() {
    return this.length > 0;
}
var numb = 0;

function checkDOMChange2() {
    if ($('.player-status').exists()) {
        chrome.storage.sync.get({
            ignore_nf: false
        }, function(items) {
            if (items.ignore_nf == false) {
                main();
            }
        });
    } else {
        setTimeout(checkDOMChange2, 100);
    }
}

function checkDOMChange() {
    if ($('.player-status').exists()) {
        chrome.storage.sync.get({
            ignore_nf: false
        }, function(items) {
            if (items.ignore_nf == false) {
                $('.episode-list-description-container').each(function() {
                    // checkDOMChange2();
                    console.log('Bind');
                    $(this).on('click', function() {
                        console.log('Click on episode list');
                        setTimeout(checkDOMChange2, 550);
                    });
                });
                $('.player-next-episode').on('click', function() {
                    console.log('Next player');
                    setTimeout(checkDOMChange2, 550);
                });
                /*$('.playRing').each(async function(index) {
                    // checkDOMChange2();
                    console.log("Bind");
                    $(this).on('click', async function(e) {
                        console.log("Click on a play on index");
                        setTimeout(checkDOMChange2, 550);
                    });
                });*/
                main();
            }
        });
    } else {
        setTimeout(checkDOMChange, 100);
    }
}

checkDOMChange();
