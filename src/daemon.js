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
/* eslint-disable no-console */

exports.start = function (storage) {
	// import
	var lkitsu = require('./libraries/kitsu');
	var lanilist = require('./libraries/anilist');
	var dptvdb = require('./dataproviders/thetvdb');
	var browser = require('webextension-polyfill');
	var countdown = require('easytimer.js');
	var retry = require('retry');
	// var $ = require('jquery');
	// init
	var libraries = [new lkitsu(storage.kitsu_at, storage.kitsu_uid), new lanilist(storage.anilist_at)];
	var dataProviders = [new dptvdb(storage.thetvdb_at)];
	var llibList = [];
	var ldpList = [];
	var workingdb = {};
	var cache = {};
	var activeTab = -1;
	var ready = false;
	var timer = null;
	var durationStorage = {};
	var lastRequestStorage = {};
	var scrobbled;
	var activeSettingsTab;

	libraries.forEach(lib => {
		if (lib.isReady()) {
			console.log(lib.info.name + ' init');
			ready = true;
			lib.init();
			if (lib.diag) lib.diag().then(res => {
				if (!res) {
					browser.notifications.create('authIssue', {
						type: 'basic',
						iconUrl: '/logos/logo512.png',
						title: browser.i18n.getMessage('authIssueTitle'),
						message: browser.i18n.getMessage('authIssueMessage', [lib.info.name])
					});
				} else {
					llibList.push(lib);
				}
				console.log(lib.info.name + ' diag', res);
			});
			else llibList.push(lib);
			cache[lib.info.name] = {};
		}
	});

	dataProviders.forEach(dp => {
		if (dp.isReady()) {
			console.log(dp.info.name + ' init');
			ready = true;
			dp.init();
			if (dp.diag) dp.diag().then(res => {
				if (!res) {
					browser.notifications.create('authIssue', {
						type: 'basic',
						iconUrl: '/logos/logo512.png',
						title: browser.i18n.getMessage('authIssueTitle'),
						message: browser.i18n.getMessage('authIssueMessage', [dp.info.name])
					});
				} else {
					ldpList.push(dp);
				}
				console.log(dp.info.name + ' diag', res);
			});
			else ldpList.push(dp);
			cache[dp.info.name] = {};
		}
	});

	if (!ready) {
		browser.notifications.create('firstRun', {
			type: 'basic',
			iconUrl: '/logos/logo512.png',
			title: browser.i18n.getMessage('firstRunTitle'),
			message: browser.i18n.getMessage('firstRunMessage')
		});
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

	// Listen

	function scrobble() {
		if (workingdb == 'daemonstopped') return;
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
		durationStorage = {};
		browser.browserAction.setBadgeText({text: '+'});
		browser.browserAction.setBadgeBackgroundColor({color: '#167000'});
	}

	function getLib(libname) {
		return new Promise(resolve => {
			llibList.forEach(lib => {
				if (lib.info.name == libname) {
					resolve(lib);
				}
			});
		});
	}

	function startScrobble(animeName, episode, senderId) {
		lastRequestStorage = {animeName, episode, senderId};
		if (workingdb == 'daemonstopped') return;
		var operation = retry.operation({forever: true});
		var operation2 = retry.operation({forever: true});
		scrobbled = false;
		var durations = [];
		var durProcessed = 0;
		var dpDurations = [];
		var dpProcessed = 0;
		activeTab = senderId;
		console.log('Tracked tab is now ' + activeTab);
		llibList.forEach((lib, index) => {
			lib.getAnimeData(animeName).then(result => {
				if (result.length == 0) {
					console.warn('No lib data for ' + lib.info.name);
					durProcessed += 1;
				} else {
					console.log(lib.info.name + ' cache', cache[lib.info.name]);
					if (cache[lib.info.name][animeName]) {
						lib.getProgress(cache[lib.info.name][animeName].id).then(progress => {
							workingdb[lib.info.name] = {anime: cache[lib.info.name][animeName], progress: progress, ep: episode, otherResults: result};
							console.log(lib.info.name, result);
							if (cache[lib.info.name][animeName].episodeDuration == 'none') {
								console.warn('No duration');
							} else {
								durations.push(cache[lib.info.name][animeName].episodeDuration);
							}
							durationStorage[lib.info.name] = cache[lib.info.name][animeName].episodeDuration;
							durProcessed += 1;
						});	
					} else {
						lib.getProgress(result[0].id).then(progress => {
							workingdb[lib.info.name] = {anime: result[0], progress: progress, ep: episode, otherResults: result};
							console.log(lib.info.name, result);
							if (result[0].episodeDuration == 'none') {
								console.warn('No duration');
							} else {
								durations.push(result[0].episodeDuration);
							}
							durationStorage[lib.info.name] = result[0].episodeDuration;
							durProcessed += 1;
						});	
					}
				}
				if (index == llibList.length - 1) {
					console.log('Processing timer');
					operation.attempt(currAtt => {
						if (durProcessed != llibList.length) {
							console.log('Wait for data loop');
							operation.retry({message: 'Wait for all data', obj: durations});
						} else {
							if (durations.length > 0) {
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
								console.warn('No duration from all sources, fallback on data providers');
								if (ldpList.length == 0) {
									console.warn('No data providers are loaded, manual scrobbling will be necessary!');
									browser.browserAction.setBadgeText({text: '!'});
									browser.browserAction.setBadgeBackgroundColor({color: '#dbd700'});
								} else {
									ldpList.forEach((dp, index) => {
										console.log(dp, index);
										dp.searchAnime(animeName).then(result => {
											dp.getAnime(result[0].id).then(res2 => {
												console.log(dp.info.name, result, res2);
												dpDurations.push(res2.episodeDuration);
												dpProcessed += 1;
											});
										});
										if (index == ldpList.length - 1) {
											console.log('Processing fallback timer');
											operation2.attempt(currAtt => {
												if (dpProcessed != ldpList.length) {
													operation2.retry({message: 'Wait for dataproviders dataloop', obj: dpDurations});
												} else {
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
												}
											});
										}
									});
								}
							}
						}
					});
				}
			});
		});
	}

	function changeScrobbling(lib, aid) {
		return new Promise(resolve => {
			var libworkingdb = workingdb[lib];
			getLib(lib).then(llib => {
				llib.getProgress(libworkingdb.otherResults[aid].id).then(progress => {
					workingdb[lib].anime = workingdb[lib].otherResults[aid];
					workingdb[lib].progress = progress;
					durationStorage[lib] = workingdb[lib].anime.episodeDuration;
					cache[lib][lastRequestStorage.animeName] = libworkingdb.otherResults[aid];
					var durStg = Object.values(durationStorage);
					var durationSum = durStg.reduce((acc, curVal) => {
						if (curVal != 'none') return acc + curVal;
					}, 0);
					console.log(durationSum);
					var durationAvg = durationSum / durStg.length / 4 * 3;
					var timeValues = timer.getTimeValues();
					timer.stop();
					timer.start({
						target: {
							minutes: durationAvg
						},
						startValues: timeValues
					});
					console.log('Change scrobbling success!', {lib, wdb: workingdb[lib], timer, durationAvg});
					resolve(true);
				});
			});
		});
	}

	function stopScrobble() {
		if (workingdb == 'daemonstopped') return;
		workingdb = {};
		if (timer != null) timer.stop();
		timer = null;
		durationStorage = {};
		activeTab = -1;
		lastRequestStorage = {};
		browser.browserAction.setBadgeText({text: ''});
	}

	// ?
	function listener(message, sender) {
		return new Promise(resolve => {
			console.log(message);
			console.log('Runtime event');
			switch (message.action) {
				case 'start':
					console.log('Starting !');
					startScrobble(message.animeName, message.episode, sender.tab.id);
					resolve(true);
					break;
				case 'change':
					console.log('Changing !');
					changeScrobbling(message.lib, message.aid).then(res => resolve(res));
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
				case 'toggleScrobble':
					console.log('scrobbling engine manage');
					if (workingdb == 'daemonstopped') {
						workingdb = {};
						browser.notifications.create('startDaemon', {
							type: 'basic',
							iconUrl: '/logos/logo512.png',
							title: browser.i18n.getMessage('startDaemonTitle'),
							message: browser.i18n.getMessage('startDaemonMessage')
						});
						console.log('Scrobbly daemon unlock!');
						resolve('started');
					} else {
						stopScrobble();
						workingdb = 'daemonstopped';
						browser.notifications.create('stopDaemon', {
							type: 'basic',
							iconUrl: '/logos/logo512.png',
							title: browser.i18n.getMessage('stopDaemonTitle'),
							message: browser.i18n.getMessage('stopDaemonMessage')
						});
						console.log('Scrobbly daemon lock!');
						resolve('stopped');
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
							console.log('Kitsu auth', message.email, message.passwd);
							fetch('https://kitsu.io/api/oauth/token', {method: 'POST', headers: {'Content-Type': 'application/x-www-form-urlencoded', Accept: 'application/json'}, body: 'grant_type=password&username=' + encodeURIComponent(message.email) + '&password=' + encodeURIComponent(message.passwd)}).then(response => {
								response.json().then(jsondata => {
									if (jsondata.error) {
										resolve({auth: 'error', service: 'kitsu'});
									} else {
										resolve({auth: 'success', service: 'kitsu', at: jsondata.access_token, rt: jsondata.refresh_token});
									}
								});
							});
							break;
						case 'thetvdb':
							console.log('TheTVDB auth');
							fetch('https://scrobbly.leonekmi.fr/thetvdb/auth', {method: 'POST', headers: {'Content-Type': 'application/x-www-form-urlencoded', Accept: 'application/json'}, body: 'uname=' + encodeURIComponent(message.uname) + '&uid=' + encodeURIComponent(message.uid)}).then(response => {
								response.json().then(jsondata => {
									if (jsondata.error) {
										resolve({auth: 'error', service: 'thetvdb'});
									} else {
										resolve({auth: 'success', service: 'thetvdb', jwt: jsondata.token});
									}
								});
							});
							break;
					}
					break;
				default:
					console.warn('Unknown request !', message.action, message, sender);
					resolve(false);
					break;
			}
			//resolve(true);
		});
	}
	function tabListener(tabId, changeInfo, tab) {
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
	function removeTabListener(tabId, removeInfo) {
		if (tabId == activeTab && typeof timer == 'object') {
			console.log('destroy countdown');
			stopScrobble();
		}
	}
	browser.runtime.onMessage.addListener(listener);
	browser.tabs.onUpdated.addListener(tabListener);
	browser.tabs.onRemoved.addListener(removeTabListener);
};