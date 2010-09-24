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

function onMouseMove(evt) {
  var elem = document.elementFromPoint(evt.clientX, evt.clientY);
  if (elem != lastElem) {
    var elemStyle = getStyles(elem, ['border', 'cursor']);
    setStyles(elem, {'border': '1px solid #f00', 'cursor': 'pointer'});
    if (lastElem) {
      setStyles(lastElem, lastElemStyle);
    }
    lastElem = elem;
    lastElemStyle = elemStyle;
  }
};

window.addEventListener('mousemove', onMouseMove, true);