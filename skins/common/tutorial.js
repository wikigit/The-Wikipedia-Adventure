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

var getStep = function() {
    result = $.cookie("twa-step");
    return result;
}

var setStep = function(stepName) {
    if (stepName.indexOf("/") == -1) {
        components = getStep().split('/');
        setStep(components[0] + "/" + stepName);
        return;
    }
    $.cookie("twa-step", stepName, { path: '/' });
}

var goToStep = function(stepName) {
    setStep(stepName);
    updateOverlays();
}

var centerElement = function(element) {
    element.style.top = '50%';
    element.style.left = '50%';
    element.style.right = '';
    element.style.bottom = '';
    $(element).css('margin-top', '' + -$(element).height()/2 + 'px');
    $(element).css('margin-left', '' + -$(element).width()/2 + 'px');
};

// Visually highlights a given element - currently can only do one at a time
var highlightElement = function(target) {
    var marker = document.getElementById('twa-marker');
    marker.innerHTML = '<img src="' + stylepath + '/common/images/Up-1.png" width="100" height="89"/>';
    offset = $(target).offset();
    marker.style.left = '' + (offset.left + $(target).width()/2 - $(marker).width()/2) + 'px'; // center
    marker.style.top = '' + (offset.top + $(target).height()) + 'px'; // right under pt-login
    return target;
};

var updateFirstEdit = function(step, instructions) {
    switch(step) {
        case 'Welcome':
            instructions.innerHTML =
                '<div style="text-align:right;"><a onclick="goToStep(\'Twa/Login\');">Log in</a></div>' +
                '<p>Welcome to <b>The Wikipedia Adventure</b>, a tutorial for new Wikipedia users. Instructions will appear in the lower-right.</p>' +
                '<p>Would you like to review how to make an edit to an article?</p>' +
                '<p><a onclick="goToStep(\'MainPageClickArticle\');">Yes</a> <a onclick="goToStep(\'CreateUser/Start\');">No</a></p>';
            centerElement(instructions);
            break;
        case "MainPageClickArticle":
            instructions.innerHTML =
                '<p>Begin by clicking on the <b>George Tupou V</b> link to visit the article on George Tupou V, King of Tonga.</p>';
            $(highlightElement('a[title="George Tupou V"]'))[0].onclick = function(){setStep('FindError')};
            break;
        case 'FindError':
            instructions.innerHTML =
                '<p>You are now reading the article on George Tupou V. This article contains a small error in its first sentence. ' +
                'Try to find it and click on it.</p>';
            var content = $("div[class=mw-content-ltr]")[0];
            content.innerHTML = content.innerHTML.replace(" deth ", ' <span id="deth" onclick="goToStep(\'ShowError\')">deth</span> ');
            break;
        case 'ShowError':
            instructions.innerHTML =
                '<p>Nice spotting! The error is that "death" is misspelled as "deth". We\'re going to fix this.</p>' +
                '<p><a onclick="goToStep(\'ClickEditTab\');">Next</a></p>';
            $('#deth')[0].onclick = null;
            highlightElement('#deth');
            break;
        case 'ClickEditTab':
            instructions.innerHTML =
                '<p>Start by clicking on the <b>Edit</b> tab to edit the article.</p>';
            $(highlightElement('#ca-edit')).find('a')[0].onclick = function(){setStep('Editing');};
            break;
        case 'Editing':
            instructions.innerHTML =
                '<p>You are now editing the article. Find the misspelled word <b>deth</b> and change it to "death", then click <b>Next</b> below.</p>' +
                '<p><a onclick="goToStep(\'DoneEditing\');">Next</a></p>';
            desired_value = $('#wpTextbox1')[0].value.replace(' deth ', ' death ');
            break;
        case 'DoneEditing':
            if ($('#wpTextbox1')[0].value == desired_value) {
                instructions.innerHTML =
                    '<p>Good job! Next, click on the <b>Summary</b> field and enter a short explanation for your edit, such as "fixed spelling error". ' +
                    'This is called an <i>edit summary</i>, and every edit should have one. Then click <b>Next</b> below.</p>' +
                    '<p><a onclick="goToStep(\'DoneSummary\');">Next</a></p>';
                highlightElement('#wpSummary');
            } else {
                instructions.innerHTML =
                    '<p>You made the change incorrectly. Make sure you changed <b>deth</b> to "death" and <b>made no other changes</b>. ' +
                    'Click <b>Next</b> below to try again.</p>' +
                    '<p><a onclick="goToStep(\'DoneEditing\');">Next</a></p>';
            }
            break;
        case 'DoneSummary':
            if ($('#wpSummary')[0].value.length > 0) {
                instructions.innerHTML =
                    '<p>Great! Finally, click on <b>Save page</b> to save your changes to the article.</p>';
                $('#editform')[0].onsubmit = function(){
                    // Don't really let them save - just redirect back to article, we'll fake the changes.
                    // TODO: if they attempt incorrectly more than once the message won't appear to change
                    setStep('ShowArticleWithChange');
                    window.location.href = wgArticlePath.replace('$1', 'George_Tupou_V');
                    return false;
                }
                highlightElement('#wpSave');
            } else {
                instructions.innerHTML =
                    '<p>You did not enter a summary. ' +
                    'Click on the <b>Summary</b> field indicated by the arrow and enter a short explanation for your edit, such as "fixed spelling error". ' +
                    'Then click <b>Next</b> below.</p>' +
                    '<p><a onclick="goToStep(\'DoneSummary\');">Next</a></p>';
            }
            break;
        case 'ShowArticleWithChange':
            instructions.innerHTML =
                '<p>Your changes to the article appear instantly to all readers. ' +
                'If your changes were incorrect, another user can always easily change it back. ' +
                'Click <b>Next</b> below for your <b>Real Wikipedia Bonus Task</b>.</p>' +
                '<p><a onclick="goToStep(\'RealWikipediaBonusTask\');">Next</a></p>';
            var content = $("div[class=mw-content-ltr]")[0];
            content.innerHTML = content.innerHTML.replace(" deth ", ' <span id="death">death</span> ');
            highlightElement('#death');
            break;
        case 'RealWikipediaBonusTask':
            instructions.innerHTML =
                '<p><b>Real Wikipedia Bonus Task</b></p>' +
                '<p>You\'re now ready to make a real edit to Wikipedia. ' +
                'Visit <a href="http://en.wikipedia.org" onclick="$(this).attr(\'target\', \'_blank\');">en.wikipedia.org</a> and click on the <b>Random article</b> link (indicated). ' +
                'Look for a minor error in spelling, grammar, punctuation, or style and fix it. ' +
                'If you don\'t see one, click <b>Random article</b> again until you do. ' +
                'When done, click <b>Next</b> below.</p>' +
                '<p><a onclick="goToStep(\'LessonComplete\');">Next</a></p>';
            highlightElement('#n-randompage');
            break;
        case 'LessonComplete':
            instructions.innerHTML =
                '<p>Great job! You have completed the first level. Click <b>Level menu</b> below to choose another level.</p>' +
                '<p><a onclick="goToStep(\'Twa/LevelMenu\');">Level menu</a></p>';
            centerElement(instructions);
            break;
    }    
}

var updateCreateUser = function(step, instructions) {
    switch(step) {
        case "Start":
            instructions.innerHTML =
                '<p>Do you already have a user account registered on Wikipedia?</p>' +
                '<p><a onclick="goToStep(\'Twa/CreateAccount\');">Yes</a> <a onclick="goToStep(\'MainPageClickLogIn\');">No</a></p>';
            centerElement(instructions);
            break;
        case "MainPageClickLogIn":
            instructions.innerHTML =
                '<p>Under construction</p>';
            break;
    }    
}

var updateTwa = function(step, instructions) {
    switch(step) {
        case 'LevelMenu':
            instructions.innerHTML =
                '<p><b>Select a level</b></p>' +
                '<p><a href="' + wgArticlePath.replace('$1', 'Main_Page') + '" onclick="setStep(\'FirstEdit/Welcome\');">Making your first edit</a></p>' +
                '<p><i>More levels to come!</i></p>';
            centerElement(instructions);
            break;
        case "CreateAccount":
            instructions.innerHTML =
                '<p>Under construction</p>';
            break;
        case "Login":
            instructions.innerHTML =
                '<p>Under construction</p>';
            break;
    }
}

var updateOverlays = function() {
    // Must call before enabling links selectively below
    DisableEnableLinks();

    // Hide marker initially, so it won't show if it's not used
    var marker = document.getElementById('twa-marker');
    marker.innerHTML = '';

    var instructions = document.getElementById('twa-instructions');
    instructions.style.position='fixed';
    instructions.style.top = null;
    instructions.style.left = null;
    $(instructions).css('margin-top', null);
    $(instructions).css('margin-left', null);
    instructions.style.right = '10%';
    instructions.style.bottom = '10%';
    instructions.innerHTML = '';

    var stepComponents = getStep().split('/');
    window["update" + stepComponents[0]](stepComponents[1], instructions);

    if (instructions.innerHTML === '') {
        instructions.innerHTML = '<p><font color="#ff0000">Unknown step name: ' + getStep() + '</font></p>';
    }
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
    setStep("FirstEdit/Welcome");
}
updateOverlays();
