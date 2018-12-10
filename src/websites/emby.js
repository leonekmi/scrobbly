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

exports.api = class Emby {
    constructor () {
        this.browser = require('webextension-polyfill');
        this.urlregex = /app.emby.media\//;
        this.titleregex = /S([0-9]+):E([0-9]+)/;
        this.title = {title: null, osdTitle: null};
        this.jquery = require('jquery');
        return true;
    }

    isUsable() {
        return this.urlregex.test(document.documentURI);
    }

    init() {
        setInterval(() => {
            var title = this.jquery('title').text();
            var osdTitle = this.jquery('.osdTitle').text();
            var parsed = this.titleregex.exec(osdTitle);
            console.log('[scrobbly] emby support is time-based, some issues can occur', {title, osdTitle}, parsed, this.title);
            var parsedTitle;
            if (parsed[1] != 1) {
                parsedTitle = title + ' ' + parsed[1];
            } else {
                parsedTitle = title;
            }
            if (this.title.title == parsedTitle && this.title.osdTitle == osdTitle) {
                return;
            } else if (this.title.title != parsedTitle && this.title.osdTitle == osdTitle) {
                this.title = {title: parsedTitle, osdTitle};
                this.browser.runtime.sendMessage({action: 'stop'});
            } else {
                this.title = {title: parsedTitle, osdTitle};
                if (!parsed) {
                    console.warn('Scrobbly can\'t detect the episode number. Abort.');
                    return;
                }
                this.browser.runtime.sendMessage({action: 'start', animeName: parsedTitle, episode: parsed[2]});
            }
        }, 6500);
    }
};