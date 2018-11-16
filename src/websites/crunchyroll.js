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

exports.api = class Crunchyroll {
    constructor () {
        this.browser = require('webextension-polyfill');
        this.urlregex = /https:\/\/www.crunchyroll.com\/([a-zA-Z0-9-]+)\/([a-zA-Z0-9-]+)/;
        this.jquery = require('jquery');
        return true;
    }

    isUsable() {
        return this.urlregex.test(document.documentURI);
    }

    init() {
        var episodeId = document.documentURI.substr(document.documentURI.length - 6);
        console.log(episodeId);
        var url = 'https://www.crunchyroll.com/xml?req=RpcApiVideoPlayer_GetMediaMetadata&media_id=' + episodeId;
        fetch(url).then(result => {
            result.text().then(text => {
                var doc = this.jquery(this.jquery.parseXML(text)).children().children();
                console.log(this);
                var message = {action: 'start', animeName: doc[5].innerHTML, episode: doc[7].innerHTML};
                console.log(message);
                this.browser.runtime.sendMessage(message);
            });
        });
        return true;
    }
}