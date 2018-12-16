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
var Konami = require('konami');

browser.storage.local.get(null).then(result => {
    browser.runtime.sendMessage({action: 'storage', get: 'workingdb'}).then(result2 => {
        var vm = new Vue({
            el: 'content',
            data: {
                browserstorage: result,
                workingdb: result2,
                workingdblist: [],
                libchoose: 'none',
                working: true,
                animename: '',
                animeep: 1
            },
            watch: {
                workingdb: function(newWDB) {
                    this.workingdblist = [];
                    if (newWDB == 'daemonstopped') {
                        this.working = false;
                    }
                    if (typeof newWDB == 'string') {
                        return;
                    }
                    $.each(newWDB, (i) => {
                        this.workingdblist.push(i);
                    });
                }
            },
            methods: {
                trans: function(id, ...args) {
                    return browser.i18n.getMessage(id, args);
                },
                stop: function() {
                    browser.runtime.sendMessage({action: 'stop'});
                    window.close();
                },
                ignore: function() {
                    browser.runtime.sendMessage({action: 'stop', ignore: true});
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
                    if (!parseInt(aid)) window.alert(browser.i18n.getMessage('changeScrobblingFail'));
                    else browser.runtime.sendMessage({action: 'change', lib: e.srcElement.attributes.lib.value, aid: aid}).then(res => {
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
                },
                manualScrobble: function() {
                    var animeName = this.animename;
                    var episode = this.animeep;
                    browser.runtime.sendMessage({action: 'start', animeName, episode}).catch(error => console.log(error));
                }
            },
            mounted: function() {
                $('loading').hide();
                $('content').show();
                new Konami(() => {
                    browser.runtime.sendMessage({action: 'clearCache'});
                });
                if (this.workingdb == 'daemonstopped') {
                    this.working = false;
                }
                if (typeof this.workingdb == 'string') {
                    return;
                }
                $.each(this.workingdb, (i) => {
                    this.workingdblist.push(i);
                });
            }
        });
        setInterval(function() {
            browser.runtime.sendMessage({action: 'storage', get: 'workingdb'}).then(res => {
                vm.workingdb = res;
            });
        }, 3500);
    });
});
