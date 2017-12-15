/*
Get Metadata from an episode of netflix.com with Anilist Scrobbler
(c) leonekmi 2017
*/

async function main() {
    var regex = /https:\/\/www.netflix.com\/watch\/([a-zA-Z0-9-]+)/;

    var isLoggedIn = false;
    var ChromeProcessed = false;
    chrome.storage.local.get('access_token', function(items) {
        if (typeof items['access_token'] == 'undefined') {
            isLoggedIn = false;
            ChromeProcessed = true;
        } else {
            isLoggedIn = true;
            ChromeProcessed = true;
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
                $('.episode-list-description-container').each(async function(index) {
                    // checkDOMChange2();
                    console.log("Bind");
                    $(this).on('click', async function(e) {
                        console.log("Click on episode list");
                        setTimeout(checkDOMChange2, 550);
                    });
                });
                $('.player-next-episode').on('click', async function(e) {
                    console.log("Next player");
                    setTimeout(checkDOMChange2, 550);
                });
                main();
            }
        });
    } else {
        setTimeout(checkDOMChange, 100);
    }
}

checkDOMChange();
