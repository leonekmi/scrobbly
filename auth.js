$( 'body' ).empty();
$( 'body' ).append('<p>Veuillez patienter, un popup va apparaître et vous connecter</p>');
function getParameterByName(name, url) {
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
}
$.getJSON( "https://leonekmi.twittolabel.fr/anilist_backend/requestToken.php?code=" + getParameterByName("code") , function( data ) {
    // var continue_shell = confirm("Nous sommes connectés à votre compte ! (code d'accès généré : " + data.code + ")");
    chrome.storage.local.set({'access_token': data.code}, function() {
        console.log('Token saved in Chrome local Storage');
    });
});
chrome.storage.local.get('access_token', function (items) {
    console.log(items['access_token']);
});
window.alert('Bravo ! Vous êtes connecté, c\'est bon vous pouvez laisser opérer la magie de l\'extension');
