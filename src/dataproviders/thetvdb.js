/*
    This file is part of Scrobbly.

    Scrobbly is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    Scrobbly is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with Scrobbly.  If not, see <https://www.gnu.org/licenses/>.
*/

/*
ISSUE : fetch api does not take requests when preflight request fails, the no-cors mode doesn't pass headers.
A request to TheTVDB was made here : https://forums.thetvdb.com/viewtopic.php?f=17&t=52469
*/

module.exports = class TheTvDB {
    constructor(atoken) {
        this.browser = require('webextension-polyfill');
        this.atoken = atoken;
        if (atoken) {
            this.ready = true;
        } else {
            this.ready = false;
        }
    }

    isReady() {
        return this.ready;
    }

    init() {
        this.headers = new Headers({'Authorization': 'Bearer ' + this.atoken, 'Accept-Language': this.browser.i18n.getUILanguage()});
        this.api = (endpoint, options = {}) => {
            return new Promise(resolve => {
                // var url = 'https://api.thetvdb.com/' + endpoint;
                // It's a reverse proxy that is CORS-friendly. It should be good
                var url = 'https://tvdbapiproxy.leonekmi.fr/' + endpoint;
                if (!options.headers) options.headers = this.headers;
                options.mode = 'cors';
                fetch(url, options).then(response => {
                    response.json().then(jsondata => resolve(jsondata)).catch(error => {throw new Error('TheTVDB api failed')});
                });
            });
        }
        this.api('refresh_token').then(json => {
            if (json.Error) {
                console.warn('TheTVDB failed to refresh token, a relogin will be necessary.');
                this.ready = false; // TODO : communicate with main daemon to notify unready state : we have no token oshit
                return false;
            }
            this.browser.storage.local.set({noReload: true, thetvdb_at: json.token});
            this.headers.Authorization = 'Bearer ' + json.token;
        });
    }

    searchAnime(query) {
        return new Promise(resolve => {
            this.api('search/series?name=' + query, {}).then(json => {
                var parsedData = [];
                json.data.forEach(anime => {
                    parsedData.push({
                        name: anime.seriesName,
                        id: anime.id,
                        synopsis: anime.overview
                    });
                });
                resolve(parsedData);
            });
        });
    }

    getAnime(aid) {
        return new Promise(resolve => {
            this.api('series/' + aid).then(json => {
                var ret = {
                    episodeDuration: json.data.runtime,
                    synopsis: json.data.overview,
                    genres: json.data.genre
                };
                resolve(ret);
                console.log(ret);
            });
        });
    }

    getAnimeEpisodes(aid) {
        return new Promise(resolve => {
            this.api('series/' + aid + '/episodes').then(json => {
                resolve(json);
                console.log(json);
            });
        });
    }

    get info() {
        return {
            name: 'thetvdb',
            url: 'https://api.thetvdb.com/swagger',
            auth: 'bearer/jwt'
        };
    }
};