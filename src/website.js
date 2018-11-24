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

// import
var wcrunchyroll = require('./websites/crunchyroll').api;
var wnetflix = require('./websites/netflix').api;
var wplex = require('./websites/plex').api;
var wwakanim = require('./websites/wakanim').api;
var wemby = require('./websites/emby').api;
var whidive = require('./websites/hidive').api;
var wadn = require('./websites/adn').api;
//var $ = require('jquery');
// init
var libraries = [new wcrunchyroll(), new wnetflix(), new wplex(), new wwakanim(), new wemby(), new whidive(), new wadn()];
var llibList = [];

libraries.forEach(lib => {
    if (lib.isUsable()) {
        lib.init();
        llibList.push(lib);
    }
});

console.log('Project Scrobbly : website init, websites scripts : ', llibList);