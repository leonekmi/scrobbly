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
	var ready = false;
	var timer;
	var scrobbled;
	var activeSettingsTab;

	libraries.forEach(lib => {
		console.log(lib.isReady());
		if (lib.isReady()) {
			lib.init();
			llibList.push(lib);
		}
	});

	if (llibList.length == 0) {
		browser.notifications.create('firstRun', {
			type: 'basic',
			iconUrl: '/logos/logo512.png',
			title: browser.i18n.getMessage('firstRunTitle'),
			message: browser.i18n.getMessage('firstRunMessage')
		});
	} else {
		ready = true;
	}

	browser.notifications.onClicked.addListener(notificationId => {
		if (notificationId == 'firstRun') {
			browser.notifications.clear('firstRun');
			browser.tabs.create({
				url: browser.runtime.getURL('pages/settings.html')
			});
		}
	});

	console.log(llibList);

	timer = new countdown();
	timer.stop();

	// Listen

	function scrobble() {
		if (scrobbled) {
			return;
		}
		llibList.forEach(lib => {
			lib.updateLibrary(workingdb[lib.info.name]);
		});
		timer.stop();
		timer = null;
		activeTab = -1;
		scrobbled = true;
		browser.browserAction.setBadgeText({text: '+'});
		browser.browserAction.setBadgeBackgroundColor({color: '#167000'});
	}

	function startScrobble(animeName, episode, senderId) {
		scrobbled = false;
		var durations = [];
		activeTab = senderId;
		console.log('Tracked tab is now ' + activeTab);
		llibList.forEach((lib, index) => {
			lib.getAnimeData(animeName).then(result => {
				lib.getProgress(result[0].id).then(progress => {
					workingdb[lib.info.name] = {anime: result[0], progress: progress, ep: episode};
					console.log(result);
					if (result[0].episodeDuration == 'none') {
						console.warn('No duration');
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
						if (durations.length == 0) {
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
							browser.browserAction.setBadgeText({text: 'OK'});
							browser.browserAction.setBadgeBackgroundColor({color: '#167000'});
							timer.addEventListener('targetAchieved', ctimer => {
								console.log('End of the timer');
								scrobble();
							});
						} else {
							browser.browserAction.setBadgeText({text: '!'});
							browser.browserAction.setBadgeText({color: '#dbd700'});
							console.warn('No duration from all sources, this is a problem, Agent Johnson');
						}

					}
				});
			});
		});


	}

	function stopScrobble() {
		workingdb = {};
		timer.stop();
		timer = null;
		activeTab = -1;
		browser.browserAction.setBadgeText({text: ''});
	}

	// ?
	async function listener(message, sender) {
		return new Promise(resolve => {
			console.log(message);
			console.log('Runtime event');
			switch (message.action) {
				case 'start':
					console.log('Starting !');
					startScrobble(message.animeName, message.episode, sender.tab.id);
					resolve(true);
					break;
				case 'scrobble':
					console.log('Scrobbling !');
					scrobble();
					resolve(true);
					break;
				case 'stop':
					console.log('Stopping !');
					stopScrobble();
					resolve(true);
					break;
				case 'storage':
					console.log('Storage request !');
					switch (message.get) {
						case 'workingdb':
							resolve((ready) ? workingdb:'notready');
							break;
						default:
							console.warn('Unknown data element !', message.get, message, sender);
							resolve(false);
							break;
					}
					if (message.source == 'settings') {
						activeSettingsTab = sender.tab.id;
					}
					break;
				case 'auth':
					console.log('Setting (auth) request !');
					switch (message.service) {
						case 'anilist':
							console.log('AniList auth', message.response);
							browser.tabs.sendMessage(activeSettingsTab, {
								auth: 'success',
								service: 'anilist',
								at: message.response.access_token
							});
							resolve(true);
							break;
						case 'kitsu':
							console.log('Kitsu auth', message.username, message.passwd);
							fetch('https://kitsu.io/api/oauth/token', {method: 'POST', headers: {'Content-Type': 'application/x-www-form-urlencoded', Accept: 'application/json'}, body: 'grant_type=password&username=' + encodeURIComponent(message.email) + '&password=' + encodeURIComponent(message.passwd)}).then(response => {
								response.json().then(jsondata => {
									if (jsondata.error) {
										resolve({auth: 'error', service: 'kitsu'});
									} else {
										resolve({auth: 'success', service: 'kitsu', at: jsondata.access_token});
									}
								});
							});
					}
					break;
				default:
					console.warn('Unknown request !', message.action, message, sender)
					resolve(false);
					break;
			}
			//resolve(true);
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