/*
Global Helpers for Anilist Scrobbler
(c) leonekmi 2017-2018
*/

var anilistapi;
chrome.storage.local.get('access_token', function (items) {
    if (typeof items.access_token == 'string') {
        anilistapi = new Anilist(items.access_token);
    } else {
        anilistapi = 'notready';
    }
});
var kitsuapi;
chrome.storage.local.get(['kitsu_at', 'kitsu_userid'], function (items) {
    if (typeof items.kitsu_at == 'string') {
        kitsuapi = new Kitsu(items.kitsu_at, items.kitsu_userid);
    } else {
        kitsuapi = 'notready';
    }
});

function retrieveWindowVariables(variables) {
    var ret = {};

    var scriptContent = '';
    for (var i = 0; i < variables.length; i++) {
        var currVariable = variables[i];
        scriptContent += 'if (typeof ' + currVariable + ' !== \'undefined\') $(\'body\').attr(\'tmp_' + currVariable + '\', ' + currVariable + ');\n'
    }

    var script = document.createElement('script');
    script.id = 'tmpScript';
    script.appendChild(document.createTextNode(scriptContent));
    (document.body || document.head || document.documentElement).appendChild(script);

    for (var i = 0; i < variables.length; i++) {
        var currVariable = variables[i];
        ret[currVariable] = $('body').attr('tmp_' + currVariable);
        $('body').removeAttr('tmp_' + currVariable);
    }

    $('#tmpScript').remove();

    return ret;
}

function getTitlePreferencesHelper() {
    return new Promise(resolve => {
        chrome.storage.sync.get({
            title: 'romaji'
        }, function (items) {
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
            'anilist': {},
            'kitsu': {}
        }
    }, function () {
        console.log('Cache builded');
    });
}

// TODO : Shit the cache it doesn't remember the animeid

function getCacheEntry(cache_title, series_title) {
    return new Promise(resolve => {
        chrome.storage.local.get({
            cache_entries: {
                'anilist': {},
                'kitsu': {}
            }
        }, function (items) {
            if (items.cache_entries[cache_title][series_title]) {
                resolve(items.cache_entries[cache_title][series_title]);
            } else {
                resolve(false);
            }
        });
    });
}

function removeCacheEntry(cache_title, entry_name) {
    return new Promise(resolve => {
        chrome.storage.local.get({
            cache_entries: []
        }, function (items) {
            var cache = items.cache_entries;
            delete cache[cache_title][entry_name];
            chrome.storage.local.set({
                cache_entries: cache
            }, function () {
                console.log('Deleted ' + entry_name + ' from cache');
                resolve(true);
            });
        })
    });
}

function setCacheEntry(cache_title, series_title, entry) {
    return new Promise(resolve => {
        chrome.storage.local.get({
            cache_entries: 'empty'
        }, function (items) {
            var cache = items.cache_entries;
            cache[cache_title][series_title] = entry;
            chrome.storage.local.set({
                cache_entries: cache
            }, function () {
                console.log('Stored in cache');
                resolve(true);
            });
        });
    });
}

/* Reference to the pausable/resumable timer */
var progressionTimer, progressionTimer2;
/* Reference to the interval used to check the playing status */
var checkInterval;
var interval_delay = 5000;
/* Reference to the animeId and episode number outside initScrobble for specific usages */
var animeId = {};
var epNumber;

/* Timer class */
function Timer(callback, delay, ...params) {
    var timerId, start, remaining = delay, paused;

    this.pause = function () {
        window.clearTimeout(timerId);
        remaining -= new Date() - start;
        paused = true;
    };

    this.resume = function () {
        start = new Date();
        window.clearTimeout(timerId);
        timerId = window.setTimeout(callback, remaining, ...params);
        paused = false;
    };

    this.isPaused = function () {
        return paused;
    };

    this.getRemaining = function () {
        return remaining;
    };

    this.setRemaining = function (time) {
        remaining = time;
    };

    this.resume();
}

/* Calls background script using this tab's title to check if there is audio playing in it or not */
function checkPlayingStatus() {
    console.log('checking playing status now');

    //send message to background script so that it can check the playing status of the current tab
    chrome.runtime.sendMessage({action: 'checkAudioPlaying'});
}

/* Listens for response from background script */
chrome.runtime.onMessage.addListener(function (request, sender) {
    if (request.action == 'audioPlayingResponse') {

        var audioPlaying = request.response;

        /* Pause timer if nothing is playing, and resume it if it started again */
        // To avoid some weird conflicts, i split timers, see for fusion
        if (!audioPlaying && typeof progressionTimer == 'object' && !progressionTimer.isPaused()) {
            console.log('Anilist Timer paused!');
            progressionTimer.pause();
        } else if (audioPlaying && typeof progressionTimer == 'object' && progressionTimer.isPaused()) {
            console.log('Anilist Timer resumed!');
            progressionTimer.resume();
        }
        if (!audioPlaying && typeof progressionTimer2 == 'object' && !progressionTimer2.isPaused()) {
            console.log('Kitsu Timer paused!');
            progressionTimer2.pause();
        } else if (audioPlaying && typeof progressionTimer2 == 'object' && progressionTimer2.isPaused()) {
            console.log('Kitsu Timer resumed!');
            progressionTimer2.resume();
        }
    }
});

window.addEventListener("message", (event) => {
    if (event.source == window &&
        event.data &&
        event.data.direction == "from-page-script") {
        console.log('Immediate scrobble');
        if (anilistapi != 'notready' && event.data.data == 'anilist') {
            anilistapi.scrobbleAnime(animeId.anilist, epNumber);
        }
        if (kitsuapi != 'notready' && event.data.data == 'kitsu') {
            kitsuapi.scrobbleAnime(animeId.kitsu, epNumber)
        }
    }
});

function initScrobble(series_title, episode_number, prepend_message) {
    prepend_message();
    if (anilistapi !== 'notready' && kitsuapi !== 'notready') {
        $('#anilist_scrobbler_notice').text(chrome.i18n.getMessage('appName') + ' : ' + chrome.i18n.getMessage('please_login', 'Anilist'));
    } else {
        epNumber = episode_number;
        if (anilistapi !== 'notready') {
            anilistapi.initScrobble(series_title, episode_number);
        }
        if (kitsuapi !== 'notready') {
            kitsuapi.initScrobble(series_title, episode_number);
        }
    }
}

console.log('Anilist Scrobbler init done');
