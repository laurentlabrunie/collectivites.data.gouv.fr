'use strict';

var POPIN = {};

POPIN.pop = function (div) {
    document.getElementById(div).style.display='block';
    return false;
}

POPIN.hide = function (div) {
    document.getElementById(div).style.display='none';
    return false;
}
