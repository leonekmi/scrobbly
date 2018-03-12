//Listens for messages from content scripts
chrome.runtime.onMessage.addListener(function(request, sender) {
    if(request.action == 'checkAudioPlaying') {

        var tab = sender.tab;

        //Send a response if there is audio playing or not
        if (!tab.audible | !tab.highlighted) {
            chrome.tabs.sendMessage(tab.id, {action: 'audioPlayingResponse', response: false});
        } else {
            chrome.tabs.sendMessage(tab.id, {action: 'audioPlayingResponse', response: true});
        }

    }
});
