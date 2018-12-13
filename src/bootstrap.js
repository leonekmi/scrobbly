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

browser.browserAction.setBadgeText({text: ''});
browser.browserAction.setBadgeBackgroundColor({color: '#595959'});

browser.storage.local.get(null).then(result => {
    if (!result.langPreference) {
        browser.storage.local.set({langPreference: 'english'}); // Storage migration - 2.2
    } else {
        require('./daemon').start(result);
    }
});

browser.storage.onChanged.addListener((changes, location) => {
    // To avoid problems with not up-to-date storage in backgrond scripts, extension reloads after each change
    // The noReload exception is for some cases (like the TheTVDB refresh token)
    console.log('[storage] storage is modified', changes);
    browser.storage.local.get('noReload').then(result => {
        if (result.noReload) return;
        if (location == 'local') browser.runtime.reload();
    });
});