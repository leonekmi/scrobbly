var $ = require('../Semantic-UI-CSS/semantic');
var Vue = require('vue/dist/vue');
var browser = require('webextension-polyfill');
var pendingChanges = {};

$(function() {
    $('#header').transition('fade up');
    $('#content').transition('fade down');
});

browser.storage.local.get(null).then(result => {
    browser.runtime.sendMessage({action: 'storage', get: 'workingdb', source: 'settings'}).then(result2 => {
        var vm = new Vue({
            el: 'content',
            data: {
                browserstorage: result,
                workingdb: result2
            },
            methods: {
                trans: function(id, ...args) {
                    return browser.i18n.getMessage(id, args);
                },
                showModal: function(modal) {
                    $('#' + modal + 'modal').modal('show');
                },
                save: function(e) {
                    browser.storage.local.set(pendingChanges);
                },
                loginKitsu: function(e) {
                    var email = $('#emailkitsu').val();
                    var passwd = $('#passwordkitsu').val();
                    browser.runtime.sendMessage({action: 'auth', service: 'kitsu', email: email, passwd: passwd}).then(result => {
                        if (result.auth == 'success') {
                            fetch('https://kitsu.io/api/edge/users?filter[self]=true', {method: 'GET', headers: {'Content-Type': 'application/vnd.api+json', Accept: 'application/vnd.api+json', Authorization: 'Bearer ' + result.at}}).then(data => {
                                data.json().then(userdata => {
                                    pendingChanges.kitsu_at = result.at;
                                    pendingChanges.kitsu_uid = userdata.data[0].id;
                                    console.log(pendingChanges);
                                    $('#kitsu').html('<i class="checkmark icon"></i>'+browser.i18n.getMessage('loggedIn'));
                                });
                            });
                            /*console.log('token', result.at, result.uid);
                            pendingChanges.kitsu_at = result.at;
                            pendingChanges.kitsu_uid = result.uid;
                            console.log(pendingChanges);
                            $('#kitsu').html('<i class="checkmark icon"></i>'+browser.i18n.getMessage('loggedIn'));*/
                        } else {
                            alert('ow...');
                        }
                    });
                }
            }
        });
        browser.runtime.onMessage.addListener((message, sender) => {
            return new Promise(resolve => {
                if (message.auth == 'success') {
                    switch (message.service) {
                        case 'anilist':
                            console.log('token', message.at);
                            pendingChanges.anilist_at = message.at;
                            console.log(pendingChanges);
                            $('#anilist').html('<i class="checkmark icon"></i>'+browser.i18n.getMessage('loggedIn'));
                            break;
                    }
                }
            });
        })
    });
});