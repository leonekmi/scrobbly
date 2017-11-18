/*
Get Metadata from an episode of Crunchyroll with Anilist Scrobbler
(c) leonekmi 2017

TODO lIST :
Line 42
*/

async function main() {
    var regex = /http:\/\/www.crunchyroll.com\/([a-zA-Z0-9-]+)\/([a-zA-Z0-9-]+)/;

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
                var episodeId = null;
                episodeId = retrieveWindowVariables(["DYNAMIC.MEDIA_ID"]);
                episodeId = episodeId['DYNAMIC.MEDIA_ID'];
                if (episodeId == null) {
                    console.log("Using Firefox fallback mode");
                    // Fallback by documentURI (firefox)
                    var uri = document.documentURI;
                    episodeId = uri.substr(uri.length - 6);
                    console.log(episodeId);
                }
                $.get("http://www.crunchyroll.com/xml?req=RpcApiVideoPlayer_GetMediaMetadata&media_id=" + episodeId, function ( data ) {
                    var series_title = data.getElementsByTagName('series_title')[0].innerHTML;
                    // TODO : Crunchyroll add Season 1/2/3/whatever to series title, which makes impossible search for series on Anilist
                    var episode_number = data.getElementsByTagName('episode_number')[0].innerHTML;
                    console.log("Anime detected : " + series_title + " episode " + episode_number);
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
                        $( '#template_body' ).prepend('<div class="message-container cf"><div class="message-list"><div id="anilist_scrobbler_notice" class="message-item clearfix message-type-warning">Anilist Scrobbler : '+ chrome.i18n.getMessage("starting") +'</div></div></div>');
                        var jsonresponse = response.json();
                        jsonresponse.then(function (result) {
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
                }, 'xml');


            }
        }
    });
}

chrome.storage.sync.get({
    ignore_cr: false
}, function (items) {
	console.log(items.ignore_cr);
    if (items.ignore_cr == false) {
        main();
    }
});
