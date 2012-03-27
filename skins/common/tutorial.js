// Based on http://www.codeproject.com/Tips/61476/Disable-all-links-on-the-page-via-Javascript
function DisableEnableLinks(){
  objLinks = document.links;
  for(i=0;i<objLinks.length;i++){
    objLinks[i].disabled = true;
    objLinks[i].onclick = function(){return false;}
  }
  objForms = document.forms;
  for(i=0;i<objForms.length;i++){
    objForms[i].disabled = true;
    objForms[i].onsubmit = function(){return false;}
  }
}

// From http://javascriptmagic.blogspot.com/2006/09/getting-scrolling-position-using.html
// Scroll position support varies between browser, so do tests to figure out best one to use.
function getScrollingPosition()
{
    var position = [0, 0];
    if (typeof window.pageYOffset != 'undefined')
    {
        position = [
            window.pageXOffset,
            window.pageYOffset
        ];
    }
    else if (typeof document.documentElement.scrollTop
             != 'undefined' && document.documentElement.scrollTop > 0)
    {
        position = [
            document.documentElement.scrollLeft,
            document.documentElement.scrollTop
        ];
    }
    else if (typeof document.body.scrollTop != 'undefined')
    {
        position = [
            document.body.scrollLeft,
            document.body.scrollTop
        ];
    }
    return position;
}

// Gets rendered position of a given element relative to upper-left of page.
// From http://stackoverflow.com/questions/442404/dynamically-retrieve-html-element-x-y-position-with-javascript
// Users meouw, cwallenpoole / CC-BY
function getOffset( el ) {
    var _x = 0;
    var _y = 0;
    while( el && !isNaN( el.offsetLeft ) && !isNaN( el.offsetTop ) ) {
        _x += el.offsetLeft - el.scrollLeft;
        _y += el.offsetTop - el.scrollTop;
        el = el.parentNode;
    }
    return { top: _y, left: _x };
}

var updatePositions = function() {
    var oDiv=document.getElementById('twa-instructions');
    var scrollpos = getScrollingPosition();
    oDiv.style.left = '' + (scrollpos[0] + window.innerWidth - 100 - $(oDiv).width()) + 'px';
    oDiv.style.top = '' + (scrollpos[1] + window.innerHeight - 100 - $(oDiv).height()) + 'px';

    if (arrowTarget) {
        var oDiv=document.getElementById('twa-marker');
        offset = $(arrowTarget).offset();
        oDiv.style.left = '' + (offset.left + $(arrowTarget).width()/2 - $(oDiv).width()/2) + 'px'; // center
        oDiv.style.top = '' + (offset.top + $(arrowTarget).height()) + 'px'; // right under pt-login
    }
}

var updateOverlays = function() {
    // Must call before enabling links selectively below
    DisableEnableLinks();

    if ($.cookie("twa-step") == null) {
        $.cookie("twa-step", 1);
    }
    arrowTarget = null;
    instructions.innerHTML = '';
    marker.innerHTML = '';
    markerArrow = '<img src="/wikipediaadventure/skins/common/images/Up-1.png" alt="Click here" width="100" height="89"/>';
    if ($.cookie("twa-step") == 1) {
        instructions.innerHTML = '<p>Welcome to <i>The Wikipedia Adventure</i>!</p><p>Begin by clicking on the <b>George Tupou V</b> link to visit the article on George Tupou V, King of Tonga.</p>';
        marker.innerHTML = markerArrow;
        arrowTarget = 'a[title="George Tupou V"]';
        $(arrowTarget)[0].onclick = function(){
            $.cookie("twa-step", 2);
            return true;
        };
    } else if ($.cookie("twa-step") == 2) {
        instructions.innerHTML = '<p>You are now reading the article on George Tupou V. This article contains a small error in its first sentence. Try to find it, then click <b>Next</b> below.</p>';
        instructions.innerHTML += '<p><a onclick="goToStep(3);">Next</a></p>';
    } else if ($.cookie("twa-step") == 3) {
        instructions.innerHTML = '<p>The error is that "death" is misspelled as "deth". We\'re going to fix this.</p>';
        instructions.innerHTML += '<p><a onclick="goToStep(4);">Next</a></p>';
        marker.innerHTML = markerArrow;
        var content = $("div[class=mw-content-ltr]")[0];
        content.innerHTML = content.innerHTML.replace(" deth ", " <span id=\"deth\">deth</span> ");
        arrowTarget = '#deth';
    } else if ($.cookie("twa-step") == 4) {
        instructions.innerHTML = '<p>Start by clicking on the <b>Edit</b> tab to edit the article.</p>';
        marker.innerHTML = markerArrow;
        arrowTarget = '#ca-edit';
        $(arrowTarget).find('a')[0].onclick = function(){
            $.cookie("twa-step", 5);
            return true;
        };
    } else if ($.cookie("twa-step") == 5) {
        instructions.innerHTML = '<p>You are now editing the article, which is displayed using <i>wikitext</i>, a plain text representation. Find the misspelled word <b>deth</b> and change it to "death".</p>';
    }
    updatePositions();
}

var goToStep = function(stepNum) {
    $.cookie("twa-step", stepNum);
    updateOverlays();
}

window.onresize = function(event) {
     updatePositions();
}

window.onscroll = function(event) {
     updatePositions();
}

var root=$('body')[0];

var instructions =document.createElement('div');
instructions.setAttribute('style','width: 300px; height: 200px; background-color:#FFFF88; border:2px solid; box-shadow: 10px 10px 5px rgba(128, 128, 128, 0.3);');
instructions.style.position='absolute';
instructions.id = 'twa-instructions';
root.appendChild(instructions);

var marker =document.createElement('div');
marker.id = 'twa-marker';
marker.style.position='absolute';
root.appendChild(marker);

if (document.URL.indexOf("/Main_Page") != -1) {
    $.cookie("twa-step", 1);
}
updateOverlays();
