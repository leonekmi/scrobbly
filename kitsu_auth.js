/*
Kitsu login
(c) leonekmi 2018
*/
function localizeHtmlPage() {
    //Localize by replacing __MSG_***__ meta tags
    var objects = document.getElementsByTagName('html');
    for (var j = 0; j < objects.length; j++) {
        var obj = objects[j];

        var valStrH = obj.innerHTML.toString();
        var valNewH = valStrH.replace(/__MSG_(\w+)__/g, function(match, v1) {
            return v1 ? chrome.i18n.getMessage(v1) : '';
        });

        if (valNewH != valStrH) {
            obj.innerHTML = valNewH;
        }
    }
}
function submitlogin() {
    var url = 'https://kitsu.io/api/oauth/token',
        options = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Accept': 'application/json'
            },
            body: 'grant_type=password&username=' + encodeURIComponent($('#login').val()) + '&password=' + encodeURIComponent($('#password').val())
        };

    

    function handleResponse(data) {
        data.json().then(function (data) {
            if (data.error) {
                alert('Bad password / API Error');
            } else {
                var url = 'https://kitsu.io/api/edge/users?filter[self]=true',
                    options = {
                        method: 'GET',
                        headers: {
                            'Content-Type': 'application/vnd.api+json',
                            'Accept': 'application/vnd.api+json',
                            'Authorization': 'Bearer ' + data.access_token
                        },
                    };

                function handleResponse2(data2) {
                    data2.json().then(function (data2) {
                        chrome.storage.local.set({'kitsu_at': data.access_token, 'kitsu_userid': data2.data[0].id}, function() {
                            alert(chrome.i18n.getMessage('connected'));
                        });
                    });
                }

                fetch(url, options).then(handleResponse2);
            }
        });
    }

    fetch(url, options).then(handleResponse);
}
localizeHtmlPage();
$('#submitbtn').text(chrome.i18n.getMessage('popup_login', 'Kitsu'));
$('.sub.header').text(chrome.i18n.getMessage('popup_login', 'Kitsu'));
$('#submitbtn').click(submitlogin);