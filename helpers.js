/*
Global Helpers for Anilist Scrobbler
*/

function scrobbleAnime(animeId, episode) {
    chrome.storage.local.get('access_token', function (items) {
        console.log("Scrobbling !!");
        var query = `
        mutation ($mediaId: Int, $progress : Int, $status: MediaListStatus) {
            SaveMediaListEntry (mediaId: $mediaId, progress: $progress, status: $status) {
                id
                progress
                status
            }
        }
        `;
        var variables = {
            mediaId: animeId,
            progress: episode,
            status: "CURRENT"
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
    });
}
function retrieveWindowVariables(variables) {
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
function getAnimeProgressHelper (animeId) {
    return new Promise(resolve => {
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
            var variables = {
                id: animeId,
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
                resolve(response);
            }
            function handleError(e) {
                console.error(e);
            }
            fetch(url, options).then(handleResponse).catch(handleError);
        });
    });
}
async function getAnimeProgress(animeId) {
    var result;
    result = await getAnimeProgressHelper(animeId);
    return result;
}
console.log('Anilist Scrobbler init done');
