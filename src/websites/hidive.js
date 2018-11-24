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

exports.api = class HiDive {
    constructor() {
        this.browser = require('webextension-polyfill');
        this.urlregex = /https:\/\/www.hidive.com\/stream\/([a-z-A-Z]+)\/s([0-9]+)e([0-9]+)/;
        this.episodeRegex = /s([0-9]+)e([0-9]+)/;
        this.jquery = require('jquery');
        return true;
    }

    isUsable() {
        return this.urlregex.test(document.documentURI);
    }

    init() {
        var title = this.jquery('.bottom-gutter-15 > h1 > a').text();
        var epInfo = this.episodeRegex.exec(document.documentURI);
        var parsedTitle;
        if (parseInt(epInfo[1]) != 1) {
            parsedTitle = title + ' ' + parseInt(epInfo[1]);
        } else {
            parsedTitle = title;
        }
        this.browser.runtime.sendMessage({action: 'start', animeName: parsedTitle, episode: parseInt(epInfo[2])});
    }
};