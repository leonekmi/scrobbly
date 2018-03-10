/*
Global Helpers for Anilist Scrobbler
(c) leonekmi 2017-2018
*/

function scrobbleAnime(animeId, episode) {
    chrome.storage.local.get('access_token', function(items) {
        console.log("Scrobbling !!");
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
            status: "CURRENT"
        };
        var url = 'https://graphql.anilist.co',
            options = {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Authorization': 'Bearer ' + items['access_token'],
                },
                body: JSON.stringify({
                    query: query,
                    variables: variables
                })
            };
        fetch(url, options);
        $('#anilist_scrobbler_notice').text(chrome.i18n.getMessage("appName") + ' : ' + chrome.i18n.getMessage("scrobbling_ok"));
    });
}

function retrieveWindowVariables(variables) {
    var ret = {};

    var scriptContent = "";
    for (var i = 0; i < variables.length; i++) {
        var currVariable = variables[i];
        scriptContent += "if (typeof " + currVariable + " !== 'undefined') $('body').attr('tmp_" + currVariable + "', " + currVariable + ");\n"
    }

    var script = document.createElement('script');
    script.id = 'tmpScript';
    script.appendChild(document.createTextNode(scriptContent));
    (document.body || document.head || document.documentElement).appendChild(script);

    for (var i = 0; i < variables.length; i++) {
        var currVariable = variables[i];
        ret[currVariable] = $("body").attr("tmp_" + currVariable);
        $("body").removeAttr("tmp_" + currVariable);
    }

    $("#tmpScript").remove();

    return ret;
}

function getAnimeProgressHelper(animeId) {
    return new Promise(resolve => {
        chrome.storage.local.get('access_token', function(items) {
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
                        'Authorization': 'Bearer ' + items['access_token'],
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
    });
}
async function getAnimeProgress(animeId) {
    var result;
    result = await getAnimeProgressHelper(animeId);
    return result;
}

function getTitlePreferencesHelper() {
    return new Promise(resolve => {
        chrome.storage.sync.get({
            title: "romaji"
        }, function(items) {
            resolve(items.title);
        });
    });
}
async function getTitlePreferences() {
    var result;
    result = await getTitlePreferencesHelper();
    return result;
}

function promptAnime(prompt_message) {
    return new Promise(resolve => {
        resolve(prompt(prompt_message));
    });
}

function buildCache() {
    chrome.storage.local.set({
        cache_entries: {
            "empty set": "first entry"
        }
    }, function() {
        console.log("Cache builded");
    });
}

function getCacheEntry(series_title) {
    return new Promise(resolve => {
        chrome.storage.local.get({
            cache_entries: 'empty'
        }, function(items) {
            if (items.cache_entries == 'empty') {
                buildCache();
            }
            console.log(items.cache_entries);
            if (items.cache_entries[series_title]) {
                resolve(items.cache_entries[series_title]);
            } else {
                resolve(false);
            }
        });
    });
}

function setCacheEntry(series_title, entry) {
    return new Promise(resolve => {
        chrome.storage.local.get({
            cache_entries: 'empty'
        }, function(items) {
            var cache = items.cache_entries;
            cache[series_title] = entry;
            console.log(cache);
            chrome.storage.local.set({
                cache_entries: cache
            }, function() {
                console.log("Stored in cache");
                resolve(true);
            });
        });
    });
}

function chooseAnime(result, series_title) {
    return new Promise(resolve => {
        var cache = getCacheEntry(series_title);
        cache.then(function(cache) {
            if (cache) {
                resolve([0, cache.duration]);
            } else {
                var anime_choose;
                if (result.data.Page.media.length == 0) {
                    $('#anilist_scrobbler_notice').text(chrome.i18n.getMessage("appName") + ' : ' + chrome.i18n.getMessage("scrobbling_not_in_al"));
                } else if (result.data.Page.media.length > 1) {
                    var prompt_message = chrome.i18n.getMessage("multiple_entries");
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

function initScrobble(series_title, episode_number, prepend_message) {
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
        prepend_message();
        var jsonresponse = response.json();
        jsonresponse.then(function(result) {
            var choose = chooseAnime(result, series_title);
            choose.then(function(data_choose) {
                var anime_choose = data_choose[0];
                var duration = data_choose[1];
                var temp_response = getAnimeProgress(result.data.Page.media[anime_choose].id);
                temp_response.then(function(data) {
                    var jsonresponse2 = data.json();
                    jsonresponse2.then(function(result2) {
                        if (result2.data.Page.media[0].mediaListEntry == null) {
                            $('#anilist_scrobbler_notice').text(chrome.i18n.getMessage("appName") + ' : ' + chrome.i18n.getMessage("scrobbling_in_not_in_al", [(duration / 4 * 3)]));
                            setTimeout(scrobbleAnime, duration / 4 * 3 * 60 * 1000, result.data.Page.media[anime_choose].id, episode_number);
                        } else {
                            if (episode_number <= result2.data.Page.media[0].mediaListEntry.progress) {
                                $('#anilist_scrobbler_notice').text(chrome.i18n.getMessage("appName") + ' : ' + chrome.i18n.getMessage("already_watched"));
                            } else if (episode_number == result2.data.Page.media[0].mediaListEntry.progress + 1) {
                                $('#anilist_scrobbler_notice').text(chrome.i18n.getMessage("appName") + ' : ' + chrome.i18n.getMessage("scrobbling_in_normal", [(duration / 4 * 3)]));
                                setTimeout(scrobbleAnime, duration / 4 * 3 * 60 * 1000, result.data.Page.media[anime_choose].id, episode_number);
                            } else if (episode_number >= result2.data.Page.media[0].mediaListEntry.progress + 1) {
                                $('#anilist_scrobbler_notice').text(chrome.i18n.getMessage("appName") + ' : ' + chrome.i18n.getMessage("scrobbling_in_jumped", [(duration / 4 * 3)]));
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
console.log('Anilist Scrobbler init done');
