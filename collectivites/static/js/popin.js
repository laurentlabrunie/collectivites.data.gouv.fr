'use strict';

var POPIN = {};

POPIN.pop = function (div) {
    Z.show('#' + div);
    return false;
}

POPIN.hide = function (div) {
    Z.hide('#' + div);
    return false;
}
