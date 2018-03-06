//Listens for messages from content scripts
chrome.runtime.onMessage.addListener(function(request, sender) {
    if(request.action == "checkAudioPlaying") {
        var tabName = request.tabName;

        //Find tab object from the playing tab (by its title)
        chrome.tabs.query({title: tabName}, function(tabs) {
            if(tabs.length > 0) {
                //Send a response if there is audio playing or not
                chrome.tabs.sendMessage(tabs[0].id, {action: "audioPlayingResponse", response: tabs[0].audible});
            }
        });
    }
});



