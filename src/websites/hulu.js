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

exports.api = class Hulu {
    constructor () {
        this.browser = require('webextension-polyfill');
        this.urlregex = /https:\/\/www.hulu.com/;
        this.urlcheck = /https:\/\/www.hulu.com\/watch\/([a-zA-Z0-9-]+)/;
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
            var episodeInfo = this.jquery('div.metadata-area');
            console.log('[scrobbly] Hulu support is time-based, some issues can occur', episodeInfo);
            if (episodeInfo.length == 0) {
                if (!this.storage.sent) return;
                else {
                    console.log('stop');
                    this.browser.runtime.sendMessage({action: 'stop'});
                    this.storage = {epNumber: null, seriesTitle: null, sent: false};
                }
            } else {
                var seriesTitle = this.jquery('div.metadata-area__second-line').text();
                var episodeRegex = /[S|P]([0-9]+) E([0-9]+)/;
                var episodeData = episodeRegex.exec(this.jquery('div.metadata-area__third-line').text());
                var episodeNumber = episodeData[2];
                var title;
                if (episodeData[1] != 1) {
                    title = seriesTitle + ' ' + episodeData[1];
                } else {
                    title = seriesTitle;
                }
                if (title == this.storage.seriesTitle && episodeNumber == this.storage.epNumber) return;
                else {
                    console.log(title);
                    console.log('new content');
                    this.browser.runtime.sendMessage({action: 'start', animeName: title, episode: episodeNumber});
                    this.storage = {epNumber: episodeNumber, seriesTitle: title, sent: true};
                    return true;
                }
            }
        }, 6500);
    }
};