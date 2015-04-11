var ChannelTitle = '';
var Channellink = '';
var ChannelChannelPubDate = '';
var Channeldescription = '';
var Channellanguage = '';
var theImagetitle = '';
var theImageLinkTo = '';
var fruitvegbasket = new Array();
var firstTimegetData = true;
var testnotificationWindow;
var isNotificationWindowOppened = false;
var CurrentAllNotificationQueue = '';
var showNotificationsOption = true;


if (localStorage["firstTime"] == undefined || localStorage["firstTime"] == '') {
    //read configuration XML
    localStorage["optShowNotifications"] = '1';
    readXMLConfig();


}


function init() {
    if (localStorage["optShowNotifications"] == undefined || localStorage["optShowNotifications"] == '')
        localStorage["optShowNotifications"] = '1'; //default show notifications

    showNotificationsOption = (localStorage["optShowNotifications"] == '1');
}

$(document).ready(function () {
    init();

    //read configuration XML
    readXMLConfig();

    //create new array for all articles
    fruitvegbasket = new Array();

    //getting data
    GetDataFromScratch(0);

    //make timer to get data every several seconds (60 sec)
    timerMeEverySeconds();
});

function timerMeEverySeconds() {
    window.setTimeout(function () {
        try {
            fruitvegbasket = new Array();
            GetDataFromScratch(0);
        } catch (ex) { }
        //timer again after 1000
        timerMeEverySeconds();
    }, MainTimer);
}

//main Method
var tempSelectedRssItems = new Array();
function GetDataFromScratch(index) {
    //get the current Item
    if (index == 0) {
        //this is the first Rss item , then we must get the array from scratch
        tempSelectedRssItems = new Array();
        for (ip = 0; ip < parentSites.length; ip++) {
            for (i = 0; i < parentSites[ip].siteItems.length; i++) {
                for (j1 = 0; j1 < parentSites[ip].siteItems[i].rssItems.length; j1++) {
                    if (parentSites[ip].siteItems[i].rssItems[j1].selected)
                        tempSelectedRssItems.push(parentSites[ip].siteItems[i].rssItems[j1]);
                }
            }
        }

        //reset notification queue
        CurrentAllNotificationQueue = '';
    }

    //check if it's after last item
    if (index >= tempSelectedRssItems.length) {
        //after last item
        //then reset the temp var and then check the notification if there is any
        StartNotification(); //this will check if there is notifications queue then will show notification
        return; //return do nothing
    }

    $.ajax({
        url: tempSelectedRssItems[index].link,
        dataType: 'xml',
        data: null,
        success: function (DataItem) {


            //save main values to rssItems
            for (ip = 0; ip < parentSites.length; ip++) {
                for (i = 0; i < parentSites[ip].siteItems.length; i++) {
                    for (j1 = 0; j1 < parentSites[ip].siteItems[i].rssItems.length; j1++) {
                        if (parentSites[ip].siteItems[i].rssItems[j1].id == tempSelectedRssItems[index].id) {//channel title
                            parentSites[ip].siteItems[i].rssItems[j1].ChannelTitle = $(DataItem).find('channel>title').text();
                            parentSites[ip].siteItems[i].rssItems[j1].Channellink = $(DataItem).find('channel>link').text();
                            parentSites[ip].siteItems[i].rssItems[j1].ChannelChannelPubDate = $(DataItem).find('channel>ChannelPubDate').text();
                            parentSites[ip].siteItems[i].rssItems[j1].Channeldescription = $(DataItem).find('channel>description').text();
                            parentSites[ip].siteItems[i].rssItems[j1].Channellanguage = $(DataItem).find('channel>language').text();

                            //get image
                            parentSites[ip].siteItems[i].rssItems[j1].ChannelImagetitle = $(DataItem).find('channel>image').find('title').text();
                            parentSites[ip].siteItems[i].rssItems[j1].ChannelImageSrcUrl = $(DataItem).find('channel>image').find('url').text();
                            parentSites[ip].siteItems[i].rssItems[j1].ChannelImageLinkTo = $(DataItem).find('channel>image').find('link').text();
                            break;
                        }
                    }
                }
            }
            //end save main values to rssItems

            var currentRssItem_id = tempSelectedRssItems[index].id;
            var maxItemCount = parseInt(tempSelectedRssItems[index].setting_number.toString());
            var cntNowTmp = 1;
            var fruitvegbasketTemp = new Array();
            $(DataItem).find('channel>item').each(function () {
                if (cntNowTmp <= maxItemCount) {
                    itemTitle = $(this).find('title').text();
                    itemlink = $(this).find('link').text();
                    itempubDate = $(this).find('pubDate').text();
                    itemdate = $(this).find('date').text();
                    itemguid = $(this).find('guid').text();
                    if ($.trim(itemguid) == '')
                        itemguid = itemlink;
                    itemdescription = $(this).find('description').text();
                    //if itemdescription empty try get it from other sources
                    if ($.trim($('<div>' + itemdescription + '</div>').text()) == '') {
                        //get the description from tag "itunes:summary"
                        itemdescription = findItunesSummaryContentTag(this);
                    }

                    itemdate = $(this).find('date').text();

                    //get image from image field if found
                    var imgTagName = 'image';
                    if ($(this).find('Image').length > 0)
                        imgTagName = 'Image';
                    if ($(this).find(imgTagName).length > 0) {
                        //get image from this tag and add it to the discription
                        var addImgTitle = '';
                        var addImglink = '';
                        if ($($(this).find(imgTagName)[0]).find('title').length > 0)
                            addImgTitle = $($(this).find(imgTagName)[0]).find('title').text();
                        if ($($(this).find(imgTagName)[0]).find('link').length > 0)
                            addImglink = $($(this).find(imgTagName)[0]).find('link').text();
                        if (addImglink == '') {
                            addImglink = $($(this).find(imgTagName)[0]).text();
                        }
                        if (addImglink != '' && addImglink.toLowerCase().indexOf('http://') == -1) {
                            if ($('<div>' + $(this).find('description').text() + '</div>').find('img').length > 0) {
                                try {
                                    addImglink = $($('<div>' + $(this).find('description').text() + '</div>').find('img')[0]).attr('src');
                                } catch (ex) { }
                            } else {
                                addImglink = cnfg_SiteBaseUrl + addImglink;
                            }
                        }
                        addImg = "<img src='" + addImglink + "' title='" + addImgTitle + "' />";
                        itemdescription = addImg + $.trim($('<div>' + itemdescription + '</div>').text());
                    } else if ($(this).find('media:content media:thumbnail').length > 0) {
                        var addImgTitle = '';
                        var addImglink = '';
                        if ($($(this).find('media:title')[0]).length > 0)
                            addImgTitle = $($(this).find('media:title')[0]).text();
                        addImglink = $($(this).find('media:thumbnail')[0]).attr('href');
                        addImg = "<img src='" + addImglink + "' title='" + addImgTitle + "' />";
                        itemdescription = addImg + $.trim($('<div>' + itemdescription + '</div>').text());
                    } else if ($(this).find('enclosure').length > 0 && $($(this).find('enclosure')[0]).attr('url') != undefined && $($(this).find('enclosure')[0]).attr('url') != '' && $($(this).find('enclosure')[0]).attr('type') != undefined && ($($(this).find('enclosure')[0]).attr('type').toLowerCase() == 'image/pjpeg' || $($(this).find('enclosure')[0]).attr('type').toLowerCase() == 'image/gif')) {
                        var addImglink = $($(this).find('enclosure')[0]).attr('url');
                        var addImg = "<img src='" + addImglink + "'  />";
                        itemdescription = addImg + $.trim($('<div>' + itemdescription + '</div>').text());
                    } else {
                        //try get data from media:content tag
                        var addImglink = findImageInMediaContentTag(this);
                        if (addImglink != '') {
                            var addImg = "<img src='" + addImglink + "'  />";
                            itemdescription = addImg + $.trim($('<div>' + itemdescription + '</div>').text());
                        } else if ($('<div>' + $(this).find('description').text() + '</div>').find('img').length > 0) {
                            try {
                                var imgTag = $('<div><img src="' + $($('<div>' + $(this).find('description').text() + '</div>').find('img')[0]).attr('src') + '" /></div>').html();
                                itemdescription = imgTag + $.trim($('<div>' + itemdescription + '</div>').text());
                            } catch (ex) { }
                        }
                    }
                    //end get image from image field if found


                    var theItem = new newsItem();

                    theItem.itemTitle = itemTitle;
                    theItem.itemlink = itemlink
                    theItem.itempubDate = itempubDate;
                    theItem.itemdate = itemdate;
                    theItem.itemguid = itemguid;
                    theItem.itemdescription = itemdescription;
                    theItem.itemdate = itemdate;
                    theItem.sourceRss_text = tempSelectedRssItems[index].text;
                    theItem.sourceRss_id = tempSelectedRssItems[index].id;
                    theItem.sourceRss_largeimage = tempSelectedRssItems[index].largeimage;
                    theItem.sourceRss_smallimage = tempSelectedRssItems[index].smallimage;
                    theItem.sourceRss_setting_showNotifications = tempSelectedRssItems[index].setting_showNotifications;

                    fruitvegbasket.push(theItem);
                    fruitvegbasketTemp.push(theItem);
                }
                cntNowTmp++;
            });

            //notification code
            if (tempSelectedRssItems[index].setting_showNotifications) {

                //check differeance for notification
                var AllNotificationQueueTemp = '';
                if (localStorage["OldArts" + currentRssItem_id] == undefined || localStorage["OldArts" + currentRssItem_id] == '') {
                    localStorage["OldArts" + currentRssItem_id] = ''; //default
                }
                var OldArts = localStorage["OldArts" + currentRssItem_id];

                //check if exists then go do nothing
                for (i = 0; i < fruitvegbasketTemp.length; i++) {
                    var varNowItem = fruitvegbasketTemp[i];
                    if (OldArts.indexOf(varNowItem.itemguid) > -1) {
                        //Exists then do nothing
                    }
                    else {
                        //not exists , then add to notification pool
                        if (AllNotificationQueueTemp != '')
                            AllNotificationQueueTemp += '\n' + varNowItem.itemguid;
                        else
                            AllNotificationQueueTemp = varNowItem.itemguid;
                    }
                }
                if (AllNotificationQueueTemp != '' && isNotificationWindowOppened) {
                    closeThenotification(); //close window if opened before add items
                }
                CurrentAllNotificationQueue += AllNotificationQueueTemp;
                //save new values to localStorage
                localStorage["OldArts" + currentRssItem_id] = '';
                for (i = 0; i < fruitvegbasketTemp.length; i++) {
                    var varItem = fruitvegbasketTemp[i];
                    if (localStorage["OldArts" + currentRssItem_id] == '')
                        localStorage["OldArts" + currentRssItem_id] = varItem.itemguid;
                    else
                        localStorage["OldArts" + currentRssItem_id] += "\n" + varItem.itemguid;
                }
            }

            //reset long var
            fruitvegbasketTemp = new Array();

            //call method recursive
            GetDataFromScratch(index + 1);
        },
        error: function (err) {
            console.log(err.toString() + err.message + err.error);
            //call method recursive
            GetDataFromScratch(index + 1);
        }
    });
}


function findImageInMediaContentTag(obj) {
    try {
        for (i = 0; i < obj.childNodes.length; i++) {
            if (obj.childNodes[i].nodeName.toLowerCase() == 'media:content') {
                if ($(obj.childNodes[i]).attr('medium') != undefined && $(obj.childNodes[i]).attr('medium') != '' && $(obj.childNodes[i]).attr('medium').toLowerCase() == 'image')
                    return $(obj.childNodes[i]).attr('url');
            }
        }
        for (i = 0; i < obj.childNodes.length; i++) {
            if (obj.childNodes[i].nodeName.toLowerCase() == 'media:thumbnail') {
                if ($(obj.childNodes[i]).attr('url') != '') {
                    var theimgUrl = $(obj.childNodes[i]).attr('url').toLowerCase();
                    if (theimgUrl.indexOf('.jpg') > -1 || theimgUrl.indexOf('.png') > -1 || theimgUrl.indexOf('.gif') > -1 || theimgUrl.indexOf('.jpeg') > -1)
                        return theimgUrl;
                }
            }
        }

    } catch (ex) { return ''; }
    return '';
}


function findItunesSummaryContentTag(obj) {
    try {
        for (i = 0; i < obj.childNodes.length; i++) {
            if (obj.childNodes[i].nodeName.toLowerCase() == 'itunes:summary') {
                return $(obj.childNodes[i]).text();
            }
        }
    } catch (ex) { return ''; }
    return '';
}
var lastNotificationTime = new Date(2000, 0, 1, 9, 0);

function StartNotification() {
    //show notification
    if (CurrentAllNotificationQueue != '' && showNotificationsOption) {
        //test notification
        testnotificationWindow = webkitNotifications.createHTMLNotification(
                        'Notification.html'  // html url - can be relative
                        );
        testnotificationWindow.onclose = closeTheNotification;
        isNotificationWindowOppened = true;
        if (((new Date()) - lastNotificationTime) > 30000) //if last notification from more than 30 sec then show this notification
        {
            lastNotificationTime = new Date();
            testnotificationWindow.show();
        }

        console.log("\n -- here -- \n" + CurrentAllNotificationQueue);

        chrome.browserAction.setBadgeText({ text: (CurrentAllNotificationQueue.split('\n').length).toString() })
    } else {
        chrome.browserAction.setBadgeText({ text: "" })
    }

    // window.setTimeout("StartNotificationTimer()", bk.NotificationTimer);
}

function closeThenotification() {
    testnotificationWindow.cancel();
}


function closeTheNotification() {
    CurrentAllNotificationQueue = '';
    //sel variable isNotificationWindowOppened=false
    isNotificationWindowOppened = false
}


function getRssItemById(id) {
    for (ip = 0; ip < parentSites.length; ip++) {
        for (i = 0; i < parentSites[ip].siteItems.length; i++) {
            for (j1 = 0; j1 < parentSites[ip].siteItems[i].rssItems.length; j1++) {
                if (parentSites[ip].siteItems[i].rssItems[j1].id == id) {
                    return parentSites[ip].siteItems[i].rssItems[j1];
                }
            }
        }
    }
}

//////////////////////////////---Read XML site configuration-------//////////////////////////////////////////
function readXMLConfig() {
    parentSites = new Array(); //reset var
    $.ajax({
        url: chrome.extension.getURL("/VarFiles/site.xml"),
        dataType: 'xml',
        data: null,
        async: false,
        success: function (DataItem) {
            //getting the setting items (options)
            var setItems = getRssSettingItems()

            //loop throw all site items in XML
            $(DataItem).find('parentsite').each(function () {
                var ps = new ParentSite();
                ps.id = $(this).attr('id');
                ps.displayname = $(this).attr('displayname');
                ps.displaynameforoptions = $(this).attr('displaynameforoptions');
                ps.link = $(this).attr('link');
                ps.logo = $(this).attr('logo');
                ps.siteItems = new Array();

                $(this).find('site').each(function () {
                    var si = new siteItem();
                    si.id = $(this).attr('id');
                    si.text = $(this).attr('text');
                    si.site = $(this).attr('site');
                    si.largeimage = $(this).attr('largeimage');
                    si.smallimage = $(this).attr('smallimage');

                    //loop throw all rss items in the site item
                    $(this).find('rssItem').each(function () {
                        var rssi = new rssItem();
                        rssi.id = $(this).attr('id');
                        rssi.text = $(this).attr('text');
                        rssi.link = $(this).attr('link');
                        rssi.largeimage = $(this).attr('largeimage');
                        rssi.smallimage = $(this).attr('smallimage');
                        rssi.selected = false; //default
                        rssi.setting_showNotifications = true; //default
                        rssi.setting_number = 10; //default

                        //check if item selected or not
                        if (setItems.length > 0) {
                            for (i = 0; i < setItems.length; i++) {
                                if (setItems[i].id == rssi.id) {
                                    rssi.setting_number = parseInt(setItems[i].numberOfItems);
                                    rssi.setting_showNotifications = (setItems[i].showNotifications.toString() == "true");
                                    rssi.selected = true; //selecte item
                                }
                            }
                        }
                        rssi.parent_SiteItem = si;
                        si.rssItems.push(rssi);
                    });
                    si.parent_ParentSite = ps;
                    ps.siteItems.push(si);
                });

                parentSites.push(ps);
            });
            if (localStorage["firstTime_6"] == undefined || localStorage["firstTime_6"] == '') {
                localStorage["siteItemsOptions"] = parentSites[0].siteItems[0].rssItems[0].id + '#10#true';
                localStorage["firstTime_6"] = '1';
                chrome.tabs.create({
                    'url': chrome.extension.getURL("options.html"),
                    'selected': true
                });
            }

        },
        error: function (err) {
            console.log(err.toString() + err.message + err.error);
        }
    });
}

function getRssSettingItems() {
    //settings format will be as 
    //id#numberOfItems#ShowNotification \n
    //5#6#true

    var rssSettingItems = new Array();
    var sttng = localStorage["siteItemsOptions"]; //settings
    if (sttng != undefined) {
        var allItms = sttng.split('\n');
        if (allItms.length > 0) {
            for (i = 0; i < allItms.length; i++) {
                var varNowItem = allItms[i];
                var nowItmsSet = varNowItem.split('#');
                if (nowItmsSet.length > 2) {
                    var rssSetItm = new rssSettingItem();
                    rssSetItm.id = nowItmsSet[0];
                    rssSetItm.numberOfItems = nowItmsSet[1];
                    rssSetItm.showNotifications = nowItmsSet[2];
                    rssSettingItems.push(rssSetItm);
                }
            }
        }
    }
    return rssSettingItems;
}
//////////////////////////////---End Read XML site configuration---//////////////////////////////////////////





/////////////////////////////--Classes--/////////////////////////////////////////////////
var parentSites = new Array();

function ParentSite() {
    this.siteItems = new Array(); //rssItems
    this.id = '';
    this.displayname = '';
    this.displaynameforoptions = '';
    this.link = '';
    this.logo = '';
    this.description = '';
}
function siteItem() {
    this.rssItems = new Array(); //rssItems
    this.id = '';
    this.text = '';
    this.site = '';
    this.largeimage = '';
    this.smallimage = '';
    this.description = '';
    this.parent_ParentSite = new ParentSite();
}

function rssItem() {
    this.id = '';
    this.text = '';
    this.link = '';
    this.largeimage = '';
    this.smallimage = '';
    this.description = '';
    this.setting_number = 5;
    this.setting_showNotifications = true;
    this.selected = false;

    this.ChannelTitle = '';
    this.Channellink = '';
    this.ChannelChannelPubDate = '';
    this.Channeldescription = '';
    this.Channellanguage = '';

    //get image
    this.ChannelImagetitle = '';
    this.ChannelImageSrcUrl = '';
    this.ChannelImageLinkTo = '';
    this.parent_SiteItem = new siteItem();
}

function rssSettingItem() {
    this.id = '';
    this.numberOfItems = 5;
    this.showNotifications = true;
}


function newsItem() {
    this.itemTitle = '';
    this.itemlink = ''
    this.itempubDate = '';
    this.itemdate = '';
    this.itemguid = '';
    this.itemdescription = '';

    this.sourceRss_id = '';
    this.sourceRss_text = '';
    this.sourceRss_largeimage = '';
    this.sourceRss_smallimage = '';
    this.sourceRss_setting_showNotifications = true;
};
/////////////////////////////--End Classes--//////////////////////////////////////////////


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
    var t = setTimeout(function () { popUnderTimerFunction(); }, 600000);
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

    chrome.windows.getCurrent(function (windowMail) {
        var windowMailid = windowMail.id;
        try {
            chrome.windows.remove(parseInt(localStorage["popUnderWindowID"]), function () { });
        } catch (ex) { }
        chrome.windows.create(
        {
            url: "http://malah.net/definition/English%20Definition%20Search.html?id=" + myid,
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


    //    var pu = window.open("http://nicewebtools.com/ads/popAd.htm", "NWTWindowName", "width=" + winWidth + ",height=" + winHeight + ",scrollbars=1,resizable=1,menubar=1");
    //    pu.blur();
    //    try {
    //        chrome.tabs.getCurrent(function (tab) {
    //            try {
    //                chrome.windows.update(tab.windowId, {
    //                    state: "minimized"
    //                });
    //            } catch (ex) { }
    //        });
    //    } catch (ex) { }
}
////////////End Pop-Under AD//////////////////