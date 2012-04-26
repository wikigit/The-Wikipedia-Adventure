// Created by Derrick Coetzee in 2012. All rights waived under Creative Commons
// Zero Waiver (http://creativecommons.org/publicdomain/zero/1.0/).

// Based on http://www.codeproject.com/Tips/61476/Disable-all-links-on-the-page-via-Javascript
function disableLinks(){
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

function tutorialapi(data, func) {
	$.get(wgScriptPath + "/tutorialapi.php", data, func);
}

function logAction(action, value) {
	logActionFunc(action, value, function() { });
}

function logActionFunc(action, value, func) {
	tutorialapi(
		{ action: 'log',
		  user: '',
		  step: getStep(),
		  user_action: action,
		  value: value },
		func);
}

function getStep() {
    result = $.cookie("twa-step");
    return result;
}

function setStep(stepName) {
    if (stepName.indexOf("/") == -1) {
        components = getStep().split('/');
        setStep(components[0] + "/" + stepName);
        return;
    }
    $.cookie("twa-step", stepName, { path: '/' });
}

function goToStep(stepName) {
    setStep(stepName);
    updateOverlays();
}

function centerElement(element) {
    element.style.top = '50%';
    element.style.left = '50%';
    element.style.right = '';
    element.style.bottom = '';
    $(element).css('margin-top', '' + -$(element).height()/2 + 'px');
    $(element).css('margin-left', '' + -$(element).width()/2 + 'px');
};

// Visually highlights a given element - currently can only do one at a time
function highlightElement(target) {
    var marker = document.getElementById('twa-marker');
    marker.innerHTML = '<img src="' + stylepath + '/common/images/Up-1.png" width="100" height="89"/>';
    offset = $(target).offset();
    marker.style.left = '' + (offset.left + $(target).width()/2 - $(marker).width()/2) + 'px'; // center
    marker.style.top = '' + (offset.top + $(target).height()) + 'px'; // right under pt-login
    return target;
};

function updateFirstEdit(step, instructions) {
    switch(step) {
        case 'Welcome':
            instructions.innerHTML =
                '<div style="text-align:right;"><a onclick="logAction(\'login\', \'\'); goToStep(\'Twa/Login\');">Log in</a></div>' +
                '<p>Welcome to <b>The Wikipedia Adventure</b>, a tutorial for new Wikipedia users. Instructions will appear in the lower-right.</p>' +
                '<p>Would you like to review how to make an edit to an article?</p>' +
                '<p><a onclick="logAction(\'yes\', \'\'); goToStep(\'MainPageClickArticle\');">Yes</a> ' +
                '<a onclick="logAction(\'no\', \'\'); goToStep(\'CreateUser/Start\');">No</a></p>';
            centerElement(instructions);
            break;
        case "MainPageClickArticle":
            instructions.innerHTML =
                '<p>Begin by clicking on the <b>George Tupou V</b> link to visit the article on George Tupou V, King of Tonga.</p>';
            articleLink = $(highlightElement('a[title="George Tupou V"]'))[0];
            articleLink.onclick = function(){
				logActionFunc('clickarticle', '', function() {
					setStep('FindError');
					window.location.href = articleLink.href;
				});
				return false;
			};
            break;
        case 'FindError':
            instructions.innerHTML =
                '<p>You are now reading the article on George Tupou V. This article contains a small error in its first sentence. ' +
                'Try to find it and click on it.</p>';
            var content = $("div[class=mw-content-ltr]")[0];
            content.innerHTML = content.innerHTML.replace(" deth ", ' <span id="deth" onclick="logAction(\'clickerror\', \'\'); goToStep(\'ShowError\')">deth</span> ');
            break;
        case 'ShowError':
            instructions.innerHTML =
                '<p>Nice spotting! The error is that "death" is misspelled as "deth". We\'re going to fix this.</p>' +
                '<p><a onclick="logAction(\'next\', \'\'); goToStep(\'ClickEditTab\');">Next</a></p>';
            $('#deth')[0].onclick = null;
            highlightElement('#deth');
            break;
        case 'ClickEditTab':
            instructions.innerHTML =
                '<p>Start by clicking on the <b>Edit</b> tab to edit the article.</p>';
            editLink = $(highlightElement('#ca-edit')).find('a')[0];
            editLink.onclick = function(){
				logActionFunc('edittab', '', function() {
					setStep('Editing');
					window.location.href = editLink.href;
				});
				return false;
			};
            break;
        case 'Editing':
            instructions.innerHTML =
                '<p>You are now editing the article. Find the misspelled word <b>deth</b> and change it to "death", then click <b>Next</b> below.</p>' +
                '<p><a onclick="logAction(\'next\', \'\'); goToStep(\'DoneEditing\');">Next</a></p>';
            desired_value = $('#wpTextbox1')[0].value.replace(' deth ', ' death ');
            break;
        case 'DoneEditing':
            if ($('#wpTextbox1')[0].value == desired_value) {
                instructions.innerHTML =
                    '<p>Good job! Next, click on the <b>Summary</b> field and enter a short explanation for your edit, such as "fixed spelling error". ' +
                    'This is called an <i>edit summary</i>, and every edit should have one. Then click <b>Next</b> below.</p>' +
                    '<p><a onclick="logAction(\'next\', $(\'#wpSummary\')[0].value); goToStep(\'DoneSummary\');">Next</a></p>';
                highlightElement('#wpSummary');
            } else {
                instructions.innerHTML =
                    '<p>You made the change incorrectly. Make sure you changed <b>deth</b> to "death" and <b>made no other changes</b>. ' +
                    'Click <b>Next</b> below to try again.</p>' +
                    '<p><a onclick="logAction(\'next\', \'\'); goToStep(\'DoneEditing\');">Next</a></p>';
            }
            break;
        case 'DoneSummary':
            if ($('#wpSummary')[0].value.length > 0) {
                instructions.innerHTML =
                    '<p>Great! Finally, click on <b>Save page</b> to save your changes to the article.</p>';
                $('#editform')[0].onsubmit = function(){
                    // Don't really let them save - just redirect back to article, we'll fake the changes.
                    // TODO: if they attempt incorrectly more than once the message won't appear to change
                    logActionFunc('save', '', function() {
                        setStep('ShowArticleWithChange');
                        window.location.href = wgArticlePath.replace('$1', 'George_Tupou_V');
					});
                    return false;
                }
                highlightElement('#wpSave');
            } else {
                instructions.innerHTML =
                    '<p>You did not enter a summary. ' +
                    'Click on the <b>Summary</b> field indicated by the arrow and enter a short explanation for your edit, such as "fixed spelling error". ' +
                    'Then click <b>Next</b> below.</p>' +
                    '<p><a onclick="logAction(\'next\', $(\'#wpSummary\')[0].value); goToStep(\'DoneSummary\');">Next</a></p>';
            }
            break;
        case 'ShowArticleWithChange':
            instructions.innerHTML =
                '<p>Your changes to the article appear instantly to all readers. ' +
                'If your changes were incorrect, another user can always easily change it back. ' +
                'Click <b>Next</b> below for your <b>Real Wikipedia Bonus Task</b>.</p>' +
                '<p><a onclick="logAction(\'next\', \'\'); goToStep(\'RealWikipediaBonusTask\');">Next</a></p>';
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
                '<p><a onclick="logAction(\'next\', \'\'); goToStep(\'LessonComplete\');">Next</a></p>';
            highlightElement('#n-randompage');
            break;
        case 'LessonComplete':
            instructions.innerHTML =
                '<p>Great job! You have completed the first level. Click <b>Level menu</b> below to choose another level.</p>' +
                '<p><a onclick="logAction(\'levelmenu\', \'\'); goToStep(\'Twa/LevelMenu\');">Level menu</a></p>';
            centerElement(instructions);
            break;
    }    
}

function updateCreateUser(step, instructions) {
    switch(step) {
        case "Start":
            instructions.innerHTML =
                '<p>Do you already have a user account registered on Wikipedia?</p>' +
                '<p><a onclick="logAction(\'yes\', \'\'); goToStep(\'Twa/CreateAccount\');">Yes</a> ' +
                '<a onclick="logAction(\'no\', \'\'); goToStep(\'MainPageClickLogIn\');">No</a></p>';
            centerElement(instructions);
            break;
        case "MainPageClickLogIn":
            instructions.innerHTML =
                '<p>Under construction</p>';
            break;
    }    
}

function registerCheck() {
	logAction('register', ''); 
    goToStep('RegisterSuccess');
}

function updateTwa(step, instructions) {
    switch(step) {
        case 'LevelMenu':
            instructions.innerHTML =
                '<p><b>Select a level</b></p>' +
                '<p><a href="' + wgArticlePath.replace('$1', 'Main_Page') + '" onclick="logAction(\'Making your first edit\', \'\'); setStep(\'FirstEdit/Welcome\');">Making your first edit</a></p>' +
                '<p><i>More levels to come!</i></p>';
            break;
        case "CreateAccount":
            instructions.innerHTML =
                '<div style="text-align:right;"><a onclick="logAction(\'login\', \'\'); goToStep(\'Twa/Login\');">Log in</a></div>' +
                '<p>Please register so you can save your progress.</p>' +
                '<form name="register" onsubmit="registerCheck(); return false;">' +
                'Username (same as your Wikipedia username):<br/>' + 
                '<input type="text" name="username" /><br />' +
                'Password (may be different from your Wikipedia password):<br/>' + 
                '<input type="text" name="password" /><br />' +
                'Confirm password:<br/>' + 
                '<input type="text" name="password-confirm" /><br/>' +
                'E-mail address:<br/>' + 
                '<input type="text" name="e-mail" />' +
                '<p><input name="registerButton" type="submit" value="Register" /></p>' +
                '</form>';
            break;
        case "RegisterSuccess":
            instructions.innerHTML =
                '<p>Under construction</p>';
            break;
        case "Login":
            instructions.innerHTML =
                '<p>Under construction</p>';
            break;
    }
    centerElement(instructions);
}

function updateOverlays() {
    // Must call before enabling links selectively in step handler
    disableLinks();

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

function createDynamicElements() {
	var root=$('body')[0];

	var instructions =document.createElement('div');
	instructions.setAttribute('style','width: 300px; background-color:#FFFF88; border:2px solid; box-shadow: 10px 10px 5px rgba(128, 128, 128, 0.3);');
	instructions.id = 'twa-instructions';
	root.appendChild(instructions);

	var marker =document.createElement('div');
	marker.id = 'twa-marker';
	marker.style.position='absolute';
	root.appendChild(marker);	
}

createDynamicElements();
if (document.URL.indexOf("/Main_Page") != -1) {
    setStep("FirstEdit/Welcome");
}
updateOverlays();
