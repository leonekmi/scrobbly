module.exports = {
    "env": {
        "webextensions": true,
        "browser": true,
        "es6": true
    },
    "globals": {
        "$": true,
        "scrobbleAnime": false,
        "retrieveWindowVariables": false,
        "getAnimeProgressHelper": false,
        "getAnimeProgress": false,
        "getTitlePreferencesHelper": false,
        "getTitlePreferences": false,
        "promptAnime": false,
        "buildCache": false,
        "getCacheEntry": false,
        "setCacheEntry": false,
        "chooseAnime": false,
        "initScrobble": false
    },
    "extends": "eslint:recommended",
    "rules": {
        "no-console": [
            "warn"
        ],
        "linebreak-style": [
            "error",
            "unix"
        ],
        "quotes": [
            "error",
            "single"
        ],
        "semi": [
            "error",
            "always"
        ]
    }
};

/*
   "content_scripts": [
        {
            "matches": ["*://leonekmi.twittolabel.fr/anilist-scrobble/*"],
            "js": ["jquery.js", "anilist_auth.js"]
        },
        {
            "matches": ["*://leonekmi.twittolabel.fr/anilist-scrobble-altcallback/*"],
            "js": ["jquery.js", "anilist_auth_alternative.js"]
        },
        {
            "matches": ["*://www.crunchyroll.com/*"],
            "js": ["jquery.js", "helpers.js", "websites/crunchyroll.js"]
        },
        {
            "matches": ["*://www.wakanim.tv/*"],
            "js": ["jquery.js", "helpers.js", "websites/wakanim.js"]
        },
        {
            "matches": ["*://animedigitalnetwork.fr/*"],
            "js": ["jquery.js", "helpers.js", "websites/adn.js"]
        },
        {
            "matches": ["*://www.hulu.com/*"],
            "js": ["jquery.js", "helpers.js", "websites/hulu.js"]
        },
        {
            "matches": ["*://www.netflix.com/*"],
            "js": ["jquery.js", "helpers.js", "websites/netflix.js"]
        }
    ],


var papi = class lkitsu {
    constructor (at) {
        this.Kitsu = require('kitsu');
        this.at = at;
        this.api = new this.Kitsu();
        if (at) {
            this.ready = true;
        } else {
            this.ready = false;
        }
    }

    isReady() {
        return this.ready;
    }
};
var lapi;
chrome.storage.local.get({'kitsu_at': false}, result => {
    lapi = new papi(result.kitsu_at);
});

exports.api = lapi;
*/