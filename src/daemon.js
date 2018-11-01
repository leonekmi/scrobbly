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

exports.start = function (storage) {
	// import
	var lkitsu = require('./libraries/kitsu');
	var lanilist = require('./libraries/anilist');
	var browser = require('webextension-polyfill');
	var countdown = require('easytimer.js');
	//var $ = require('jquery');
	// init
	var libraries = [new lkitsu(storage.kitsu_at, storage.kitsu_uid), new lanilist(storage.anilist_at)];
	var llibList = [];
	var workingdb = {};
	var activeTab = -1;
	var timer;

	libraries.forEach(lib => {
		console.log(lib.isReady());
		if (lib.isReady()) {
			lib.init();
			llibList.push(lib);
		}
	});

	console.log(llibList);

	timer = new countdown();
	timer.stop();

	// Listen

	function scrobble() {
		llibList.forEach(lib => {
			lib.updateLibrary(workingdb[lib.info.name]);
		});
	}

	function startScrobble(animeName, episode, senderId) {
		var durations = [];
		activeTab = senderId;
		console.log('Tracked tab is now ' + activeTab);
		llibList.forEach((lib, index) => {
			lib.getAnimeData(animeName).then(result => {
				lib.getProgress(result[0].id).then(progress => {
					workingdb[lib.info.name] = {anime: result[0], progress: progress, ep: episode};
					console.log(result);
					if (result.episodeDuration == 'none') {
						console.warn('No duration')
					} else {
						durations.push(result[0].episodeDuration);
					}
					/*if (result.episodeDuration == 'none') {
						//
					} else {
						timer[lib.info.name] = new countdown();
						timer[lib.info.name].start({
							target: {
								minutes: result.episodeDuration / 4 * 3
							}
						});
						timer[lib.info.name].addEventListener('targetAchieved', ctimer => {
							scobble();
						});
					}*/
					if (index == llibList.length - 1) {
						console.log('start countdown');
						var durationAverage = 0;
						durations.forEach((duration) => {
							durationAverage += duration;
						});
						durationAverage = durationAverage / durations.length;
						timer = new countdown();
						timer.stop();
						timer.start({
							target: {
								minutes: durationAverage / 4 * 3
							}
						});
						timer.addEventListener('targetAchieved', ctimer => {
							console.log('End of the timer');
							scrobble();
						});
					}
				});
			});
		});


	}

	function stopScrobble() {
		workingdb = {};
		timer.stop();
		timer = null;
	}

	// ?
	async function listener(message, sender, sendResponse) {
		return new Promise(resolve => {
			console.log(message);
			console.log('Runtime event');
			switch (message.action) {
				case 'start':
					console.log('Starting !');
					startScrobble(message.animeName, message.episode, sender.tab.id);
					break;
				case 'scrobble':
					console.log('Scrobbling !');
					scrobble();
					break;
				case 'stop':
					console.log('Stopping !');
					stopScrobble();
					break;

			}
			resolve(true);
		});
	}
	async function tabListener(tabId, changeInfo, tab) {
		if (tabId == activeTab && typeof timer == 'object') {
			if (typeof changeInfo.url == 'string') {
				console.log('destroy countdown');
				stopScrobble();
			} else if (typeof changeInfo.audible == 'boolean') {
				if (changeInfo.audible) {
					if (!timer.isRunning()) {
						console.log('resume countdown');
						timer.start();
					}
				} else {
					if (timer.isRunning()) {
						console.log('pause countdown');
						timer.pause();
					}
				}
			}
		}
	}
	async function removeTabListener(tabId, removeInfo) {
		if (tabId == activeTab && typeof timer == 'object') {
			stopScrobble();
		}
	}
	browser.runtime.onMessage.addListener(listener);
	browser.tabs.onUpdated.addListener(tabListener);
	browser.tabs.onRemoved.addListener(removeTabListener);

	// browser.runtime.sendMessage({action: 'start', animeName: 'aho girl', episode: 1});
}