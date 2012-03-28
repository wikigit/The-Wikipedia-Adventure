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
    if (arrowTarget) {
        var marker=document.getElementById('twa-marker');
        offset = $(arrowTarget).offset();
        marker.style.left = '' + (offset.left + $(arrowTarget).width()/2 - $(marker).width()/2) + 'px'; // center
        marker.style.top = '' + (offset.top + $(arrowTarget).height()) + 'px'; // right under pt-login
    }
}

var getStep = function() {
    result = $.cookie("twa-step");
    return result;
}

var setStep = function(stepNum) {
    $.cookie("twa-step", stepNum, { path: '/' });
}

var updateOverlays = function() {
    // Must call before enabling links selectively below
    DisableEnableLinks();

    arrowTarget = null;
    markerArrow = '<img src="/wikipediaadventure/skins/common/images/Up-1.png" alt="Click here" width="100" height="89"/>';

    var instructions = document.getElementById('twa-instructions');
    instructions.style.position='fixed';
    instructions.style.top = null;
    instructions.style.left = null;
    $(instructions).css('margin-top', null);
    $(instructions).css('margin-left', null);
    instructions.style.right = '10%';
    instructions.style.bottom = '10%';
    instructions.innerHTML = '';

    var marker = document.getElementById('twa-marker');
    marker.innerHTML = '';

    if (getStep() == 'start') {
        instructions.innerHTML = 'Welcome to <b>The Wikipedia Adventure</b>, a tutorial for new Wikipedia users. Instructions will appear in the lower-right. Click Next below to continue.</p>';
        instructions.innerHTML += '<p><a onclick="goToStep(\'main-page-click-article\');">Next</a></p>';
        // Center in window
        instructions.style.top = '50%';
        instructions.style.left = '50%';
        instructions.style.right = '';
        instructions.style.bottom = '';
        $(instructions).css('margin-top', '' + -$(instructions).height()/2 + 'px');
        $(instructions).css('margin-left', '' + -$(instructions).width()/2 + 'px');
      } else if (getStep() == "main-page-click-article") {
        instructions.innerHTML = '<p>Begin by clicking on the <b>George Tupou V</b> link to visit the article on George Tupou V, King of Tonga.</p>';
        marker.innerHTML = markerArrow;
        arrowTarget = 'a[title="George Tupou V"]';
        $(arrowTarget)[0].onclick = function(){setStep('find-error')};
    } else if (getStep() == 'find-error') {
        instructions.innerHTML = '<p>You are now reading the article on George Tupou V. This article contains a small error in its first sentence. Try to find it and click on it.</p>';
        var content = $("div[class=mw-content-ltr]")[0];
        content.innerHTML = content.innerHTML.replace(" deth ", ' <span id="deth" onclick="goToStep(\'show-error\')">deth</span> ');
    } else if (getStep() == 'show-error') {
        instructions.innerHTML = '<p>Great job! The error is that "death" is misspelled as "deth". We\'re going to fix this.</p>';
        instructions.innerHTML += '<p><a onclick="goToStep(\'click-edit-tab\');">Next</a></p>';
        marker.innerHTML = markerArrow;
        $('#deth')[0].onclick = null;
        arrowTarget = '#deth';
    } else if (getStep() == 'click-edit-tab') {
        instructions.innerHTML = '<p>Start by clicking on the <b>Edit</b> tab to edit the article.</p>';
        marker.innerHTML = markerArrow;
        arrowTarget = '#ca-edit';
        $(arrowTarget).find('a')[0].onclick = function(){setStep('editing');};
    } else if (getStep() == 'editing') {
        instructions.innerHTML = '<p>You are now editing the article. Find the misspelled word <b>deth</b> and change it to "death", then click <b>Next</b> below.</p>';
        instructions.innerHTML += '<p><a onclick="goToStep(\'done-editing\');">Next</a></p>';
        desired_value = $('#wpTextbox1')[0].value.replace(' deth ', ' death ');
    } else if (getStep() == 'done-editing') {
        if ($('#wpTextbox1')[0].value == desired_value) {
            instructions.innerHTML = '<p>Good job! Next, click on the <b>Summary</b> field and enter a short explanation for your edit, such as "fixed spelling error". Then click <b>Next</b> below.</p>';
            instructions.innerHTML += '<p><a onclick="goToStep(\'done-summary\');">Next</a></p>';
        } else {
            instructions.innerHTML = '<p>You made the change incorrectly. Make sure you changed <b>deth</b> to "death" and <b>made no other changes</b>. Click <b>Next</b> below to try again.</p>';
            instructions.innerHTML += '<p><a onclick="goToStep(\'done-editing\');">Next</a></p>';
        }
    } else if (getStep() == 'done-summary') {
        instructions.innerHTML = '<p>Lesson still under construction.</p>';
    }
    updatePositions();
}

var goToStep = function(stepNum) {
    setStep(stepNum);
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
instructions.setAttribute('style','width: 300px; background-color:#FFFF88; border:2px solid; box-shadow: 10px 10px 5px rgba(128, 128, 128, 0.3);');
instructions.id = 'twa-instructions';
root.appendChild(instructions);

var marker =document.createElement('div');
marker.id = 'twa-marker';
marker.style.position='absolute';
root.appendChild(marker);

if (document.URL.indexOf("/Main_Page") != -1) {
    setStep('start');
}
updateOverlays();
