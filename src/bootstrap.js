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

// Because storage API is promise/callback-based, i prefer to preload all the storage in a global var
// Due to the execution way of V8, i think that's the best way to not pain with ton of promises

var browser = require('webextension-polyfill');

console.log('Project Scrobbly, bootstrap !');

browser.storage.local.get(null).then(result => {
    var daemon = require('./daemon').start(result);
});

browser.storage.onChanged.addListener((changes, location) => {
    // To avoid problems with not up-to-date storage in backgrond scripts, extension reloads after each change
    // The noReload exception is for development purposes
    browser.storage.local.get('noReload').then(result => {
        if (result.noReload) return;
        if (location == 'local') browser.runtime.reload();
    });
});