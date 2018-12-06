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

module.exports = class Kitsu {
    constructor (at, uid, rt = null) {
        this.browser = require('webextension-polyfill');
        this.Kitsu = require('kitsu');
        this.at = at;
        this.uid = uid;
        this.rt = rt;
        if (at && uid) {
            this.ready = true;
        } else {
            this.ready = false;
        }
    }

    isReady() {
        return this.ready;
    }

    init() {
        this.api = new this.Kitsu({headers: {Authorization: 'Bearer '+this.at}});
        return true;
    }

    diag() {
        return new Promise((resolve, reject) => {
            this.api.get('users', {
                filter: {
                    self: true
                }
            }).then(res => {
                if (res.data.length == 1) resolve(true);
            }).catch(data => {
                console.warn('Kitsu API issue', data);
                if (!this.rt) {
                    resolve(false);
                } else {
                    fetch('https://kitsu.io/api/oauth/token', {method: 'POST', headers: {'Content-Type': 'application/x-www-form-urlencoded', Accept: 'application/json'}, body: 'grant_type=refresh_token&refresh_token=' + encodeURIComponent(this.rt)}).then(data => {
                        data.json().then(jsondata => {
                            if (jsondata.error) {
                                resolve(false);
                            } else {
                                this.browser.storage.local.set({noReload: true, kitsu_at: jsondata.access_token, kitsu_rt: jsondata.refresh_token});
                                this.at = jsondata.access_token;
                                this.rt = jsondata.refresh_token;
                                this.init();
                                resolve(true);
                            }
                        });
                    });
                }
            });
        });
    }

    getAnimeData(text) {
        return new Promise(resolve => {
            this.api.get('anime', {
                filter: {
                    text: text
                }
            }).then(data => {
                var animes = [];
                data.data.forEach(el => {
                    animes.push({
                        id: el.id,
                        title: el.canonicalTitle,
                        episodeDuration: (el.episodeLength != 0 && typeof el.episodeLength == 'number') ? el.episodeLength:'none',
                        cover: (el.coverImage) ? el.coverImage.original:this.browser.runtime.getURL('pages/img/none.png'),
                        synopsis: el.synopsis
                    });
                });
                resolve(animes);
            });
        });
    }

    updateLibrary(working) {
        return new Promise(resolve => {
            if (working.progress.create) {
                this.api.create('library-entries', {
                    status: 'current',
                    progress: working.ep,
                    anime: {
                        type: 'anime',
                        id: working.anime.id.toString()
                    },
                    user: {
                        type: 'users',
                        id: this.uid.toString()
                    }
                }).then(result => {
                    resolve(true);
                });
            } else {
                this.api.patch('library-entries', {
                    id: working.progress.id.toString(),
                    status: 'current',
                    progress: working.ep,
                    anime: {
                        type: 'anime',
                        id: working.anime.id.toString()
                    },
                    user: {
                        type: 'users',
                        id: this.uid.toString()
                    }
                }).then(result => {
                    resolve(true);
                });
            }
        });
    }

    getProgress(animeId) {
        return new Promise(resolve => {
            this.api.get('library-entries', {
                filter: {
                    userId: this.uid,
                    animeId: animeId
                }
            }).then(result => {
                resolve({progress: (result.data.length == 0) ? 0:result.data[0].progress, create: (result.data.length == 0) ? true:false, id: (result.data.length == 0) ? false:result.data[0].id});
            });
        });
    }

    get info() {
        return {
            name: 'kitsu',
            url: 'https://kitsu.io/',
            auth: 'bearer'
        };
    }
};