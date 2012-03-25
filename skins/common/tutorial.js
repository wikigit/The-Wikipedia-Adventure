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

var updateInstructionsPosition = function() {
    var oDiv=document.getElementById('twa-instructions');
    var scrollpos = getScrollingPosition();
    oDiv.style.left = '' + (scrollpos[0] + window.innerWidth - 300) + 'px';
    oDiv.style.top = '' + (scrollpos[1] + window.innerHeight - 200) + 'px';
}

window.onresize = function(event) {
     updateInstructionsPosition();
}

window.onscroll = function(event) {
     updateInstructionsPosition();
}

var oDiv =document.createElement('div');
oDiv.setAttribute('style','width: 200px; height: 100px; background-color:#FFFF88;');
oDiv.id = 'twa-instructions';
oDiv.innerHTML = 'Begin by clicking on the "Log in / create account" link in the upper-right corner.'
oDiv.style.position='absolute';
var root=document.getElementsByTagName('body')[0];
root.appendChild(oDiv)
updateInstructionsPosition();

var oDiv =document.createElement('div');
oDiv.id = 'twa-marker';
oDiv.innerHTML = '<b>Click here</b>'
oDiv.style.position='absolute';
oDiv.style.left = '200px';
oDiv.style.top = '20px';
var oLogin=document.getElementById('pt-login');
oLogin.appendChild(oDiv);

DisableEnableLinks();

var loginLink = oLogin.getElementsByTagName('a')[0];
loginLink.onclick = function(){alert('Good!'); return true;}
