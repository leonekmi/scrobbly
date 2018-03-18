/*
Kitsu Helpers for Anilist Scrobbler
(c) leonekmi 2018
*/

function Kitsu(access_token, userid) {
    this.scrobbleAnime = function (animeId, episode) {
        console.log('Scrobbling !!');
        var url1 = 'https://kitsu.io/api/edge/library-entries?filter[animeId]=' + encodeURIComponent(animeId) + '&filter[userId]=' + encodeURIComponent(userid),
            options1 = {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/vnd.api+json',
                    'Accept': 'application/vnd.api+json',
                    'Authorization': 'Bearer ' + access_token,
                }
            };
        
        function handleResponse(data) {
            data.json().then(function (json) {
                if (json.data.length == 0) {
                    // Kitsu API is bogus https://kitsu.io/feedback/bugs/p/create-a-library-entry-is-impossible-via-api
                    console.warn('Warning ! For some reason, it is impossible to create a library entry with API, see https://kitsu.io/feedback/bugs/p/create-a-library-entry-is-impossible-via-api for details. If you think you have the solution, please open an issue/PR on GitHub.');
                } else {
                    var url2 = 'https://kitsu.io/api/edge/library-entries/' + json.data[0].id;
                    options1.method = 'PATCH';
                    options1.body = JSON.stringify({
                        data: {
                            id: json.data[0].id,
                            type: 'libraryEntries',
                            attributes: {
                                status: 'current',
                                progress: episode
                            }
                        }
                    });
                    fetch(url2, options1);
                }
            });
        };

        fetch(url1, options1).then(handleResponse);
        $('#anilist_scrobbler_notice_kitsu').text(chrome.i18n.getMessage('appName') + ' : ' + chrome.i18n.getMessage('scrobbling_ok'));
        clearInterval(checkInterval);
    };

    this.getAnimeProgress = function (animeId) {
        return new Promise(resolve => {
            var url = 'https://kitsu.io/api/edge/library-entries?filter[userId]=' + encodeURIComponent(userid) + '&filter[animeId]=' + encodeURIComponent(animeId),
                options = {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/vnd.api+json',
                        'Accept': 'application/vnd.api+json',
                        'Authorization': 'Bearer ' + access_token,
                    }
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
                    console.log(cache);
                    resolve([0, cache]);
                } else {
                    var anime_choose;
                    if (result.data.length == 0) {
                        $('#anilist_scrobbler_notice_kitsu').text(chrome.i18n.getMessage('appName') + ' : ' + chrome.i18n.getMessage('scrobbling_not_in_al'));
                    } else if (result.data.length > 1) {
                        var prompt_message = chrome.i18n.getMessage('multiple_entries');
                        var titlePreference = getTitlePreferencesHelper();
                        titlePreference.then(function(titlePreference) {
                            result.data.forEach(function(item, index) {
                                var temp_str;
                                /*if (item.titles[titlePreference] != null) {
                                    temp_str = '\n[' + index + '] ' + item.title[titlePreference];
                                } else {*/
                                temp_str = '\n[' + index + '] ' + item.attributes.titles.en_jp;
                                //}
                                prompt_message = prompt_message.concat(temp_str);
                            });
                            var temp_choose = promptAnime(prompt_message);
                            temp_choose.then(function(prompt_res) {
                                console.log(result.data[prompt_res]);
                                setCacheEntry(series_title, result.data[prompt_res].attributes.episodeLength);
                                resolve([prompt_res, result.data[prompt_res].attributes.episodeLength]);
                            });
                        });
                    } else {
                        console.log(result.data[0]);
                        resolve([0, result.data[0].attributes.episodeLength]);
                    };
                }
            });
        });
    }

    this.initScrobble = function(series_title, episode_number) {
        var url = 'https://kitsu.io/api/edge/anime?filter[text]=' + encodeURIComponent(series_title),
            options = {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/vnd.api+json',
                    'Accept': 'application/vnd.api+json'
                }
            };
    
        function handleResponse(response) {
            $('#anilist_scrobbler_notice').append('<br><div id="anilist_scrobbler_notice_kitsu"></div>');
            var jsonresponse = response.json();
            jsonresponse.then(function(result) {
                var choose = this.kitsuapi.chooseAnime(result, series_title);
                choose.then(function(data_choose) {
                    console.log(data_choose);
                    var anime_choose = data_choose[0];
                    var duration = data_choose[1];
                    animeId = result.data[anime_choose].id;
                    //epNumber = episode_number;
                    var temp_response = this.kitsuapi.getAnimeProgress(result.data[anime_choose].id);
                    temp_response.then(function(data) {
                        var jsonresponse2 = data.json();
                        jsonresponse2.then(function(result2) {
                            if (result2.data.length == 0) {
                                $('#anilist_scrobbler_notice_kitsu').html(chrome.i18n.getMessage('appName') + ' : ' + chrome.i18n.getMessage('scrobbling_in_not_in_al', [(duration / 4 * 3)]) + ' <a href="javascript:;" id="al-scrobblenow">' + chrome.i18n.getMessage('scrobble_now') + '</a>');
                                //instead of setTimeout, create a new Timer object and save it to a variable
                                progressionTimer2 = new Timer(this.kitsuapi.scrobbleAnime, duration / 4 * 3 * 60 * 1000, result.data[anime_choose].id, episode_number);
                                //Also set an interval to check periodically if anything is playing
                                checkInterval = setInterval(checkPlayingStatus, interval_delay);
                            } else {
                                if (episode_number <= result2.data[0].attributes.progress) {
                                    $('#anilist_scrobbler_notice_kitsu').html(chrome.i18n.getMessage('appName') + ' : ' + chrome.i18n.getMessage('already_watched'));
                                } else if (episode_number == result2.data[0].attributes.progress + 1) {
                                    $('#anilist_scrobbler_notice_kitsu').html(chrome.i18n.getMessage('appName') + ' : ' + chrome.i18n.getMessage('scrobbling_in_normal', [(duration / 4 * 3)]) + ' <a href="javascript:;" id="al-scrobblenow">' + chrome.i18n.getMessage('scrobble_now') + '</a>');
                                    progressionTimer2 = new Timer(this.kitsuapi.scrobbleAnime, duration / 4 * 3 * 60 * 1000, result.data[anime_choose].id, episode_number);
                                    checkInterval = setInterval(checkPlayingStatus, interval_delay);
                                } else if (episode_number >= result2.data[0].attributes.progress + 1) {
                                    $('#anilist_scrobbler_notice_kitsu').html(chrome.i18n.getMessage('appName') + ' : ' + chrome.i18n.getMessage('scrobbling_in_jumped', [(duration / 4 * 3)]) + ' <a href="javascript:;" id="al-scrobblenow">' + chrome.i18n.getMessage('scrobble_now') + '</a>');
                                    progressionTimer2 = new Timer(this.kitsuapi.scrobbleAnime, duration / 4 * 3 * 60 * 1000, result.data[anime_choose].id, episode_number);
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
    console.log('Kitsu API init done');
};