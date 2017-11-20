

// Saves options to chrome.storage
function save_options() {
  var titles = document.getElementById('titles').value;
  var ignore_adn = document.getElementById('ignore_adn').checked;
  var ignore_cr = document.getElementById('ignore_cr').checked;
  var ignore_wk = document.getElementById('ignore_wk').checked;
  var ignore_hulu = document.getElementById('ignore_hulu').checked;
  var ignore_nf = document.getElementById('ignore_nf').checked;
  var enable_altauth = document.getElementById('altauth_enable').checked;
  var altauth_clientid = document.getElementById('client_id').value;
  var altauth_clientsecret = document.getElementById('client_secret').value;
  chrome.storage.sync.set({
    title: titles,
    ignore_adn: ignore_adn,
    ignore_cr: ignore_cr,
    ignore_wk: ignore_wk,
    ignore_hulu: ignore_hulu,
    ignore_nf: ignore_nf,
    enable_altauth: enable_altauth,
    altauth_clientid: altauth_clientid,
    altauth_clientsecret: altauth_clientsecret,
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
    ignore_wk: false,
    ignore_hulu: false,
    ignore_nf: false,
    enable_altauth: false,
    altauth_clientid: "",
    altauth_clientsecret: "",
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
      if (items.ignore_hulu == true) {
          $('#ignore_hulu').attr( 'checked', 'checked' );
      }
      if (items.ignore_nf == true) {
          $('#ignore_nf').attr( 'checked', 'checked' );
      }
      if (items.enable_altauth == true) {
          $('#altauth_enable').attr( 'checked', 'checked' );
          $('#altauth_settings').attr('style', '');
      }
      if (items.altauth_clientid != "") {
          $('#client_id').val(items.altauth_clientid);
      }
      if (items.altauth_clientsecret != "") {
          $('#client_secret').val(items.altauth_clientsecret);
      }
	  $('.checkbox')
		.checkbox()
        .last().checkbox({
            onChecked: function() {
                $('#altauth_settings').attr('style', '');
            },
            onUnchecked: function() {
                $('#altauth_settings').attr('style', 'display: none;');
            }
        })
	  ;
  });
}
var adn_message = chrome.i18n.getMessage("settings_ignore", ["Anime Digital Network"]);
$('#adn_ignore label').text(adn_message);
var cr_message = chrome.i18n.getMessage("settings_ignore", ["Crunchyroll"]);
$('#cr_ignore label').text(cr_message);
var wk_message = chrome.i18n.getMessage("settings_ignore", ["Wakanim"]);
$('#wk_ignore label').text(wk_message);
var hulu_message = chrome.i18n.getMessage("settings_ignore", ["Hulu"]);
$('#hulu_ignore label').text(hulu_message);
var nf_message = chrome.i18n.getMessage("settings_ignore", ["Netflix"]);
$('#nf_ignore label').text(nf_message);
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
