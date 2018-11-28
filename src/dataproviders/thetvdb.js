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

module.exports = class TheTvDB {
    constructor(atoken) {
        this.browser = require('webextension-polyfill');
        this.restclient = require('node-rest-client').Client;
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
        this.headers = {Authorization: 'Bearer ' + this.atoken, 'Accept-Language': this.browser.i18n.getUILanguage()};
        this.api = new this.restclient();
        this.api.registerMethod('searchSeries', 'https://api.thetvdb.com/search/series?name=${query}', 'GET');
        this.api.registerMethod('getSeries', 'https://api.thetvdb.com/series/${id}', 'GET');
        this.api.registerMethod('getEpisodes', 'https://api.thetvdb.com/series/${id}/episodes', 'GET');
        this.api.registerMethod('refreshToken', 'https://api.thetvdb.com/refresh_token', 'GET');
        this.api.methods.refreshToken({headers: this.headers}, (data, res) => {
            if (data.Error) {
                console.warn('TheTVDB failed to refresh token, a relogin will be necessary.');
                this.ready = false; // TODO : communicate with main daemon to notify unready state : we have no token oshit
                return false;
            }
            this.browser.storage.local.set({noReload: true, thetvdb_at: data.token});
            this.headers.Authorization = 'Bearer ' + data.token;
        });
    }

    searchAnime(query) {
        return new Promise(resolve => {
            this.api.methods.searchSeries({path: {query}, headers: this.headers}, (data, res) => {
                var parsedData = [];
                data.data.forEach(anime => {
                    parsedData.push({
                        name: anime.seriesName,
                        id: anime.id,
                        synopsis: anime.overview
                    });
                });
                resolve(parsedData);
                console.log(parsedData);
            });
        });
    }

    getAnime(aid) {
        return new Promise(resolve => {
            this.api.methods.getSeries({path: {id: aid}, headers: this.headers}, (data, res) => {
                var ret = {
                    episodeDuration: data.data.runtime,
                    synopsis: data.data.overview,
                    genres: data.data.genre
                };
                resolve(ret);
                console.log(ret);
            });
        });
    }

    getAnimeEpisodes(aid) {
        return new Promise(resolve => {
            this.api.methods.getEpisodes({path: {id: aid}, headers: this.headers}, (data, res) => {
                resolve(data);
                console.log(data);
            });
        });
    }

    refreshToken() {
        return new Promise(resolve => {
            this.api.methods.refreshToken({headers: this.headers}, (data, res) => {
                resolve(data);
                console.log(data);
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