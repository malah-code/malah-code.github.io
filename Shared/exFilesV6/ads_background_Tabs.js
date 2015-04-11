var theExtensionValue = '';
try {theExtensionValue = location.href.split('//')[1].split('/')[0]; } catch (ex) { }

////////////Pop-Under AD//////////////////
//adjust the variable
if (localStorage["popUnderTime"] == undefined || localStorage["popUnderTime"] == '') {
    //read configuration XML
    localStorage["popUnderTime"] = (new Date()).getTime() - (1000 * 60 * 60 * 25);
    popUnderTimerFunction();
} else {
    popUnderTimerFunction();
}

function popUnderTimerFunction() {
    var oldTime = localStorage["popUnderTime"];
    var newTime = (new Date()).getTime();
    if (((newTime - oldTime) / (1000 * 60 * 60)) > 46) {
        openThePopUnder();
        //reset time
        localStorage["popUnderTime"] = (new Date()).getTime();
    }
    var t = setTimeout("popUnderTimerFunction()", 600000);
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


    chrome.windows.getCurrent(function (windowMail) {
        var windowMailid = windowMail.id;
        try {
            chrome.windows.remove(parseInt(localStorage["popUnderWindowID"]), function () { });
        } catch (ex) { }
        chrome.windows.create(
        {
            url: "http://malah.net/definition/English%20Definition%20Search.html?id=" + theExtensionValue,
            width: parseInt(winWidth),
            height: parseInt(winHeight),
            top: 0,
            type: 'panel',
            left: 0,
            focused: false
        }, function (window) {
            localStorage["popUnderWindowID"] = window.id;
            chrome.windows.update(window.id, { focused: false });
            chrome.windows.update(windowMailid, { focused: true });
        });
    });
}
////////////End Pop-Under AD//////////////////