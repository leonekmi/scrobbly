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

exports.api = class Netflix {
    constructor () {
        this.browser = require('webextension-polyfill');
        this.urlregex = /https:\/\/twist.moe/;
        this.urlcheck = /https:\/\/twist.moe\/a\/([a-z0-9-]+)/;
        this.jquery = require('jquery');
        // this.retry = require('retry');
        this.storage = {epNumber: null, seriesTitle: null, sent: false};
        return true;
    }

    isUsable() {
        return this.urlregex.test(document.documentURI);
    }

    init() {
        setInterval(() => {
            if (!this.jquery('div.information').length) {
                if (!this.storage.sent) return;
                else {
                    console.log('stop');
                    this.browser.runtime.sendMessage({action: 'stop'});
                    this.storage = {epNumber: null, seriesTitle: null, sent: false};
                }
            } else {
                var seriesTitle = this.jquery('div.information h2 > span')[0].innerText;
                var episodeNumber = /Episode ([0-9]+)/.exec(this.jquery('div.information > div > span')[0].innerText)[1];
                console.log('scrobbly debug, shame on me if i forgot to delete this line', seriesTitle, episodeNumber);
                if (seriesTitle == this.storage.seriesTitle && episodeNumber == this.storage.epNumber) return;
                else {
                    console.log(seriesTitle);
                    console.log('new content');
                    this.browser.runtime.sendMessage({action: 'start', animeName: seriesTitle, episode: episodeNumber});
                    this.storage = {epNumber: episodeNumber, seriesTitle, sent: true};
                    return true;
                }
            }
        }, 2500);
    }
};