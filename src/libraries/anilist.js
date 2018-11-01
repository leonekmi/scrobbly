module.exports = class lanilist {
    constructor (atoken) {
        this.atoken = atoken;
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

    getAnimeData(text) {
        return new Promise(resolve => {
            var query = `query ($id: Int, $page: Int, $search: String) {
                Page (page: $page) {
                    media (id: $id, search: $search, type: ANIME) {
                        id
                        duration
                        description(asHtml: true)
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
                    ret.push({
                        id: el.id,
                        title: el.title.romaji, // title preference will be a setting in a next release
                        episodeDuration: (el.duration) ? el.duration:'none',
                        cover: (el.bannerImage) ? el.duration:this.browser.runtime.getURL('pages/img/none.png'),
                        synopsis: el.description
                    });
                });
                console.log(ret);
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
                resolve(true);
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