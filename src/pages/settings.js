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

require('./settings.scss');
require('./fomantic');
/* global $ */
var Vue = require('vue/dist/vue');
var browser = require('webextension-polyfill');
var pendingChanges = {noReload: false};

$(function() {
    $('#header').transition('fade up');
    $('#content').transition('fade down');
});

browser.storage.local.get(null).then(result => {
    browser.runtime.sendMessage({action: 'storage', get: 'workingdb', source: 'settings'}).then(result2 => {
        new Vue({
            el: 'content',
            data: {
                browserstorage: result,
                workingdb: result2,
                deletevar: '',
                deletemodaltitle: '',
                deletemodalmessage: ''
            },
            watch: {
                deletevar: function(nvar) {
                    this.deletemodaltitle = browser.i18n.getMessage('deleteModalTitle', [nvar]);
                    this.deletemodalmessage = browser.i18n.getMessage('deleteModalMessage', [nvar]);
                }
            },
            methods: {
                trans: function(id, ...args) {
                    return browser.i18n.getMessage(id, args);
                },
                showModal: function(modal) {
                    $('#' + modal + 'modal').modal('show');
                },
                save: function() {
                    browser.storage.local.set(pendingChanges);
                },
                loginKitsu: function() {
                    var email = $('#emailkitsu').val();
                    var passwd = $('#passwordkitsu').val();
                    browser.runtime.sendMessage({action: 'auth', service: 'kitsu', email: email, passwd: passwd}).then(result => {
                        if (result.auth == 'success') {
                            fetch('https://kitsu.io/api/edge/users?filter[self]=true', {method: 'GET', headers: {'Content-Type': 'application/vnd.api+json', Accept: 'application/vnd.api+json', Authorization: 'Bearer ' + result.at}}).then(data => {
                                data.json().then(userdata => {
                                    pendingChanges.kitsu_at = result.at;
                                    pendingChanges.kitsu_rt = result.rt;
                                    pendingChanges.kitsu_uid = userdata.data[0].id;
                                    console.log(pendingChanges);
                                    $('#kitsu').html('<i class="checkmark icon"></i>'+browser.i18n.getMessage('loggedIn'));
                                });
                            });
                        } else {
                            alert(browser.i18n.getMessage('badPassword'));
                        }
                    });
                },
                loginTheTVDB: function() {
                    var uname = $('#usernamethetvdb').val();
                    var uid = $('#uidthetvdb').val();
                    browser.runtime.sendMessage({action: 'auth', service: 'thetvdb', uname, uid}).then(result => {
                        if (result.auth == 'success') {
                            pendingChanges.thetvdb_at = result.jwt;
                            console.log(pendingChanges);
                            $('#thetvdb').html('<i class="checkmark icon"></i>'+browser.i18n.getMessage('loggedIn'));
                        } else {
                            alert(browser.i18n.getMessage('badLoginTTD'));
                        }
                    });
                },
                showDeleteModal: function(service) {
                    this.deletevar = service;
                    $('#deletemodal').modal('show');
                },
                deleteLogin: function() {
                    switch (this.deletevar) {
                        case 'Anilist':
                            pendingChanges.anilist_at = null;
                            $('#anilist_delete').addClass('disabled');
                            break;
                        case 'Kitsu':
                            pendingChanges.kitsu_at = null;
                            pendingChanges.kitsu_uid = null;
                            $('#kitsu_delete').addClass('disabled');
                            break;
                        case 'TheTVDB':
                            pendingChanges.thetvdb_at = null;
                            $('#thetvdb_delete').addClass('disabled');
                            break;
                    }
                    console.log(this.deletevar + 'account deleted!');
                    console.log(pendingChanges);
                }
            },
            mounted: function() {
                $('.ui.inline.dropdown').dropdown({
                    onChange: function(val) {
                        pendingChanges.langPreference = val;
                        console.log(pendingChanges);
                    }
                });
                $('.ui.inline.dropdown').dropdown('set selected', this.browserstorage.langPreference);
                $('.ui.checkbox').checkbox({
                    onChange: function() {
                        var id = this.id;
                        var status = (this.parentElement.classList.contains('checked')) ? true:false;
                        if (id != 'reScrobble') {
                            pendingChanges['popup_' + id] = status;
                        } else {
                            pendingChanges[id] = status;
                        }
                        console.log(pendingChanges);
                    }
                });
                var optBoxes = ['desc', 'img', 'epCount', 'reScrobble'];
                optBoxes.forEach(val => {
                    if (val != 'reScrobble') {
                        if (this.browserstorage['popup_' + val]) {
                            console.log(val + ' yes');
                            $('#'+val).parent().checkbox('set checked');
                        }
                    } else {
                        if (this.browserstorage[val]) {
                            console.log(val + ' yes');
                            $('#'+val).parent().checkbox('set checked');
                        }
                    }
                });
            }
        });
        browser.runtime.onMessage.addListener((message) => {
            return new Promise(resolve => {
                if (message.auth == 'success') {
                    switch (message.service) {
                        case 'anilist':
                            console.log('token', message.at);
                            pendingChanges.anilist_at = message.at;
                            console.log(pendingChanges);
                            $('#anilist').html('<i class="checkmark icon"></i>'+browser.i18n.getMessage('loggedIn'));
                            resolve(true);
                            break;
                    }
                }
            });
        });
    });
});