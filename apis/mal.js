/*
MAL Helpers for Anilist Scrobbler
(c) leonekmi 2018
*/

function MAL(username, password) {
    this.scrobbleAnime = function (animeId, episode) {
        console.log('Scrobbling !!');
        
        // How to determine if i must create or update a list entry

        $('#anilist_scrobbler_notice_MAL').text(chrome.i18n.getMessage('otherAppName', ['MAL']) + ' : ' + chrome.i18n.getMessage('scrobbling_ok'));
        clearInterval(checkInterval);
    };

    this.getAnimeProgress = function (animeId) {
        return new Promise(resolve => {
            // I have absolutely no idea of how to retrieve anime progress
        });
    };

    this.chooseAnime = function (result, series_title) {
        return new Promise(resolve => {
            var cache = getCacheEntry('MAL', series_title);
            cache.then(function (cache) {
                if (cache) {
                    resolve([0, cache]);
                } else {
                    var anime_choose;
                    if (result.data.length == 0) {
                        $('#anilist_scrobbler_notice_MAL').text(chrome.i18n.getMessage('otherAppName', ['MAL']) + ' : ' + chrome.i18n.getMessage('scrobbling_not_in_al', 'MAL'));
                    } else if (result.data.length > 1) {
                        var prompt_message = chrome.i18n.getMessage('multiple_entries', 'MAL');
                        var titlePreference = getTitlePreferencesHelper();
                        titlePreference.then(function (titlePreference) {
                            result.data.forEach(function (item, index) {
                                var temp_str;
                                if (item.attributes.titles[titlePreference.replace('english', 'en_en').replace('romaji', 'en_ja').replace('native', 'ja_ja')] != null) {
                                    temp_str = '\n[' + index + '] ' + item.attributes.titles[titlePreference.replace('english', 'en_en').replace('romaji', 'en_ja').replace('native', 'ja_ja')];
                                } else {
                                    temp_str = '\n[' + index + '] ' + item.attributes.titles.en_jp;
                                }
                                prompt_message = prompt_message.concat(temp_str);
                            });
                            var temp_choose = promptAnime(prompt_message);
                            temp_choose.then(function (prompt_res) {
                                setCacheEntry('MAL', series_title, [result.data[prompt_res].id, result.data[prompt_res].attributes.episodeLength]);
                                resolve([prompt_res, [result.data[prompt_res].id, result.data[prompt_res].attributes.episodeLength]]);
                            });
                        });
                    } else {
                        resolve([0, [result.data[prompt_res].id, result.data[0].attributes.episodeLength]]);
                    };
                }
            });
        });
    }

    this.initScrobble = function (series_title, episode_number) {
        console.log('Basic ' + btoa(username + ':' + password));
        var url = 'https://myanimelist.net/api/anime/search.xml?q=' + encodeURIComponent(series_title),
            options = {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/xml',
                    'Accept': 'application/xml',
                    'Authorization': 'Basic ' + btoa(username + ':' + password)
                },
                mode: 'no-cors'
            };

        function handleResponse(response) {
            console.log(response);
            /*$('<div id="anilist_scrobbler_notice_MAL"></div>').insertAfter($('#anilist_scrobbler_notice'));
            var jsonresponse = response.json();
            jsonresponse.then(function (result) {
                var choose = this.MALapi.chooseAnime(result, series_title);
                choose.then(function (data_choose) {
                    var anime_choose = data_choose[0];
                    var duration = data_choose[1][1];
                    animeId.MAL = data_choose[1][0];
                    //epNumber = episode_number;
                    var temp_response = this.MALapi.getAnimeProgress(animeId.MAL);
                    temp_response.then(function (data) {
                        var jsonresponse2 = data.json();
                        jsonresponse2.then(function (result2) {
                            if (result2.data.length == 0) {
                                $('#anilist_scrobbler_notice_MAL').html(chrome.i18n.getMessage('otherAppName', ['MAL']) + ' : ' + chrome.i18n.getMessage('scrobbling_in_not_in_al', [(duration / 4 * 3)]) + ' <a href="javascript:;" id="ks-scrobblenow">' + chrome.i18n.getMessage('scrobble_now') + '</a>');
                                //instead of setTimeout, create a new Timer object and save it to a variable
                                progressionTimer2 = new Timer(this.MALapi.scrobbleAnime, duration / 4 * 3 * 60 * 1000, animeId.MAL, episode_number);
                                //Also set an interval to check periodically if anything is playing
                                checkInterval = setInterval(checkPlayingStatus, interval_delay);
                            } else {
                                if (episode_number <= result2.data[0].attributes.progress) {
                                    $('#anilist_scrobbler_notice_MAL').html(chrome.i18n.getMessage('otherAppName', ['MAL']) + ' : ' + chrome.i18n.getMessage('already_watched'));
                                } else if (episode_number == result2.data[0].attributes.progress + 1) {
                                    if (duration == null) {
                                        $('#anilist_scrobbler_notice_MAL').html(chrome.i18n.getMessage('otherAppName', ['MAL']) + ' : ' + chrome.i18n.getMessage('unknown_duration') + ' <a href="javascript:;" id="ks-scrobblenow">' + chrome.i18n.getMessage('scrobble_now') + '</a>');
                                    } else {
                                        $('#anilist_scrobbler_notice_MAL').html(chrome.i18n.getMessage('otherAppName', ['MAL']) + ' : ' + chrome.i18n.getMessage('scrobbling_in_normal', [(duration / 4 * 3)]) + ' <a href="javascript:;" id="ks-scrobblenow">' + chrome.i18n.getMessage('scrobble_now') + '</a>');
                                        progressionTimer2 = new Timer(this.MALapi.scrobbleAnime, duration / 4 * 3 * 60 * 1000, animeId.MAL, episode_number);
                                        checkInterval = setInterval(checkPlayingStatus, interval_delay);
                                    }
                                } else if (episode_number >= result2.data[0].attributes.progress + 1) {
                                    if (duration == null) {
                                        $('#anilist_scrobbler_notice_MAL').html(chrome.i18n.getMessage('otherAppName', ['MAL']) + ' : ' + chrome.i18n.getMessage('unknown_duration') + ' <a href="javascript:;" id="ks-scrobblenow">' + chrome.i18n.getMessage('scrobble_now') + '</a>');
                                    } else {
                                        $('#anilist_scrobbler_notice_MAL').html(chrome.i18n.getMessage('otherAppName', ['MAL']) + ' : ' + chrome.i18n.getMessage('scrobbling_in_jumped', [(duration / 4 * 3)]) + ' <a href="javascript:;" id="ks-scrobblenow">' + chrome.i18n.getMessage('scrobble_now') + '</a>');
                                        progressionTimer2 = new Timer(this.MALapi.scrobbleAnime, duration / 4 * 3 * 60 * 1000, animeId.MAL, episode_number);
                                        checkInterval = setInterval(checkPlayingStatus, interval_delay);
                                    }
                                } else {
                                    console.error('Ehhhh....');
                                };
                            }
                            $('#ks-scrobblenow').click(function () {
                                window.postMessage({
                                    direction: 'from-page-script',
                                    message: 'Message from the page',
                                    data: 'MAL'
                                }, '*');
                            });
                        });
                    });
                });
            });*/
        };

        function handleError(e) {
            console.error(e);
            window.alert(chrome.i18n.getMessage('api_error', 'MAL'));
        };

        //fetch(url, options).then(handleResponse)
            //.catch(handleError);
    }
    console.log('MAL API init done');
};