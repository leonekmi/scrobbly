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

var Vue = require('vue/dist/vue');
var $ = require('jquery');
var browser = require('webextension-polyfill');

browser.storage.local.get(null).then(result => {
    browser.runtime.sendMessage({action: 'storage', get: 'workingdb'}).then(result2 => {
        new Vue({
            el: 'content',
            data: {
                browserstorage: result,
                workingdb: result2,
                workingdblist: [],
                libchoose: 'none',
                working: true
            },
            methods: {
                trans: function(id, ...args) {
                    return browser.i18n.getMessage(id, args);
                },
                stop: function() {
                    browser.runtime.sendMessage({action: 'stop'});
                    window.close();
                },
                scrNow: function() {
                    browser.runtime.sendMessage({action: 'scrobble'});
                    window.close();
                },
                toggleScrobbling: function() {
                    browser.runtime.sendMessage({action: 'toggleScrobble'}).then(result => {
                        if (result == 'stopped') {
                            this.working = false;
                        } else if (result == 'started') {
                            this.working = true;
                        }
                    });
                },
                changeScrobbling: function(e) {
                    var message = browser.i18n.getMessage('chooseAnime') + '\n\n';
                    this.workingdb[e.srcElement.attributes.lib.value].otherResults.forEach((element, index) => {
                        message += '['+index+'] ' + element.title + '\n';
                    });
                    var aid = window.prompt(message);
                    if (!aid) return;
                    browser.runtime.sendMessage({action: 'change', lib: e.srcElement.attributes.lib.value, aid: aid}).then(res => {
                        if (!res) window.alert(browser.i18n.getMessage('changeScrobblingFail'));
                        browser.runtime.sendMessage({action: 'storage', get: 'workingdb'}).then(res => {
                            this.workingdb = res;
                        });
                    });
                    return;
                },
                openSettings: function() {
                    browser.tabs.create({
                        active: true,
                        url: browser.runtime.getURL('pages/settings.html')
                    });
                }
            },
            created: function() {
                if (this.workingdb == 'daemonstopped') {
                    this.working = false;
                }
                if (typeof this.workingdb == 'string') {
                    this.workingdblist = [];
                    return;
                }
                $.each(this.workingdb, (i) => {
                    this.workingdblist.push(i);
                });
            }
        });
    });
});
