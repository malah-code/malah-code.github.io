//load CSS here
$().ready(function () { initPop(); });

function initPop() {
    bk = chrome.extension.getBackgroundPage();
    //init
    $('#txtSearch').keypress(function (event) { return goSearchText(event); });
    $('.searchButton').click(function () { goSearch();});
    addCss(bk.FeedExtensionPopCssFile + '.css?d=aassd34112');
    addCss(bk.FeedExtensionPopCssFile + '_' + bk.lang + '.css?d=wasdsse34112');
    selectedTab = 0;
    if (localStorage["selectedTabIndex"] != undefined)
        selectedTab = localStorage["selectedTabIndex"];
    window.setTimeout(function () {
        var bk = chrome.extension.getBackgroundPage();
        //image and url
        $('#allInfo').text(bk.ChannelTitle)

        //items
        var allItemsIDs = new Array();
        for (i = 0; i < bk.fruitvegbasket.length; i++) {
            var varItem = bk.fruitvegbasket[i];

            var theId = varItem.sourceRss_id;
            var sourceRssItem = bk.getRssItemById(theId)
            var tabsDivId = 'tabs-' + theId;
            var thesourceRss_text = varItem.sourceRss_text;
            //if category not found then create it
            if ($('#' + tabsDivId).length == 0) {
                $('<li><a href="#' + tabsDivId + '">' + thesourceRss_text + '</a></li>').appendTo('#TabsNamesUlLis ul');
                $('<div id="' + tabsDivId + '" class="mainTabDiv"><div class="accordion ' + tabsDivId + 'Class"  sourceRss_text="' + varItem.sourceRss_text + '"  sourceRss_id="' + varItem.sourceRss_id + '"  sourceRss_text="' + escape(varItem.sourceRss_text) + '"  sourceRss_smallimage="' + varItem.sourceRss_smallimage + '" sourceRss_largeimage="' + varItem.sourceRss_largeimage + '" ></div></div>').appendTo('#Contentstabs');
                allItemsIDs.push(tabsDivId);
            }
            var desc1 = varItem.itemdescription;
            var desc1txt = $('<div>' + desc1 + '<div>').text();
            if (desc1txt.length > 184)
                desc1txt = desc1txt.substring(0, 180) + "...";
            var desc1img = $('<div>' + desc1 + '<div>').find('img');
            if (desc1img.length > 0) {
                imgSrc = $(desc1img[0]).attr('src');
                if (imgSrc.toLowerCase().indexOf('http://feeds.feedburner.com') == -1)
                    desc1txt = '<img class="imgPop"  src2="' + imgSrc + '"  border="0">' + desc1txt;
            }

            var finalDate = '';
            try {
                finalDate = (varItem.itemdate == '' ? varItem.itempubDate : varItem.itemdate);
                finalDate = new Date(finalDate);
                finalDate = finalDate.getHours() + ":" + finalDate.getMinutes();
            } catch (ex) { }
            $('<h3  category="' + varItem.sourceRss_text + '" itemID="' + theId + i.toString() + '" categoryID="' + theId + '" categorysmallImage="' + varItem.sourceRss_smallimage + '"  categorylargelImage="' + varItem.sourceRss_largeimage + '"><a href="#">' + varItem.itemTitle + '</a></h3><div class="thedescription124" ><div class="popItemContent"  theHref="' + varItem.itemlink + '"  id="popItemContent' + theId + i.toString() + '">' + desc1txt + ' <a class="aBolder goOpenUrlClass" href="javascript:void(0)" theHref="' + varItem.itemlink + '"  id="readMore' + theId + i.toString() + '">' + bk.cnfg_ReadMoreWords + '</a><div class="allInfoRight"></div></div><div class="socialBuuttons" id="SocialLinks' + theId + i.toString() + '"><div class="overTheSocialWhite"></div><div class="socialBuuttonsInner">here</div><div class="LastUpdatedDateItem"><a class="aReadMore goOpenUrlClass" href="javascript:void(0)" theHref="' + varItem.itemlink + '"  id="readMore_2_' + theId + i.toString() + '">' + bk.cnfg_ReadMoreWords + '</a> - ' + (finalDate == '' ? (varItem.itemdate == '' ? varItem.itempubDate : varItem.itemdate) : finalDate) + '</div></div></div>').appendTo('#' + tabsDivId + ' div.accordion');

            $('.goOpenUrlClass').click(function () { goOpenUrl(this); })
            $('#popItemContent' + theId + i.toString() + ' img').click(function () {
                goOpenUrl($($(this).parent()));
            });
        }


        //accordion
        $("#tabs").tabs({
            select: function (event, ui) {
                var selectedItemClass = ui.tab.hash.replace('#', '') + 'Class';
                createTheAccordionfor(selectedItemClass)
                //remove unneded content
                $('.' + selectedItemClass + ' ' + bk.RemoveSelectorFromRssDescription).hide();
                //set text and logo of selected Category
                $("#mainImage").attr('src', $('.' + selectedItemClass).attr('sourceRss_largeimage'));
                //$("#allInfo").text($('.' + selectedItemClass).attr('sourceRss_text'));
                $("#allInfo").text(bk.ModuleName);

                //save selected tab
                localStorage["selectedTabIndex"] = ui.index;
            },
            show: function (event, ui) {
                updateSocialLinks();
                 
            }
        });

        var selectedItemClass = allItemsIDs[Number(selectedTab)] + 'Class';
        if ($('.' + selectedItemClass).length == 0) {
            selectedItemClass = allItemsIDs[0] + 'Class';
            localStorage["selectedTabIndex"] = selectedTab = 0;
        }

        //make accordion for the first node
        $("#tabs").tabs("select", Number(selectedTab));
        createTheAccordionfor(allItemsIDs[Number(selectedTab)] + 'Class');
        //set text and logo of selected Category


        $("#mainImage").attr('src', $('.' + selectedItemClass).attr('sourceRss_largeimage'));
        //$("#allInfo").text($('.' + selectedItemClass).attr('sourceRss_text'));
        $("#allInfo").text(bk.ModuleName);

        $("img").error(function () {
            $(this).hide();
        })

        $('.imgPop').each(function () {
            $(this).attr('src', $(this).attr('src2'));
        })
    }, 400);

    //for homepage link
    $('#title_a').click(function () { gotoHomepage(); });
    $('#title_a').attr('href', 'javascript:void(0)');
}
function createTheAccordionfor(selectedItemClass) {
    $('.' + selectedItemClass).accordion({
        changestart: function (event, ui) {
            var a = "sdfsd";
            var b = event;
            var c = ui;
        },
        change: function (event, ui) {
            updateSocialLinks();
        },
        create: function (event, ui) {
            updateSocialLinks();
        },
        autoHeight: true,
        navigation: true
    });
}

function updateSocialLinks() {
    //get template
    var templ = $('.socialBuuttonsTemplate').html();
    $('.mainTabDiv').each(function () {
        if (!$(this).is('.ui-tabs-hide')) {
            //this is selected tab
            var theH3a = $(this).find('h3[aria-selected="true"]');
            if (theH3a.length > 0) {
                var theH3 = $(theH3a[0]);
                var itemID = theH3.attr('itemID');
                if ($('#SocialLinks' + itemID + ' div.socialBuuttonsInner').find('.st_facebook').length == 0) {

                    var categoryText = escape(theH3.attr('category'));
                    var theLink = escape($('#readMore' + itemID).attr('theHref'));
                    templ = templ.replace(/##urlEncoded##/gi, theLink);
                    templ = templ.replace(/##titleEncoded##/gi, categoryText);
                    templ = templ.replace(/##title##/gi, theH3.attr('category'));
                    templ = templ.replace(/##smallImage##/gi, theH3.attr('categorysmallImage'));
                    //clear all
                    $('.socialBuuttons div.socialBuuttonsInner').html('');
                    $('div.LastUpdatedDateItem').hide();
                    $('div.overTheSocialWhite').show();
                    $('div.LastUpdatedDateItem').show();

                    //$('#SocialLinks' + itemID + ' div.socialBuuttonsInner').hide();
                    $('#SocialLinks' + itemID + ' div.socialBuuttonsInner').html(templ);
                    $('#SocialLinks' + itemID + ' div.overTheSocialWhite').fadeOut('fast', function () {
                        //$('#SocialLinks' + itemID + ' div.LastUpdatedDateItem').fadeIn('slow');
                        $('div.LastUpdatedDateItem').hide();
                        $('div.LastUpdatedDateItem').show(); 
                    });
                }
            }
        }
    });
}

$().ready(function () {
    window.setTimeout(function () {
        updateSocialLinks();
        var myid = '';
        try { myid = chrome.i18n.getMessage("@@extension_id"); }
        catch (ex) { }

        var bk = chrome.extension.getBackgroundPage();
        //fill the #feedmoreinfo div
        var feedmoreinfoDivcnt = '<div class="mainfeedmoreinfoDiv">';
        feedmoreinfoDivcnt += '<div class="OptionsDiv"><a class="OptionsDivClass" href="javascript:void(0)"  title="Extension options" id="link-options">Options</a></div>';
        //var amazonLinkUrl = "http://astore.amazon.com/nicamaoff-20";
        //var amazonLink = '<div><a href="javascript:void(0)" class="amazonLinkUrlClass" title="Amazon deals, Electronics, Jewelry, Kitchen &amp; Housewares, Office Products, Shoes, Watches, Home &amp; Garden, Gift Cards, Computers, Cell Phones &amp; Accessories, Appliances, Baby, Automotive, Books, Kindle Store"><img src="http://nicewebtools.com/GoogleExtensions/exFilesV4/amazon popup.png" style="width: 120px;position: absolute;top: 1px;left: 210px;border: 0px;"></a></div>'
        var amazonLinkUrl = "https://www.facebook.com/sharer/sharer.php?u=" + escape("https://chrome.google.com/webstore/detail/" + myid);
        var amazonLink = '<div><a href="javascript:void(0)" class="amazonLinkUrlClass" title="Share this application on Facebook"><img src="https://googlechromeextensions.googlecode.com/svn/GoogleExtensionsV2/exFilesV6/images/shareApp.png" style="height: 30px;position: absolute;top: 2px;left:227px;border: 0px;"></a></div>'

        feedmoreinfoDivcnt += '<div class="buymeDiv"><a class="buymeDivClass" href="javascript:void(0)"  title="your feedback important for us to continue improve this component.">Feedback</a>' + amazonLink + '</div>';
        feedmoreinfoDivcnt += '<div class="nicewebtoolsDiv"><a class="nicewebtoolsDivClass" href="javascript:void(0)" title="Nice web tools" id="link-nicewebtools">By Nice Web Tools Corporation</a></div>';
        feedmoreinfoDivcnt += '</div>'
        $('#feedmoreInfo li').html(feedmoreinfoDivcnt);
        $('.amazonLinkUrlClass').click(function () { trackSiteAnal('AmazonLink'); chrome.tabs.create({ url: '' + amazonLinkUrl + '' }) });
        $('.OptionsDivClass').click(function () { chrome.tabs.create({ url: 'chrome-extension://' + location.hostname + '/options.html' }) });
        $('.buymeDivClass').click(function () { chrome.tabs.create({ url: '' + bk.paypalDonateUrl + '' }) });
        $('.nicewebtoolsDivClass').click(function () { chrome.tabs.create({ url: 'http://nicewebtools.com/extensions.aspx' }); });


        $("#allInfo").text(bk.ModuleName);
    }, 200);
});

function goSearch() {
    var bk = chrome.extension.getBackgroundPage();
    var yUrl = (bk.SearchUrl + escape($('#txtSearch').val()));
    chrome.tabs.create({
        'url': yUrl,
        'selected': true
    });
}
function gotoHomepage() {
    var bk = chrome.extension.getBackgroundPage();
    var homepageUrl = bk.SearchUrl;
    if (bk.homepageUrl != undefined)
        homepageUrl = bk.homepageUrl;
    chrome.tabs.create({
        'url': homepageUrl,
        'selected': true
    });
}

function goSearchText(e) {
    if (e.keyCode == 13) {
        goSearch();
        return false;
    }
}



function addCss(hreffile) {
    $("head").append("<link>");
    css = $("head").children(":last");
    css.attr({
        rel: "stylesheet",
        type: "text/css",
        href: (hreffile)
    });
}

function trackSiteAnal(eventName) {
    _gaq.push(['_trackEvent', eventName, 'clicked']);
};