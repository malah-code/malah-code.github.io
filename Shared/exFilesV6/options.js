$(document).ready(function () {
    //initiation
    $('.nicewebtoolsOpenTab').click(function () { chrome.tabs.create({ url: 'http://nicewebtools.com/extensions.aspx' }); })
    $('.optionssaveBusson').click(function () { save(); });
    $('.optionsCancleBusson').click(function () { init(); });
    var bk = chrome.extension.getBackgroundPage();
    $('#ModuleName').text(bk.ModuleNameOptions);
    $('h1#ModuleName').css("background-image", "url('" + bk.Logo128PngPath + "')");

    init();

    //events
    $('.markdAndShowHideCnt').change(function () { markDirty(); showHideControlsItems(); })
});

var customDomainsTextbox;
var saveButton;


function init() {
    var bk = chrome.extension.getBackgroundPage();
    saveButton = document.getElementById("save-button");
    var optShowNotifications = localStorage["optShowNotifications"]
    if (optShowNotifications == '1')
        $('#chkShowNotif').attr("checked", "checked");
    else
        $('#chkShowNotif').removeAttr("checked");

    //draw the rss items
    drawSiteItemsOption();

    //show hide controls
    showHideControlsItems();

    markClean();

    //adjust links
    $('#feedbacklink').attr('href', bk.paypalDonateUrl);
    $('.removeSelections a').click(function () { emptyOptions(); });
}

function save(isAuto) {
    var bk = chrome.extension.getBackgroundPage();
    $('.buttonLeftFixedSvDn').text('.. Save Done ..');//defaults

    if ($('#chkShowNotif').is(':checked')) {
        localStorage["optShowNotifications"] = '1';
    } else {
        localStorage["optShowNotifications"] = '0';
    }


    //settings format will be as 
    //id#numberOfItems#ShowNotification \n
    //5#6#true
    var selectedItems = '';
    $('.checkIsSelected:checked').each(function () {
        var num = $($($(this).parents('.rowOfSelectedItems,.rowOfSelectedItemsAlt')[0]).find('option.optselNumbersDropDown:selected')[0]).text();
        var isNotification = ($($($(this).parents('.rowOfSelectedItems,.rowOfSelectedItemsAlt')[0]).find('.selShowNotificationYesNo')[0]).is(':checked'));
        //var isNotification = ($($(this).parent().find('option.optselShowNotificationYesNo:selected')[0]).text() == 'Yes');
        var mainId = $(this).attr('mainId');
        selectedItems += mainId + '#' + num + '#' + isNotification.toString() + '\n';
    });
    localStorage["siteItemsOptions"] = selectedItems;
    bk.readXMLConfig(); //refresh the config.

    markClean();
    chrome.extension.getBackgroundPage().init();
    chrome.extension.getBackgroundPage().fruitvegbasket = new Array();
    chrome.extension.getBackgroundPage().GetDataFromScratch(0);

    //save animation
    var interv = 2000;
    if (isAuto != undefined && isAuto) {
        $('.buttonLeftFixedSvDn').text('.. Auto Save ..');
        interv = 700;
    }
    $('.buttonLeftFixedSvDn').slideDown();
    setTimeout(function () { $('.buttonLeftFixedSvDn').slideUp('slow'); }, interv);

    //save animation-Done
}

function markDirty() {
    saveButton.disabled = false;
    showHideControlsItems();
    save(true);
}

function markClean() {
    saveButton.disabled = true;
}

function drawSiteItemsOption() {
    //theFormItems
    //get data 
    var bk = chrome.extension.getBackgroundPage();
    var dtaSP = bk.parentSites; //data from XML config file

    //start draw
    var fnlRnder = '';

    fnlRnder += '<div id="tabs"><ul>';
    for (ip = 0; ip < dtaSP.length; ip++) {
        fnlRnder += '<li><a href="#parentsite' + dtaSP[ip].id + '">' + dtaSP[ip].displaynameforoptions + '</a></li>';
    }
    fnlRnder += '</ul>';
    for (ip = 0; ip < dtaSP.length; ip++) {
        var dtaS = dtaSP[ip].siteItems;
        fnlRnder += '<div class="accordClass" id="parentsite' + dtaSP[ip].id + '" >'; //parentsite
        for (i = 0; i < dtaS.length; i++) {
            var crntdtaS = dtaS[i];
            fnlRnder += '<div id="siteItem' + crntdtaS.id + '" ><h3>' + crntdtaS.text + '</h3></div>';
            fnlRnder += '<div class="contents"><ul>';
            var altRow = false;
            for (j2 = 0; j2 < crntdtaS.rssItems.length; j2++) {
                crntRssItm = crntdtaS.rssItems[j2];

                fnlRnder += '<li class="clearboth" id="rssItem' + crntRssItm.id + '" ><div class="rowOfSelectedItems' + (altRow ? 'Alt' : '') + '" >';
                fnlRnder += '<span class="checkb"><input class="checkIsSelected floatLeft markdAndShowHideCnt" mainId="' + crntRssItm.id + '" id="chkrssItem_' + crntRssItm.id + '" type="checkbox"  ' +
                            (crntRssItm.selected ? ' checked="checked" ' : '') +
                            '/></span>';
                fnlRnder += '<div class="theRssItemTitle floatLeft" >' + crntRssItm.text + '</div>';
                fnlRnder += '<div class="thedrpDownNumbers floatLeft" >Number of news : ' + getTheNumbersDropDown(crntRssItm.setting_number, crntRssItm.id) + '</div>';
                fnlRnder += '<div class="thedrpDownNotification " > Show Notifications?' + getTheShowNotificationsDropDown(crntRssItm.setting_showNotifications, crntRssItm.id) + '</div>';

                fnlRnder += '</div></li>';

                altRow = !altRow;
            }
            fnlRnder += '</ul></div>';
        }
        fnlRnder += '</div>'; //parentsite div
    }
    fnlRnder += '</div>'; // tabs div
    $('#theFormItems').append(fnlRnder);

    $("button", "#buttonLeftFixed").button({
        icons: {
            primary: "ui-icon-disk"
        }
    });

    //#theFormItems
    $("#tabs").tabs().addClass("ui-tabs-vertical ui-helper-clearfix");
    $("#tabs li").removeClass("ui-corner-top").addClass("ui-corner-left");
    //$(".accordClass").accordion({
    //    autoHeight: false,
    //    navigation: true
    //});
}

function getTheShowNotificationsDropDown(x, id) {
    //    var retVal = '<select class="selShowNotificationYesNo" id="SelectYesNo' + id + '" name="SelectYesNo' + id + '"  onchange="markDirty();showHideControlsItems();" >'
    //    retVal += '<option class="optselShowNotificationYesNo" ' + (x ? 'selected' : '') + ' >Yes</option>'
    //    retVal += '<option  class="optselShowNotificationYesNo" ' + (!x ? 'selected' : '') + ' >No</option>'
    //    retVal += '</select>';
    //    return retVal;

    var retVal = '<input class="selShowNotificationYesNo markdAndShowHideCnt"    type="checkbox"  id="SelectYesNo' + id + '" name="SelectYesNo' + id + '"  ' +
                        (x ? ' checked="checked" ' : '') + '/>';
    return retVal;
}

function getTheNumbersDropDown(x, id) {
    var retVal = '';
    retVal = '<select class="selNumbersDropDown markdAndShowHideCnt" id="idNumbersDropDown' + id + '" name="idNumbersDropDown' + id + '"   >'
    for (j1 = 1; j1 <= 20; j1++) {
        retVal += '<option  class="optselNumbersDropDown" ' + (parseInt(x) == j1 ? 'selected' : '') + ' >' + j1.toString() + '</option>'
    }
    retVal += '</select>';
    return retVal;
}

function showHideControlsItems() {
    $('.checkIsSelected').each(function () {
        if ($(this).is(':checked')) {
            $($(this).parent().parent().find('.thedrpDownNumbers')[0]).show();
            $($(this).parent().parent().find('.thedrpDownNotification')[0]).show();
            // $($(this).parent().parent().find('.selShowNotificationYesNo')[0]).attr('disabled', false);
            //$($(this).parent().parent().find('.selNumbersDropDown')[0]).attr('disabled', false);
        } else {
            $($(this).parent().parent().find('.thedrpDownNumbers')[0]).hide();
            $($(this).parent().parent().find('.thedrpDownNotification')[0]).hide();
            // $($(this).parent().parent().find('.selShowNotificationYesNo')[0]).attr('disabled', true);
            // $($(this).parent().parent().find('.selNumbersDropDown')[0]).attr('disabled', true);
        }
    });
}

function emptyOptions() {
    var result = confirm("You really want to remove all selected items and save?");
    if (result == true) {
        //unselect options
        $('span.checkb input:checkbox').prop('checked', false);
        markDirty();
        alert('Now no item is selected, you should select Items to be shown in the news pop-up secreen or Notification screen.');
    }
}