chrome.storage.local.get('access_token', function (items) {
    if (typeof items.access_token == 'string') {
        $('#label').text('Vous êtes déjà connecté');
        $('.external.square.icon').attr('class', 'info circle icon');
        $('.ui.labeled.icon.blue.button').attr('class', 'ui labeled icon blue basic button')
    }
});
