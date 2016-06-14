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

    var uriComplete = uriGroup + '/municipality/insee:' + citycode + '/groups?limit=10000';

    BAN.banGroups(selector, uriComplete);
}

/* fonction récurrente qui empile les listes de voies (groups) récupérées par paquets pour en faire la liste complète
        et la stocke en session */
BAN.banGroups = function (selector, url) {
            Z.get({ uri: url , callback: function (err, xhr) {
                if (err) return console.error(err);
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

/* Affiche la liste des voies d'une commune et gère le fonctionnement du drag and drop */

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

var groupIconAfter = '<a href="#" onClick="return POPIN.popUpdateForGroups(\'mod_groups\', this)">'
        +   '<i class="' + listIcones['edit'] + '" title="Modifier le libellé de la voie"></i>'
        + '</a>'
        + '<a href="#" onClick="return POPIN.popRemoveForGroups(\'rem_groups\', this)">'
        +   '<i class="' + listIcones['remove'] + '" title="Supprimer la voie"></i>'
        + '</a>'
        + '<a href="#" onClick="BAN.moveIn(this, \'#select\')">'
        +   '<i class="' + listIcones['gotoright'] + '" title="Déplacer dans le sas de fiabilisation"></i>'
        + '</a>';

var groupIconBefore = '<a href="#" onClick="BAN.moveIn(this, \'#list\')">'
        +   '<i class="' + listIcones['gotoleft'] + '" title="Déplacer dans la liste des voies"></i>'
        + '</a>';

var groupListWithoutUlTmpl = '{{#each groups}}<li class="draggable {{class_children}} {{class_parent}}" '
        + 'data-compare="{{data_to_compare}}" id="{{id}}" '
        + 'data-parent_id="{{parent_id}}" data-value="{{name}}" >'
        + '<div class="groupname">{{# if class_children}}<i class="' + listIcones['children'] + '"></i>{{/if}}'
        + '{{# if class_parent}}<i class="' + listIcones['parent'] + '"></i>{{/if}}'
        + '{{# if message_alert}}<i class="' + listIcones['warning'] + '" '
        + 'title="{{message_alert}}"></i>{{/if}} <span>{{name}}</span></div>'
        + '<div class="groupiconafter">' + groupIconAfter + '</div></li>{{/each}}';

BAN.displayGroups = function(encodedGroups) {
    var JSONgroups = decodeURIComponent(encodedGroups);

    var municipality = JSON.parse(JSONgroups).name;
    var citycode = JSON.parse(JSONgroups).citycode;
    var groups = JSON.parse(JSONgroups).groups;

    Z.qs("#pagetitle").innerHTML = 'Fiabiliser les noms de voies dans la BAN pour la commune de ' + municipality
            + ' (' + citycode + ')';

    var list = document.getElementById('list');
    var listSort = Sortable.create(list, {
        group: {
            name: 'groups',
            pull: true,
            put: true
            },
        draggable: '.draggable',
        sort: false,
        onAdd: function(evt) {
            var elt = evt.item;
            var oldParent = evt.from.id;
            var newParent = elt.parentElement.id;
            if (newParent != oldParent) {
                BAN.iconeManagement(elt, newParent);
                }
            }
        });

    list.innerHTML = Handlebars.compile(groupListWithoutUlTmpl)({ groups: groups });

    var select = document.getElementById('select');
    var selectSort = Sortable.create(select, {
        group: {
            name: 'groups',
            pull: true,
            put: true
            },
        sort: false,
        onAdd: function(evt) {
            var elt = evt.item;
            var oldParent = evt.from.id;
            var newParent = elt.parentElement.id;
            if (newParent != oldParent) {
                BAN.iconeManagement(elt, newParent);
                }
            }
        });
}

BAN.moveIn = function(element, idWhere) {
    var eltToMove = Z.parents('LI', element);
    BAN.iconeManagement(eltToMove, idWhere)
    var eltWhere = Z.qs(idWhere);
    eltWhere.appendChild(eltToMove);
}

BAN.iconeManagement = function(eltToMove, idWhere) {
    idWhere = idWhere.replace ('#','');
    switch(idWhere) {
        case 'select':
            eltToMove.classList.remove("children");
            eltToMove.classList.remove("parent");
            eltToMove.childNodes[0].innerHTML = groupIconBefore + eltToMove.childNodes[0].innerHTML
                    .replace('<i class="' + listIcones['parent'] + '"></i>', '')
                    .replace('<i class="' + listIcones['children'] + '"></i>', '');
            eltToMove.childNodes[1].innerHTML = '';
            break;
        case 'list':
            eltToMove.childNodes[0].removeChild(eltToMove.childNodes[0].firstChild);
            eltToMove.childNodes[1].innerHTML = groupIconAfter;
            break;
    }
}
