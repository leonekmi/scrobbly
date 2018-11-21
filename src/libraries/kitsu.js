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
    constructor (at, uid) {
        this.browser = require('webextension-polyfill');
        this.Kitsu = require('kitsu');
        this.at = at;
        this.uid = uid
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