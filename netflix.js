/*
Get Metadata from an episode of netflix.com with Anilist Scrobbler
(c) leonekmi 2017
*/

async function main() {
    var regex = /https:\/\/www.netflix.com\/watch\/([a-zA-Z0-9-]+)/;

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
                var series_title = $('.player-status-main-title').text();
                var episode_number = $('.player-status:nth-child(2)').text().split(" ").splice(-1);
                var query = `
                query ($id: Int, $page: Int, $search: String) {
                  Page (page: $page) {
                    media (id: $id, search: $search, type: ANIME) {
                      id
                      format
                      duration
                      title {
                        romaji
                        english
                        native
                      }
                      genres
                    }
                  }
                }
                `;
                var variables = {
                    search: series_title,
                    page: 1
                };

                var url = 'https://graphql.anilist.co',
                    options = {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Accept': 'application/json',
                        },
                        body: JSON.stringify({
                            query: query,
                            variables: variables
                        })
                    };

                function handleResponse(response) {
                    var jsonresponse = response.json();
                    jsonresponse.then(function (result) {
                        $( '.player-status' ).append('<span id="anilist_scrobbler_notice">Anilist Scrobbler : '+ chrome.i18n.getMessage("starting") +'</span>');
                        var choose = chooseAnime(result);
                        choose.then(function (data_choose) {
                            var anime_choose = data_choose[0];
                            var duration = data_choose[1];
                            var temp_response = getAnimeProgress(result.data.Page.media[anime_choose].id);
                            temp_response.then(function (data) {
                                var jsonresponse2 = data.json();
                                jsonresponse2.then(function (result2) {
                                    if (result2.data.Page.media[0].mediaListEntry == null) {
                                        $( '#anilist_scrobbler_notice' ).text('Anilist Scrobbler : '+ chrome.i18n.getMessage("scrobbling_in_not_in_al", [(duration / 4 * 3)]));
                                        setTimeout(scrobbleAnime, duration / 4 * 3 * 60 * 1000, result.data.Page.media[anime_choose].id, episode_number);
                                    } else {
                                        if (episode_number <= result2.data.Page.media[0].mediaListEntry.progress) {
                                            $( '#anilist_scrobbler_notice' ).text('Anilist Scrobbler : '+ chrome.i18n.getMessage("already_watched"));
                                        } else if (episode_number == result2.data.Page.media[0].mediaListEntry.progress + 1) {
                                            $( '#anilist_scrobbler_notice' ).text('Anilist Scrobbler : '+ chrome.i18n.getMessage("scrobbling_in_normal", [(duration / 4 * 3)]));
                                            setTimeout(scrobbleAnime, duration / 4 * 3 * 60 * 1000, result.data.Page.media[anime_choose].id, episode_number);
                                        } else if (episode_number >= result2.data.Page.media[0].mediaListEntry.progress + 1) {
                                            $( '#anilist_scrobbler_notice' ).text('Anilist Scrobbler : '+ chrome.i18n.getMessage("scrobbling_in_jumped", [(duration / 4 * 3)]));
                                            setTimeout(scrobbleAnime, duration / 4 * 3 * 60 * 1000, result.data.Page.media[anime_choose].id, episode_number);
                                        } else {
                                            console.error("Ehhhh....");
                                        };
                                    }
                                });
                            });
                        });
                    });
                };
                function handleError(e) {
                        console.error(e);
                        window.alert(chrome.i18n.getMessage("api_error"));
                };

                fetch(url, options).then(handleResponse)
                                   .catch(handleError);
            }
        }
    });
}

jQuery.fn.exists = function(){ return this.length > 0; }
var numb = 0;

function checkDOMChange2()
{
    if ($('.player-status').exists()) {
        chrome.storage.sync.get({
            ignore_nf: false
        }, function (items) {
            if (items.ignore_nf == false) {
                main();
            }
        });
    } else {
        setTimeout( checkDOMChange2, 100 );
    }
}
function checkDOMChange()
{
    if ($('.player-status').exists()) {
        chrome.storage.sync.get({
            ignore_nf: false
        }, function (items) {
            if (items.ignore_nf == false) {
                $('.player-video-wrapper').on('DOMSubtreeModified', async function(e) {
                    numb = numb + 1;
                    if(numb == 5) {
                        console.log("Changed episode");
                        console.log($('.player-status:nth-child(2)').text().split(" ").splice(-1));
                        numb = 0;
                        checkDOMChange2();
                    }
                });
                main();
            }
        });
    } else {
        setTimeout( checkDOMChange, 100 );
    }
}

checkDOMChange();
