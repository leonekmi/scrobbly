module.exports = {
    "env": {
        "webextensions": true,
        "browser": true
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
        "indent": [
            "error",
            4
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
