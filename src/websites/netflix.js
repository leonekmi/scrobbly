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
        this.urlregex = /https:\/\/www.netflix.com/;
        this.urlcheck = /https:\/\/www.netflix.com\/watch\/([a-zA-Z0-9-]+)/;
        this.jquery = require('jquery');
        this.retry = require('retry');
        return true;
    }

    isUsable() {
        return this.urlregex.test(document.documentURI);
    }

    init() {
        var operation = this.retry.operation({forever: true});

        operation.attempt(currAtt => {
            var episodeInfo = this.jquery('div.ellipsize-text');
            if (episodeInfo.length == 0) {
                operation.retry({message: 'Netflix is loading', obj: episodeInfo});
            } else {
                var seriesTitle = episodeInfo[0].children[0].innerText;
                var episodeRegex = /S([0-9]+):E([0-9]+)/;
                var episodeData = episodeRegex.exec(episodeInfo[0].children[1].innerText);
                var episodeNumber = episodeData[2];
                this.browser.runtime.sendMessage({action: 'start', animeName: seriesTitle, episode: episodeNumber});
            }
        });
    }
};