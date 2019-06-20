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

module.exports = class AniList {
    constructor (atoken, settings = {}) {
        this.atoken = atoken;
        this.settings = settings;
        this.aclient = require('graphql-request').GraphQLClient;
        this.browser = require('webextension-polyfill');
        if (this.atoken) {
            this.ready = true;
        } else {
            this.ready = false;
        }
    }

    isReady() {
        return this.ready;
    }

    init() {
        this.api = new this.aclient('https://graphql.anilist.co', {
            headers: {
                Authorization: 'Bearer ' + this.atoken
            }
        });
        return true;
    }
    
    diag() {
        return new Promise(resolve => {
            var query = `query {
                Viewer {
                    id
                }
            }`;
            this.api.request(query, {}).then(result => {
                if (!result.Viewer) resolve(false);
                else resolve(true);
            }).catch(error => {
                console.warn('anilist diag failed :', error.toString());
                resolve(false);
            });
        });
    }

    getAnimeData(text) {
        return new Promise(resolve => {
            var query = `query ($id: Int, $page: Int, $search: String) {
                Page (page: $page) {
                    media (id: $id, search: $search, type: ANIME) {
                        id
                        duration
                        description(asHtml: false)
                        episodes
                        bannerImage
                        title {
                            romaji
                            english
                            native
                        }
                    }
                }
            }`;
            var variables = {
                search: text,
                page: 1
            };
            this.api.request(query, variables).then(data => {
                var ret = [];
                data.Page.media.forEach(el => {
                    var title;
                    switch (this.settings.langPreference) {
                        case 'english':
                            title = el.title.english;
                            break;
                        case 'romaji':
                            title = el.title.romaji;
                            break;
                        case 'native':
                            title = el.title.native;
                            break;
                        default:
                            title = el.title.romaji; // developer preference :)
                            break;
                    }
                    if (!title) title = el.title.english;
                    if (!title) title = el.title.romaji;
                    ret.push({
                        id: el.id,
                        title,
                        episodes: (el.episodes) ? el.episodes:'none',
                        episodeDuration: (el.duration) ? el.duration:'none',
                        cover: (el.bannerImage) ? el.bannerImage:this.browser.runtime.getURL('img/none.png'),
                        synopsis: el.description
                    });
                });
                resolve(ret);
            });
        });
    }

    updateLibrary(working) {
        return new Promise(resolve => {
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
                mediaId: working.progress.id,
                progress: working.ep,
                status: 'CURRENT'
            };
            this.api.request(query, variables).then(result => {
                if (result.errors) resolve(false);
                else resolve(true);
            });
        });
    }

    getProgress(animeId) {
        return new Promise(resolve => {
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
            this.api.request(query, variables).then(result => {
                resolve({progress: (result.Page.media[0].mediaListEntry == null) ? 0:result.Page.media[0].mediaListEntry.progress, create: (result.Page.media[0].mediaListEntry == null) ? true:false, id: (result.Page.media[0].mediaListEntry == null) ? false:result.Page.media[0].id});
            });
        });
    }

    get info() {
        return {
            name: 'anilist',
            url: 'https://anilist.co/',
            auth: 'bearer'
        };
    }

};