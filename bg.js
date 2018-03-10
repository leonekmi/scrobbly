//Listens for messages from content scripts
chrome.runtime.onMessage.addListener(function(request, sender) {
    if(request.action == "checkAudioPlaying") {

        var tab = sender.tab;

        //Send a response if there is audio playing or not
        chrome.tabs.sendMessage(tab.id, {action: "audioPlayingResponse", response: tab.audible});
    }
});



