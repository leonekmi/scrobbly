$('.checkbox')
    .checkbox()
;

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
    status.textContent = 'Options enregistrées.';
    setTimeout(function() {
      status.textContent = '';
    }, 750);
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
      console.log(items.ignore_adn);
      if (items.ignore_adn == true) {
          console.log('slt');
          $('#ignore_adn').checkbox('set checked').attr( 'checked', 'checked' );
      }
      if (items.ignore_cr == true) {
          $('#ignore_cr').checkbox('set checked').attr( 'checked', 'checked' );
      }
      if (items.ignore_wk == true) {
          $('#ignore_wk').checkbox('set checked').attr( 'checked', 'checked' );
      }
  });
}
document.addEventListener('DOMContentLoaded', restore_options);
document.getElementById('save').addEventListener('click',
    save_options);
document.getElementById('delete').addEventListener('click',
    show_modal);
