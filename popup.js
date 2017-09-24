chrome.storage.local.get('access_token', function (items) {
    if (typeof items.access_token == 'string') {
        $('#label').text(chrome.i18n.getMessage("popup_logged_in"));
        $('.external.square.icon').attr('class', 'info circle icon');
        $('.ui.labeled.icon.blue.button').attr('class', 'ui labeled icon blue basic button')
    }
});
function localizeHtmlPage()
{
    //Localize by replacing __MSG_***__ meta tags
    var objects = document.getElementsByTagName('html');
    for (var j = 0; j < objects.length; j++)
    {
        var obj = objects[j];

        var valStrH = obj.innerHTML.toString();
        var valNewH = valStrH.replace(/__MSG_(\w+)__/g, function(match, v1)
        {
            return v1 ? chrome.i18n.getMessage(v1) : "";
        });

        if(valNewH != valStrH)
        {
            obj.innerHTML = valNewH;
        }
    }
}

localizeHtmlPage();