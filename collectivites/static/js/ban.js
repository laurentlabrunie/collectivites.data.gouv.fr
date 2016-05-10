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

var groupListTmpl = '<ul>{{#each groups}}<li>{{name}}</li>{{/each}}</ul>';

BAN.listGroups = function (selector, municipality) {
    municipality = municipality || '01001';
    Z.get({ uri: 'http://ban-dev.data.gouv.fr/municipality/insee:' + municipality + '/groups?limit=100', callback: function (err, xhr) {
        if (err) return console.error(err);
        Z.qs(selector).innerHTML = Handlebars.compile(groupListTmpl)({ groups: JSON.parse(xhr.responseText).collection });
    }});
}

var resultsTmpl = '<ul>{{#each municipalities}}<li><a data-citycode="{{citycode}}" href>{{name}} ({{department}})</a></li>{{/each}}</ul>';

BAN.displaySelector = function (selector) {
    Z.qs(selector + ' input').addEventListener('input', function (event) {
        BAN.searchMunicipality(selector, event.target.value);
    });
    Z.qs(selector + ' .results').addEventListener('click', function (e) {
        if (e.target.nodeName.toLowerCase() === 'a') {
            BAN.listGroups('#groups', e.target.dataset.citycode);
            Z.stop(e);
            Z.qs(selector + ' .results').classList.add('hidden');
        }
    });
}

BAN.searchMunicipality = function (selector, q) {
    Z.get({ uri: 'https://api-adresse.data.gouv.fr/search?q=' + encodeURIComponent(q), callback: function (err, xhr) {
        if (err) return console.error(err);
        var municipalities = JSON.parse(xhr.responseText).features.filter(function (f) {
            return ['city', 'town', 'village'].indexOf(f.properties.type) >= 0;
        }).map(function (f) {
            return { name: f.properties.name, citycode: f.properties.citycode, department: f.properties.citycode.substr(0, 2) };
        })
        Z.qs(selector + ' .results').innerHTML = Handlebars.compile(resultsTmpl)({ municipalities: municipalities });
        Z.qs(selector + ' .results').classList.remove('hidden');
    }});
}
