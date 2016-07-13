'use strict';

var BAN = {};

BAN.balUploader = function (selector) {

    var onSuccess = function (body) {
        try {
            body = JSON.parse(body);
        } catch (err) {
            Z.qs('.error').innerHTML = body;
            Z.addClass(Z.qs(selector), 'has-error');
            return;
        }
        var container = Z.el('div', 'bal-reports', Z.qs(selector));
        if (!body.report) {
            Z.qs('.error').innerHTML = JSON.stringify(body);
            Z.addClass(Z.qs(selector), 'has-error');
            return;
        }
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

var resultsTmpl = '<ul>{{#each municipalities}}<li><a data-citycode="{{citycode}}" data-department="{{department}}" data-name="{{name}}" href>{{name}} ({{department}})</a></li>{{/each}}</ul>';

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


/* Recherche les communes correspondant à la saisie puis les affiche sous forme de lien
        qui lance la génération de la liste des voies pour la commune et ouvre l'IHM de fiabilisation. */

BAN.displaySelectorMunicipalityForDuplicate = function (selector1, selector2) {
    Z.qs(selector1 + ' input').addEventListener('input', function (event) {
        BAN.searchMunicipality(selector1, event.target.value);
    });
    Z.qs(selector1 + ' .results').addEventListener('click', function (e) {
        if (e.target.nodeName.toLowerCase() === 'a') {
            Z.qs(selector2 + ' #message').innerHTML = "<h1>En cours de traitement<h1>";
            BAN.listGroupsComplete(selector2, e.target.dataset);
            Z.stop(e);
            Z.qs(selector1 + ' .results').classList.add('hidden');
        }
    });
    window.addEventListener('endOfLoad', function (e) {
        Z.qs(selector2 + ' #message').innerHTML = "<h1>En cours de préparation<h1>";
        Z.qs(selector2 + ' #formGroups').submit();
    });
}

/* Récupère la liste totale des voies pour une commune à partir du numéro insee
        et la met en session sous forme JSON */

//var uriGroup = 'http://ban-dev.data.gouv.fr';
var uriGroup = 'http://localhost:5959';
var event = new CustomEvent('endOfLoad');
var groupsJSONToArray = [];
var groupsMunicipalityArray = [];
var JSONObj;

BAN.listGroupsComplete = function (selector, municipality) {

    var citycode = municipality.citycode;
    var name = municipality.name;

    groupsMunicipalityArray = {
        "name": name,
        "citycode" : citycode
    }

    citycode = citycode || '01001';

    var uriComplete = uriGroup + '/municipality/insee:' + citycode + '/groups?limit=100';

    BAN.banGroups(selector, uriComplete);
}

/* fonction récurrente qui empile les listes de voies (groups) récupérées par paquets pour en faire la liste complète
        et la stocke en session */
BAN.banGroups = function (selector, url) {
            Z.get({ uri: url , callback: function (err, xhr) {
                if (err) return console.error(err);
                console.log(xhr.responseText);
                JSONObj = JSON.parse(xhr.responseText);
                groupsJSONToArray = groupsJSONToArray.concat(JSONObj.collection);

                if (false == JSONObj.hasOwnProperty('next')) {
                    groupsMunicipalityArray["groups"] = groupsJSONToArray;

                    Z.qs(selector + ' input').value = encodeURIComponent(JSON.stringify(groupsMunicipalityArray));
                    window.dispatchEvent(event);
                }
                else {
                    BAN.banGroups(selector, JSONObj.next);
                }
            }});
    }

/* Affiche la liste des voies d'une commune */

var listIcones = {
    'edit': 'glyphicon glyphicon-pencil',
    'remove': 'glyphicon glyphicon-trash',
    'gotoright': 'glyphicon glyphicon-hand-right',
    'gotoleft': 'glyphicon glyphicon-hand-left',
    'children': 'glyphicon glyphicon-chevron-right',
    'parent': 'glyphicon glyphicon-chevron-down',
    'warning': 'glyphicon glyphicon-warning-sign',
    'close': 'glyphicon glyphicon-remove'
}

var groupIconAfter = '<a href="#" onClick="return POPIN.popUpdateForGroups(\'upd_groups\', this)">'
        +   '<i class="buttonIcon ' + listIcones['edit'] + '" title="Modifier le libellé de la voie"></i>'
        + '</a>'
        + '<a href="#" onClick="return POPIN.popRemoveForGroups(\'rem_groups\', this)">'
        +   '<i class="buttonIcon ' + listIcones['remove'] + '" title="Supprimer la voie"></i>'
        + '</a>'
        + '<a href="#" onClick="R.moveInButton(this, \'#listSelect\')">'
        +   '<i class="buttonIcon ' + listIcones['gotoright'] + '" title="Déplacer dans le sas de fiabilisation"></i>'
        + '</a>';
var groupRadio = '<INPUT type="radio" name="groupselect" onclick="R.displayUpdate(this)">'
        + '<a href="#" class="updatebtn" onClick="return POPIN.popUpdateForGroups(\'upd_groups\', this)">'
        +   '<i class="buttonIcon ' + listIcones['edit'] + '" title="Modifier le libellé de la voie"></i>'
        + '</a>';
var groupIconBefore = '<a href="#" onClick="R.moveInButton(this, \'#listUpdate\')">'
        +   '<i class="buttonIcon ' + listIcones['gotoleft'] + '" title="Déplacer dans la liste des voies"></i>'
        + '</a>';

var groupListWithoutUlTmpl = '{{#each set_of_groups as |groups_in_set num_set|}}'
        +'<li class="block__set_of_groups block__set_of_groups_with_groups">'
        +   '<ul id="{{@num_set}}">'
        +       '<li class="block__all {{#if_sup groups_in_set.length 1}}block__all_display{{/if_sup}}" id="moveAll-{{@num_set}}" data-set_id="{{@num_set}}">'
        +           '<div class="groupname"></div>'
        +           '<div class="groupiconafter moveAll" >'
        +               '<a href="#" onClick="R.moveAllButton(this)">'
        +                   '<i class="buttonIcon ' + listIcones['gotoright'] + '" title="Déplacer dans le sas de fiabilisation"></i>'
        +               '</a>'
        +           '</div>'
        +       '</li>'
        +   '{{#each groups_in_set as |group num_group_in_set|}}'
        +       '{{#if_diff num_group_in_set "length"}}'
        +       '<li class="block__group" id={{id}} data-set_id="{{@num_set}}" data-group_id="{{@num_group_in_set}}">'
        +           '<div class="groupname" >'
        +               '{{# if message_alert}}<i class="' + listIcones['warning'] + '" '
        +                   'title="{{message_alert}}">'
        +               '</i>{{/if}}<span>{{name}}</span>'
        +           '</div>'
        +           '<div class="groupiconafter">' + groupIconAfter + '</div>'
        +       '</li>'
        +       '{{/if_diff}}'
        +   '{{/each}}'
        +   '</ul>'
        +'</li>{{/each}}';

BAN.displayGroups = function(encodedGroups, nbGroups) {
    var JSONgroups = decodeURIComponent(encodedGroups);

    var municipality = JSON.parse(JSONgroups).name;
    var citycode = JSON.parse(JSONgroups).citycode;
    var groups = JSON.parse(JSONgroups).groups;

    Z.qs("#pagetitle").inner;
    listUpdate.innerHTML = Handlebars.compile(groupListWithoutUlTmpl)({ set_of_groups: groups });
    R.pageInit(groups, nbGroups);
}

