var lastElem = null;
var lastElemStyle = null;

/**
 * Given and element and an array of CSS style names, returns a dictionary
 * of the element's current style for each of the requested names.
 */
function getStyleList(elem, names) {
  var styles = {};
  var computedStyle = document.defaultView.getComputedStyle(elem);
  for (var i = 0; i < names.length; i++) {
    styles[names[i]] = computedStyle.getPropertyValue(names[i]);
  }
  return styles;
};

/**
 * Called every time the mouse is moved.  If the mouse has moved to a new 
 * element, restore the original styling for the previous element and 
 * add the highlighted styles for the new element.
 */
function onMouseMove(evt) {
  var elem = document.elementFromPoint(evt.clientX, evt.clientY);
  if (elem != lastElem) {
    window.setTimeout(function(){
      resetOldStyles();
      saveElementStyles(elem, ['-webkit-box-shadow', 'cursor', 'border']);
      setStyleList(elem, {
          '-webkit-box-shadow': '0 2px 6px #f66', 
          'cursor': 'pointer',
          'border': '2px solid #f00'
      });
    }, 100);
  }
};

/**
 * Return the original styles to the element that's currently highlighted.
 */
function resetOldStyles() {
  if (lastElem) {
    setStyleList(lastElem, lastElemStyle);
    lastElem = null;
    lastElemStyle = null;
  }
};

/**
 * Given an element and a list of style names, saves the current values of 
 * each style, along with a reference to the element.
 */
function saveElementStyles(elem, styles) {
  lastElem = elem;
  lastElemStyle = getStyleList(elem, styles);
};

/**
 * Sets the font on the currently selected element.
 */
function setFont(elem, font) {
  window.removeEventListener('mousemove', onMouseMove, true);
  resetOldStyles();
  setStyleList = function() {};
  
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

/**
 * Given an element and a dictionary of css/value pairs, sets the element's 
 * style to the values in the dictionary.
 */
function setStyleList(elem, styles) {
  for (var name in styles) {
    if (styles.hasOwnProperty(name)) {
      elem.style.setProperty(name, styles[name]);
    }
  }
};

window.addEventListener('mousemove', onMouseMove, true);