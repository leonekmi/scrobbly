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

exports.api = class Ponimu {
    constructor () {
        this.browser = require('webextension-polyfill');
        this.urlregex = /https:\/\/ponimu.com\//; //streaming\/([a-zA-Z0-9-_]+)/;
        this.titleregex = /([\S\s]+) \| Episode ([0-9]+)/;
        this.jquery = require('jquery');
        return true;
    }

    isUsable() {
        return this.urlregex.test(document.documentURI);
    }

    init() {
        this.jquery('title').bind('DOMSubtreeModified', () => {
            console.log('title event !');
            if (this.titleregex.test(this.jquery('title').text())) {
                var result = this.titleregex.exec(this.jquery('title').text());
                var title = result[1];
                var episodeNumber = result[2];
                this.browser.runtime.sendMessage({action: 'start', animeName: title, episode: episodeNumber});
            }
        });
    }
};