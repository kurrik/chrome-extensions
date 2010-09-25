var lastElem = null;
var lastElemStyle = null;

function getStyles(elem, names) {
  var styles = {};
  var computedStyle = document.defaultView.getComputedStyle(elem);
  for (var i = 0; i < names.length; i++) {
    styles[names[i]] = computedStyle.getPropertyValue(names[i]);
  }
  return styles;
};

function setStyles(elem, styles) {
  for (var name in styles) {
    if (styles.hasOwnProperty(name)) {
      elem.style.setProperty(name, styles[name]);
    }
  }
};

function setFont(elem, font) {
  window.removeEventListener('mousemove', onMouseMove, true);
  resetOldStyles();
  
  var link = document.createElement('link');
  link.rel = "stylesheet";
  link.type = "text/css";
  link.href = "http://fonts.googleapis.com/css?family=" + 
              encodeURIComponent(font);
  document.head.appendChild(link);  
  
  var elemqueue = [elem];
  while (elemqueue.length > 0) {
    var e = elemqueue.shift();
    e.style.setProperty('font-family', font);
    for (var i=0; i < e.children.length; i++) {
      elemqueue.push(e.children[i]);
    }
  }
};

function saveStyles(elem, styles) {
  lastElem = elem;
  lastElemStyle = getStyles(elem, styles);
};

function resetOldStyles() {
  if (lastElem) {
    setStyles(lastElem, lastElemStyle);
    lastElem = null;
    lastElemStyle = null;
  }
};
 
function onMouseMove(evt) {
  var elem = document.elementFromPoint(evt.clientX, evt.clientY);
  if (elem != lastElem) {
    window.setTimeout(function(){
      resetOldStyles();
      saveStyles(elem, ['-webkit-box-shadow', 'cursor', 'border']);
      setStyles(elem, {
          '-webkit-box-shadow': '0 2px 6px #f66', 
          'cursor': 'pointer',
          'border': '2px solid #f00'
      });
    }, 100);
  }
};

window.addEventListener('mousemove', onMouseMove, true);