/*
Anilist Helpers for Anilist Scrobbler
(c) leonekmi 2018
*/

function Anilist(access_token) {
    this.scrobbleAnime = function (animeId, episode) {
        console.log('Scrobbling !!');
        var query = `
        mutation ($mediaId: Int, $progress : Int, $status: MediaListStatus) {
            SaveMediaListEntry (mediaId: $mediaId, progress: $progress, status: $status) {
                id
                progress
                status
            }
        }
        `;
        var variables = {
            mediaId: animeId,
            progress: episode,
            status: 'CURRENT'
        };
        var url = 'https://graphql.anilist.co',
            options = {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Authorization': 'Bearer ' + access_token,
                },
                body: JSON.stringify({
                    query: query,
                    variables: variables
                })
            };
        fetch(url, options);
        $('#anilist_scrobbler_notice').text(chrome.i18n.getMessage('appName') + ' : ' + chrome.i18n.getMessage('scrobbling_ok'));
        clearInterval(checkInterval);
    };

    this.getAnimeProgress = function (animeId) {
        return new Promise(resolve => {
            var query = `
            query ($id: Int, $page: Int) {
                Page (page: $page) {
                media (id: $id) {
                    id
                    mediaListEntry {
                        status
                        progress
                    }
                }
                }
            }
            `;
            var variables = {
                id: animeId,
                page: 1
            };
            var url = 'https://graphql.anilist.co',
                options = {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                        'Authorization': 'Bearer ' + access_token,
                    },
                    body: JSON.stringify({
                        query: query,
                        variables: variables
                    })
                };

            function handleResponse(response) {
                resolve(response);
            }

            function handleError(e) {
                console.error(e);
            }
            fetch(url, options).then(handleResponse).catch(handleError);
        });
    };

    this.chooseAnime = function(result, series_title) {
        return new Promise(resolve => {
            var cache = getCacheEntry(series_title);
            cache.then(function(cache) {
                if (cache) {
                    resolve([0, cache]);
                } else {
                    var anime_choose;
                    if (result.data.Page.media.length == 0) {
                        $('#anilist_scrobbler_notice').text(chrome.i18n.getMessage('appName') + ' : ' + chrome.i18n.getMessage('scrobbling_not_in_al'));
                    } else if (result.data.Page.media.length > 1) {
                        var prompt_message = chrome.i18n.getMessage('multiple_entries');
                        var titlePreference = getTitlePreferencesHelper();
                        titlePreference.then(function(titlePreference) {
                            result.data.Page.media.forEach(function(item, index) {
                                var temp_str;
                                if (item.title[titlePreference] != null) {
                                    temp_str = '\n[' + index + '] ' + item.title[titlePreference];
                                } else {
                                    temp_str = '\n[' + index + '] ' + item.title.romaji;
                                }
                                prompt_message = prompt_message.concat(temp_str);
                            });
                            var temp_choose = promptAnime(prompt_message);
                            temp_choose.then(function(prompt_res) {
                                setCacheEntry(series_title, result.data.Page.media[prompt_res].duration);
                                resolve([prompt_res, result.data.Page.media[prompt_res].duration]);
                            });
                        });
                    } else {
                        resolve([0, result.data.Page.media[0].duration]);
                    };
                }
            });
        });
    }

    this.initScrobble = function(series_title, episode_number) {
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
            //prepend_message();
            var jsonresponse = response.json();
            jsonresponse.then(function(result) {
                var choose = this.anilistapi.chooseAnime(result, series_title);
                choose.then(function(data_choose) {
                    var anime_choose = data_choose[0];
                    var duration = data_choose[1];
                    animeId = result.data.Page.media[anime_choose].id;
                    //epNumber = episode_number;
                    var temp_response = this.anilistapi.getAnimeProgress(result.data.Page.media[anime_choose].id);
                    temp_response.then(function(data) {
                        var jsonresponse2 = data.json();
                        jsonresponse2.then(function(result2) {
                            if (result2.data.Page.media[0].mediaListEntry == null) {
                                $('#anilist_scrobbler_notice').html(chrome.i18n.getMessage('appName') + ' : ' + chrome.i18n.getMessage('scrobbling_in_not_in_al', [(duration / 4 * 3)]) + ' <a href="javascript:;" id="al-scrobblenow">' + chrome.i18n.getMessage('scrobble_now') + '</a>');
                                //instead of setTimeout, create a new Timer object and save it to a variable
                                progressionTimer = new Timer(this.anilistapi.scrobbleAnime, duration / 4 * 3 * 60 * 1000, result.data.Page.media[anime_choose].id, episode_number);
                                //Also set an interval to check periodically if anything is playing
                                checkInterval = setInterval(checkPlayingStatus, interval_delay);
                            } else {
                                if (episode_number <= result2.data.Page.media[0].mediaListEntry.progress) {
                                    $('#anilist_scrobbler_notice').html(chrome.i18n.getMessage('appName') + ' : ' + chrome.i18n.getMessage('already_watched'));
                                } else if (episode_number == result2.data.Page.media[0].mediaListEntry.progress + 1) {
                                    $('#anilist_scrobbler_notice').html(chrome.i18n.getMessage('appName') + ' : ' + chrome.i18n.getMessage('scrobbling_in_normal', [(duration / 4 * 3)]) + ' <a href="javascript:;" id="al-scrobblenow">' + chrome.i18n.getMessage('scrobble_now') + '</a>');
                                    progressionTimer = new Timer(this.anilistapi.scrobbleAnime, duration / 4 * 3 * 60 * 1000, result.data.Page.media[anime_choose].id, episode_number);
                                    checkInterval = setInterval(checkPlayingStatus, interval_delay);
                                } else if (episode_number >= result2.data.Page.media[0].mediaListEntry.progress + 1) {
                                    $('#anilist_scrobbler_notice').html(chrome.i18n.getMessage('appName') + ' : ' + chrome.i18n.getMessage('scrobbling_in_jumped', [(duration / 4 * 3)]) + ' <a href="javascript:;" id="al-scrobblenow">' + chrome.i18n.getMessage('scrobble_now') + '</a>');
                                    progressionTimer = new Timer(this.anilistapi.scrobbleAnime, duration / 4 * 3 * 60 * 1000, result.data.Page.media[anime_choose].id, episode_number);
                                    checkInterval = setInterval(checkPlayingStatus, interval_delay);
                                } else {
                                    console.error('Ehhhh....');
                                };
                            }
                            $('#al-scrobblenow').click(function () {
                                window.postMessage({
                                    direction: "from-page-script",
                                    message: "Message from the page"
                                  }, "*");
                            });
                        });
                    });
                });
            });
        };
    
        function handleError(e) {
            console.error(e);
            window.alert(chrome.i18n.getMessage('api_error'));
        };
    
        fetch(url, options).then(handleResponse)
            .catch(handleError);
    }
    console.log('Anilist API init done');
};