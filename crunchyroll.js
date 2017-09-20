/*
Get Metadata from an episode of Crunchyroll with Anilist Scrobbler
(c) leonekmi 2017

TODO lIST :
Line 42
*/

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

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
    });
    await sleep(1500);
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
                        var anime_choose = 0;
                        var duration;
                        if (result.data.Page.media.length > 1) {
                            var prompt_message = "La base de données d'Anilist a retourné plusieurs résultats, merci de choisir l'anime que vous regardez actuellement :";
                            var titlePreference = getTitlePreferencesHelper();
                            titlePreference.then(function (titlePreference) {
                                result.data.Page.media.forEach(function (item, index) {
                                    var temp_str;
                                    if (item.title[titlePreference] != null) {
                                        temp_str = '\n[' + index + '] ' + item.title[titlePreference];
                                    } else {
                                        temp_str = '\n[' + index + '] ' + item.title.romaji;
                                    }
                                    prompt_message = prompt_message.concat(temp_str);
                                });
                                anime_choose = prompt(prompt_message);
                                duration = result.data.Page.media[anime_choose].duration;
                                $( '#template_body' ).prepend('<div class="message-container cf"><div class="message-list"><div id="anilist_scrobbler_notice" class="message-item clearfix message-type-warning">Anilist Scrobbler : Démarrage...</div></div></div>');
                            });
                        } else {
                            duration = result.data.Page.media[0].duration;
                            $( '#template_body' ).prepend('<div class="message-container cf"><div class="message-list"><div id="anilist_scrobbler_notice" class="message-item clearfix message-type-warning">Anilist Scrobbler : Démarrage...</div></div></div>');
                        };
                        var temp_response = getAnimeProgress(result.data.Page.media[anime_choose].id);
                        temp_response.then(function (data) {
                            var jsonresponse2 = data.json();
                            jsonresponse2.then(function (result2) {
                                if (result2.data.Page.media[0].mediaListEntry == null) {
                                    $( '#anilist_scrobbler_notice' ).text('Anilist Scrobbler : Cet anime ne se trouve pas dans votre animelist, il sera automatiquement ajouté au bout de ' + (duration / 4 * 3) + ' minutes (au 3/4 de l\'épisode).');
                                    setTimeout(function() {
                                        scrobbleAnime(result.data.Page.media[anime_choose].id, episode_number);
                                    }, duration / 4 * 3 * 60 * 1000);
                                } else {
                                    if (episode_number <= result2.data.Page.media[0].mediaListEntry.progress) {
                                        $( '#anilist_scrobbler_notice' ).text('Anilist Scrobbler : Cet épisode est déjà marqué comme vu, nous ne changeons rien.');
                                    } else if (episode_number == result2.data.Page.media[0].mediaListEntry.progress + 1) {
                                        $( '#anilist_scrobbler_notice' ).text('Anilist Scrobbler : Cet épisode sera automatiquement ajouté au bout de ' + (duration / 4 * 3) + ' minutes (au 3/4 de l\'épisode).');
                                        setTimeout(function() {
                                            scrobbleAnime(result.data.Page.media[anime_choose].id, episode_number);
                                        }, duration / 4 * 3 * 60 * 1000);
                                    } else if (episode_number >= result2.data.Page.media[0].mediaListEntry.progress + 1) {
                                        $( '#anilist_scrobbler_notice' ).text('Anilist Scrobbler : Cet épisode sera automatiquement ajouté au bout de ' + (duration / 4 * 3) + ' minutes (au 3/4 de l\'épisode, attention : vous avez sauté un ou plusieurs épisodes selon votre liste).');
                                        setTimeout(function() {
                                            scrobbleAnime(result.data.Page.media[anime_choose].id, episode_number);
                                        }, duration / 4 * 3 * 60 * 1000);
                                    } else {
                                        console.error("Ehhhh....");
                                    };
                                }
                            });
                        });
					});
                };
                function handleError(e) {
                        console.error(e);
                        window.alert("L'API d'Anilist semble down, impossible de chercher votre anime");
                };

                fetch(url, options).then(handleResponse)
                                   .catch(handleError);
            }, 'xml');


        }
    }
}

chrome.storage.local.get({
    ignore_cr: false
}, function (items) {
    if (items.ignore_cr == false) {
        main();
    }
});
