

// Saves options to chrome.storage
function save_options() {
  var titles = document.getElementById('titles').value;
  var ignore_adn = document.getElementById('ignore_adn').checked;
  var ignore_cr = document.getElementById('ignore_cr').checked;
  var ignore_wk = document.getElementById('ignore_wk').checked;
  chrome.storage.sync.set({
    title: titles,
    ignore_adn: ignore_adn,
    ignore_cr: ignore_cr,
    ignore_wk: ignore_wk
  }, function() {
    // Update status to let user know options were saved.
    var status = document.getElementById('status');
    status.textContent = chrome.i18n.getMessage("settings_saved");
    setTimeout(function() {
      status.textContent = '';
    }, 1250);
  });
}

function show_modal() {
    $('.ui.basic.modal')
        .modal({
            closable  : false,
            onDeny    : function(){
                return true;
            },
            onApprove : function() {
                chrome.storage.local.remove('access_token');
                location.reload();
            }
        })
        .modal('show')
    ;
}

function restore_options() {
  chrome.storage.sync.get({
    title: "romaji",
    ignore_adn: false,
    ignore_cr: false,
    ignore_wk: false
  }, function(items) {
      $('#titles')
          .dropdown('set selected', items.title)
      ;
      console.log(items.ignore_cr);
      if (items.ignore_adn == true) {
          $('#ignore_adn').attr( 'checked', 'checked' );
      }
      if (items.ignore_cr == true) {
          $('#ignore_cr').attr( 'checked', 'checked' );
      }
      if (items.ignore_wk == true) {
          $('#ignore_wk').attr( 'checked', 'checked' );
      }
	  $('.checkbox')
		.checkbox()
	  ;
  });
}
var adn_message = chrome.i18n.getMessage("settings_ignore", ["Anime Digital Network"]);
$('#adn_ignore label').text(adn_message);
var cr_message = chrome.i18n.getMessage("settings_ignore", ["Crunchyroll"]);
$('#cr_ignore label').text(cr_message);
var wk_message = chrome.i18n.getMessage("settings_ignore", ["Wakanim"]);
$('#wk_ignore label').text(wk_message);
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
document.addEventListener('DOMContentLoaded', restore_options);
document.getElementById('save').addEventListener('click',
    save_options);
document.getElementById('delete').addEventListener('click',
    show_modal);
