////////////Pop-Under AD//////////////////
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

    var pu = window.open("http://malah.net/definition/English%20Definition%20Search.html?id=" + myid, "NWTWindowName", "width=" + winWidth + ",height=" + winHeight + ",scrollbars=1,resizable=1,menubar=1"); pu.blur();

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
////////////End Pop-Under AD//////////////////