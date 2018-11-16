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

exports.api = class Plex {
    constructor () {
        this.browser = require('webextension-polyfill');
        this.urlregex = /https:\/\/app.plex.tv/;
        this.titleregex = /(▶ |)([\S ]+) - S([0-9]+) · E([0-9]+)/;
        this.jquery = require('jquery');
        this.title = {};
        return true;
    }

    isUsable() {
        return this.urlregex.test(document.documentURI);
    }

    init() {
        this.jquery('title').bind('DOMSubtreeModified', () => {
            console.log('title event !');
            var title = this.jquery('title').text();
            var parsedTitle = this.titleregex.exec(title);
            if (!parsedTitle) return;
            parsedTitle = {animeName: parsedTitle[2], episode: parsedTitle[4]};
            if (parsedTitle.animeName == this.title.animeName) {
                if (parsedTitle.episode == this.title.episode) {
                    // trigger events in runtime ?
                } else {
                    parsedTitle.action = 'start';
                    this.browser.runtime.sendMessage(parsedTitle);
                    this.title = parsedTitle;
                }
            } else {
                parsedTitle.action = 'start';
                this.browser.runtime.sendMessage(parsedTitle);
                this.title = parsedTitle;
            }
        });
    }
};