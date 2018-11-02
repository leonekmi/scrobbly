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
                result2: result2,
                workingdb: []
            },
            methods: {
                trans: function(id, ...args) {
                    return browser.i18n.getMessage(id, args);
                }
            },
            created: function() {
                if (typeof this.result2 == 'string') {
                    this.workingdb = this.result2;
                    return;
                }
                $.each(this.result2, (i, val) => {
                    val.libname = i;
                    this.workingdb.push(val);
                });
                console.log(this.workingdb);
            }
        });
    });
});
