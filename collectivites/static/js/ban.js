'use strict';

var BAN = {};

BAN.balUploader = function (selector) {

    var onSuccess = function (body) {
        body = JSON.parse(body);
        var container = Z.el('div', 'bal-reports', Z.qs(selector));
        if (body.report.error) printLevel(container, 'error', body.report);
        if (body.report.notice) printLevel(container, 'notice', body.report);
    }

    var printLevel = function (container, level, msgs) {
        Z.el('h4', '', container, level);
        var ul = Z.el('ul', '', container);
        for (var i = 0; i < msgs[level].length; i++) {
            Z.el('li', '', ul, msgs[level][i].msg + ': ' + msgs[level][i].total);
        }
    }

    Z.fileUploader({container: selector, uri: '.', onSuccess: onSuccess});
}
