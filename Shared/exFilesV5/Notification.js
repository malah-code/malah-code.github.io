//main module code
$(function () {
    init();
})
function init() {
    var bk = chrome.extension.getBackgroundPage();
    //init
    $('.btnPreviosClass').click(function () { btnPrevios(); });
    $('.btnPauseClass').click(function () { btnPause(); });
    $('.btnNextClass').click(function () { btnNext(); });
    //load CSS
    $("head").append("<link>");
    css = $("head").children(":last");
    css.attr({
        rel: "stylesheet",
        type: "text/css",
        href: bk.NotificationsCssFile + '.css'
    });
    //lang specific css
    $("head").append("<link>");
    css = $("head").children(":last");
    css.attr({
        rel: "stylesheet",
        type: "text/css",
        href: (bk.NotificationsCssFile + '_' + bk.lang + '.css')
    });

    var notifItms = bk.CurrentAllNotificationQueue; //the notification Queue
    if (notifItms == '' || notifItms == undefined) {

        bk.closeThenotification();
    }

    var cnter = 1;
    for (i = 0; i < bk.fruitvegbasket.length; i++) {
        var varItem = bk.fruitvegbasket[i];
        if (notifItms.indexOf(varItem.itemguid) > -1) {
            //209
            //190
            //42
            var desc1 = varItem.itemdescription;
            var desc1txt = $('<div>' + desc1 + '<div>').text();
            if (desc1txt.length > 190)
                desc1txt = desc1txt.substring(0, 190)
            var desc1img = $('<div>' + desc1 + '<div>').find('img');
            if (desc1img.length > 0) {
                imgSrc = $(desc1img[0]).attr('src');
                if (imgSrc.toLowerCase().indexOf('http://feeds.feedburner.com') == -1) {
                    if (desc1txt.length > 114)
                        desc1txt = desc1txt.substring(0, 114)
                    desc1txt = '<img src="' + imgSrc + '"  border="0">' + desc1txt;
                }
            }
            $('<div class="hideThis" id="itemNo_' + cnter + '" theId="' + cnter + '"><h3><a href="javascript:void(0)" category="' + varItem.sourceRss_text + '" categorysmallImage="' + varItem.sourceRss_smallimage + '" theHref="' + varItem.itemlink + '" class="goOpenUrlClass" >' + varItem.itemTitle.substring(0, 85) + '</a></h3><div class="thedescription124" >' + desc1txt + ' .. <a href="javascript:void(0)" theHref="' + varItem.itemlink + '" class="goOpenUrlClass" >' + bk.cnfg_ReadMoreWords + '</a>' + '</div></div>').appendTo('.contentLower');

            $('.goOpenUrlClass').click(function () { goOpenUrl(this); })

            cnter++;
        }
    }
    if (cnter == 1) {
        bk.closeThenotification();
    }

    //remove unneded content
    $('.contentLower ' + bk.RemoveSelectorFromRssDescription).hide();

    //hide error images
    $("img").error(function () {
        $(this).hide();
    })

    //show first Item
    selectItemFromList(1);

    //start the GoNextTimer()
    window.setTimeout(function () { GoNextTimer(); }, bk.NotificationRotationPeriod);

    //stop the timer temporary if user enter the notification with mouse
    $("body").mouseenter(function () {
        isTemporaryPaused = true;
    });
    $("body").mouseleave(function () {
        isTemporaryPaused = false;
    });

    //close notification if user (right click)
    $('body').mouseup(function (event) {
        switch (event.which) {
            case 2:
                //alert('Middle mouse button pressed');
                bk.closeThenotification();
                break;
            case 3:
                //alert('Right mouse button pressed');
                bk.closeThenotification();
                break;
        }
    });

    //initiate amazon link
    var amazonLinkUrl = "http://astore.amazon.com/nicamaoff-20";

    $('.plusClassMain').append('<div><a href="javascript:void(0)" category="" categorysmallimage="" class="amazonLinkUrlClass"  title="Amazon deals, Electronics, Jewelry, Kitchen &amp; Housewares, Office Products, Shoes, Watches, Home &amp; Garden, Gift Cards, Computers, Cell Phones &amp; Accessories, Appliances, Baby, Automotive, Books, Kindle Store"><img src="http://nicewebtools.com/GoogleExtensions/exFilesV4/amazon popup.png" style="width: 81px;position: absolute;top: 1px;left: 74px;border: 0px;"></a></div>');
    $('.amazonLinkUrlClass').click(function () { goOpenUrlNotif('http://astore.amazon.com/nicamaoff-20'); })
}

//previos button script
function btnPrevios() {
    //get current node
    var theId = $('div.current[id^="itemNo"]').attr('theId')
    theId = parseInt(theId) - 1;
    selectItemFromList(theId)
}

//Next button script
function btnNext() {
    var theId = $('div.current[id^="itemNo"]').attr('theId')
    theId = parseInt(theId) + 1;
    selectItemFromList(theId);
}

//Pause button script
function btnPause() {
    if (isTimerPaused) {
        $('#imgPause').attr('src', 'images/pause.png');
        isTimerPaused = false;
    } else {
        $('#imgPause').attr('src', 'images/pause1.png');
        isTimerPaused = true;
    }
    clearTimeout(timerRotation);
    GoNextTimer();
}

//Select Item By ID (number)
function selectItemFromList(theId) {
    if ($('#itemNo_' + theId).length > 0) {
        var bk = chrome.extension.getBackgroundPage();
        $('div[id^="itemNo"]').removeClass('current');
        $('div[id^="itemNo"]').slideUp();

        $('#itemNo_' + theId).addClass('current');
        $('#itemNo_' + theId).slideDown('slow');

        //contentUpperLeft
        $('.contentUpperLeft img').removeClass('opacity4');

        //is it the last item
        if ($('#itemNo_' + (parseInt(theId) + 1)).length == 0) {
            $('#imgRight').addClass('opacity4');
        }

        //is it the first item
        var Pre1 = '#itemNo_' + (parseInt(theId) - 1);
        if ($(Pre1).length == 0) {
            $('#imgLeft').addClass('opacity4');
        }

        //some of count
        var countAllItems = $('div[id^="itemNo"]').length;
        $('.contentUpperRight').text(theId + ' ' + bk.ofWord + ' ' + countAllItems);

        //social items
        var hrefLink = $($('#itemNo_' + theId + ' a')[0]).attr('thehref');
        var LinkText = $($('#itemNo_' + theId + ' a')[0]).text();
        var LinkCategory = $($('#itemNo_' + theId + ' a')[0]).attr('category');
        var LinkCategoryImg = $($('#itemNo_' + theId + ' a')[0]).attr('categorysmallImage');
        $('#cExpandedPreview a.twitter').attr('href', 'https://twitter.com/share?url=' + escape(hrefLink));
        $('#cExpandedPreview a.facebook').attr('href', 'http://www.facebook.com/sharer.php?u=' + escape(hrefLink) + '&t=' + escape(LinkText));
        $('#plusIframeId').attr('src', 'https://plusone.google.com/_/+1/fastbutton?url=' + escape(hrefLink) + '&size=small');
        $('#facebookIframeId').attr('src', 'http://www.facebook.com/plugins/like.php?href=' + escape(hrefLink) + '&send=false&layout=button_count&width=450&show_faces=false&action=like&colorscheme=light&font=tahoma&height=21&appId=199375040120582');
        $('#smallImageDivMainAndCategory span').text(LinkCategory);
        $('#smallImageDivMainAndCategory img').attr('src', LinkCategoryImg);

    }
}

//rotation timer
var isTimerPaused = false;
var isTemporaryPaused = false;
var timerRotation;
function GoNextTimer() {
    //check if there is anything in the queue
    var bk = chrome.extension.getBackgroundPage();
    if (!isTimerPaused && !isTemporaryPaused) {
        //if final node then exit
        if ($('#imgRight.opacity4').length > 0) {
            window.setTimeout(function () { bk.closeThenotification(); }, bk.FinalNotificationRotationPeriodBeforeClose);
        }
        btnNext();
    }
    timerRotation = window.setTimeout(function () {GoNextTimer();}, bk.NotificationRotationPeriod);
}

//notification
var addthis_share =
        {
            templates: {
                twitter: 'Good article {{url}} (By @nicewebtools)',
                ui_use_css: true
            }
        };






function goOpenUrlNotif(theLink) {
    var bk = chrome.extension.getBackgroundPage();
    $('#pUrl').val(theLink);
    $('#pPageTitle').val('');
    $('#pDescription').val('')
    $('#pLagreImageUrl').val('');
    $('#pSmallImageUrl').val('');
    $($('form')[0]).attr('action', theLink);
    document.forms[$($('form')[0]).attr('id')].submit();
    window.setTimeout(function () { bk.closeThenotification(); }, 100);
}

 