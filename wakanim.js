/*
Get Metadata from an episode of Wakanim.tv with Anilist Scrobbler
(c) leonekmi 2017
*/

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
    var regex = /https:\/\/www.wakanim.tv\/fr\/v2\/catalogue\/episode\/([a-zA-Z0-9-]+)\/([a-zA-Z0-9-]+)/;

    console.log(regex.test(document.documentURI));
    var isLoggedIn = false;
    var ChromeProcessed = false;
    chrome.storage.local.get('access_token', function (items) {
        if (typeof items['access_token'] == 'undefined') {
            console.log("User not logged in");
            isLoggedIn = false;
            ChromeProcessed = true;
        } else {
            console.log("User logged in");
            isLoggedIn = true;
            ChromeProcessed = true;
        }
    });
    await sleep(1500);
    console.log(ChromeProcessed);
    if (isLoggedIn == true) {
        if (regex.test(document.documentURI)) {
            /*function retrieveWindowVariables(variables) {
                var ret = {};

                var scriptContent = "";
                for (var i = 0; i < variables.length; i++) {
                    var currVariable = variables[i];
                    scriptContent += "if (typeof " + currVariable + " !== 'undefined') $('body').attr('tmp_" + currVariable + "', " + currVariable + ");\n"
                }

                var script = document.createElement('script');
                script.id = 'tmpScript';
                script.appendChild(document.createTextNode(scriptContent));
                (document.body || document.head || document.documentElement).appendChild(script);

                for (var i = 0; i < variables.length; i++) {
                    var currVariable = variables[i];
                    ret[currVariable] = $("body").attr("tmp_" + currVariable);
                    $("body").removeAttr("tmp_" + currVariable);
                }

                $("#tmpScript").remove();

                return ret;
            }

            var episodeId = retrieveWindowVariables(["DYNAMIC.MEDIA_ID"]);
            episodeId = episodeId['DYNAMIC.MEDIA_ID'];
            console.log(episodeId);*/
            //console.log(document.documentURI);

            var series_title = $('.episode_title').text();
            var episode_number = $('.episode_subtitle span span').text();
            console.log('Anilist Scrobbler debug : data : ' + series_title + " Episode " + episode_number);
            var query = `
            query ($id: Int, $page: Int, $search: String) {
              Page (page: $page) {
                media (id: $id, search: $search, type: ANIME) {
                  id
                  format
                  duration
                  title {
                    romaji
                    english
                  }
                  genres
                }
              }
            }
            `;

            console.log(series_title);

            var variables = {
                search: series_title,
                page: 1
            };

            var url = 'https://graphql.anilist.co',
                options = {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                    },
                    body: JSON.stringify({
                        query: query,
                        variables: variables
                    })
                };

            function handleResponse(response) {
                    console.log("API result !");
                    var jsonresponse = response.json();
                    jsonresponse.then(function (result) {
                        var anime_choose = 0;
                        console.log(result.data.Page.media);
                        if (result.data.Page.media.length > 1) {
                            var prompt_message = "La base de données d'Anilist a retourné plusieurs résultats, merci de choisir l'anime que vous regardez actuellement :"
                            result.data.Page.media.forEach(function (item, index) {
                                var temp_str = '\n[' + index + '] ' + item.title.romaji;
                                console.log(temp_str);
                                prompt_message = prompt_message.concat(temp_str);
                            });
                            console.log(prompt_message);
                            var anime_choose = prompt (prompt_message);
                            console.log(result.data.Page.media[anime_choose].duration);
                            var duration = result.data.Page.media[anime_choose].duration;
                            $( '.border-list' ).prepend('<li class="border-list_item"><span class="border-list_title">Anilist Scrobbler</span><span id="anilist_scrobbler_notice" class="border-list_text">Démarrage...</span></li>');
                        } else {
                            var duration = result.data.Page.media[0].duration;
                            $( '.border-list' ).prepend('<li class="border-list_item"><span class="border-list_title">Anilist Scrobbler</span><span id="anilist_scrobbler_notice" class="border-list_text">Démarrage...</span></li>');
                        };
                        chrome.storage.local.get('access_token', function (items) {
                            var query = `
                            query ($id: Int, $page: Int) {
                              Page (page: $page) {
                                media (id: $id) {
                                  id
                                  mediaListEntry {
                                      status
                                      progress
                                  }
                                }
                              }
                            }
                            `;
                            /*var query = `
                            query ($userId: Int) {
                                MediaList (userId: $userId) {
                                    status
                                    progress
                                }
                            }
                            `;*/
                            var variables = {
                                id: result.data.Page.media[anime_choose].id,
                                page: 1
                            };
                            var url = 'https://graphql.anilist.co',
                                options = {
                                    method: 'POST',
                                    headers: {
                                        'Content-Type': 'application/json',
                                        'Accept': 'application/json',
                                        'Authorization': 'Bearer ' + items['access_token'],
                                    },
                                    body: JSON.stringify({
                                        query: query,
                                        variables: variables
                                    })
                                };
                            function handleResponse(response) {
                                    console.log("API result 2 !");
                                    var jsonresponse2 = response.json();
                                    console.log(jsonresponse2);
                                    jsonresponse2.then(function (result2) {
                                        console.log(result2.data.Page.media[0].mediaListEntry == null);
                                        if (result2.data.Page.media[0].mediaListEntry == null) {
                                            console.log("Not in animelist");
                                            $( '#anilist_scrobbler_notice' ).text('Cet anime ne se trouve pas dans votre animelist, il sera automatiquement ajouté au bout de ' + (duration / 4 * 3) + ' minutes (au 3/4 de l\'épisode).');
                                            console.log("\"Scrobbling\" in " + (duration / 4 * 3 * 60) + " seconds");
                                            setTimeout(function() {
                                                console.log("Scrobbling !!");
                                                var query = `
                                                mutation ($mediaId: Int, $progress : Int, $MediaListStatus: MediaListStatus) {
                                                    SaveMediaListEntry (mediaId: $mediaId, progress: $progress, status: $MediaListStatus) {
                                                        id
                                                        progress
                                                    }
                                                }
                                                `;
                                                var variables = {
                                                    mediaId: result.data.Page.media[anime_choose].id,
                                                    progress: episode_number,
                                                    MediaListStatus: ""
                                                };
                                                var url = 'https://graphql.anilist.co',
                                                    options = {
                                                        method: 'POST',
                                                        headers: {
                                                            'Content-Type': 'application/json',
                                                            'Accept': 'application/json',
                                                            'Authorization': 'Bearer ' + items['access_token'],
                                                        },
                                                        body: JSON.stringify({
                                                            query: query,
                                                            variables: variables
                                                        })
                                                    };
                                                fetch(url, options);
                                                $( '#anilist_scrobbler_notice' ).text('L\'épisode a été ajouté à votre liste.');
                                            }, duration / 4 * 3 * 60 * 1000);
                                        } else {
                                            console.log(episode_number);
                                            console.log(result2.data.Page.media[0].mediaListEntry.progress);
                                            if (episode_number <= result2.data.Page.media[0].mediaListEntry.progress) {
                                                console.log("Episode already watched");
                                                $( '#anilist_scrobbler_notice' ).text('Cet épisode est déjà marqué comme vu, nous ne changeons rien.');
                                            } else if (episode_number == result2.data.Page.media[0].mediaListEntry.progress + 1) {
                                                console.log("Watching next episode");
                                                $( '#anilist_scrobbler_notice' ).text('Cet épisode sera automatiquement ajouté au bout de ' + (duration / 4 * 3) + ' minutes (au 3/4 de l\'épisode).');
                                                console.log("\"Scrobbling\" in " + (duration / 4 * 3 * 60) + " seconds");
                                                setTimeout(function() {
                                                    console.log("Scrobbling !!");
                                                    var query = `
                                                    mutation ($mediaId: Int, $progress : Int, $MediaListStatus: MediaListStatus) {
                                                        SaveMediaListEntry (mediaId: $mediaId, progress: $progress, status: $MediaListStatus) {
                                                            id
                                                            progress
                                                        }
                                                    }
                                                    `;
                                                    var variables = {
                                                        mediaId: result.data.Page.media[anime_choose].id,
                                                        progress: episode_number,
                                                        MediaListStatus: ""
                                                    };
                                                    var url = 'https://graphql.anilist.co',
                                                        options = {
                                                            method: 'POST',
                                                            headers: {
                                                                'Content-Type': 'application/json',
                                                                'Accept': 'application/json',
                                                                'Authorization': 'Bearer ' + items['access_token'],
                                                            },
                                                            body: JSON.stringify({
                                                                query: query,
                                                                variables: variables
                                                            })
                                                        };
                                                    fetch(url, options);
                                                    $( '#anilist_scrobbler_notice' ).text('Anilist Scrobbler : L\'épisode a été ajouté à votre liste.');
                                                }, duration / 4 * 3 * 60 * 1000);
                                            } else if (episode_number >= result2.data.Page.media[0].mediaListEntry.progress + 1) {
                                                console.log("Watching afters episodes");
                                                console.log("\"Scrobbling\" in " + (duration / 4 * 3 * 60) + " seconds");
                                                $( '#anilist_scrobbler_notice' ).text('Cet épisode sera automatiquement ajouté au bout de ' + (duration / 4 * 3) + ' minutes (au 3/4 de l\'épisode, attention : vous avez sauté un ou plusieurs épisodes selon votre liste).');
                                                setTimeout(function() {
                                                    console.log("Scrobbling !!");
                                                    var query = `
                                                    mutation ($mediaId: Int, $progress : Int, $MediaListStatus: MediaListStatus) {
                                                        SaveMediaListEntry (mediaId: $mediaId, progress: $progress, status: $MediaListStatus) {
                                                            id
                                                            progress
                                                        }
                                                    }
                                                    `;
                                                    var variables = {
                                                        mediaId: result.data.Page.media[anime_choose].id,
                                                        progress: episode_number,
                                                        MediaListStatus: "CURRENT"
                                                    };
                                                    var url = 'https://graphql.anilist.co',
                                                        options = {
                                                            method: 'POST',
                                                            headers: {
                                                                'Content-Type': 'application/json',
                                                                'Accept': 'application/json',
                                                                'Authorization': 'Bearer ' + items['access_token'],
                                                            },
                                                            body: JSON.stringify({
                                                                query: query,
                                                                variables: variables
                                                            })
                                                        };
                                                    fetch(url, options);
                                                    $( '#anilist_scrobbler_notice' ).text('L\'épisode a été ajouté à votre liste.');
                                                }, duration / 4 * 3 * 60 * 1000);
                                            } else {
                                                console.error("Ehhhh....");
                                            };
                                        }
                                    });
                            };
                            function handleError(e) {
                                    console.error(e);
                                    // window.alert("L'API d'Anilist semble down, impossible de chercher votre anime");
                            };

                            fetch(url, options).then(handleResponse)
                                               .catch(handleError);
                            });
                    });
            };
            function handleError(e) {
                    console.error(e);
                    window.alert("L'API d'Anilist semble down, impossible de chercher votre anime");
            };

            fetch(url, options).then(handleResponse)
                               .catch(handleError);


        }
    }
}

main();
