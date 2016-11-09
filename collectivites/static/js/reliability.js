'use strict';

var R = {
    listComplete: [],
    firstListName: 'listUpdate',
    secondListName: 'listSelect',
    displayNo : 'none',
    displayYes : 'flex',

    listIcones: {
        'edit': 'glyphicon glyphicon-pencil',
        'remove': 'glyphicon glyphicon-trash',
        'gotoright': 'glyphicon glyphicon-hand-right',
        'gotoleft': 'glyphicon glyphicon-hand-left',
        'children': 'glyphicon glyphicon-chevron-right',
        'parent': 'glyphicon glyphicon-chevron-down',
        'warning': 'glyphicon glyphicon-warning-sign',
        'close': 'glyphicon glyphicon-remove',
        'first': 'glyphicon glyphicon-fast-backward',
        'previous': 'glyphicon glyphicon-backward',
        'next': 'glyphicon glyphicon-forward',
        'end': 'glyphicon glyphicon-fast-forward'
    },

    pageInit: function(setList, nbGroups) {
        R.hideSearch();
        R.listComplete = R.initList(setList);
        R.verifyNbGroups(nbGroups);
        R.nbDisplayedInFirstList = nbGroups;
        R.displayNbListComplete(nbGroups);
        R.displayNbFirstList();
    },

    initList: function(list) {

        var key2 = 0;
        var groupList = [];

        for (var key = 0; key < list.length; key++) {
            while(list[key][key2]) {
                groupList[key2] = list[key][key2];
                groupList[key2].setId = key;
                groupList[key2].listName = R.firstListName;
                groupList[key2].displayInFirstList = R.displayYes;
                key2++;
            }
        }

        return groupList;
    },

    getContentFirstList: function() {
        var list = R.getContentListByListName(R.firstListName);
        return list;
    },

    getContentSecondList: function() {
        var list = R.getContentListByListName(R.secondListName);
        return list;
    },

    getIdByBanId: function(banId) {
        for (var key = 0; key < R.listComplete.length; key++) {
            if (R.listComplete[key].id == banId) {
                return key;
            }
        }
        throw 'Erreur : L\'Id Ban (' + banId + ') n\'a pas été trouvé.'
    },

    getContentListBySetId: function(setId, displayed = false) {
        var list = R.getContentListByProperty('setId', setId);
        return list;
    },

    getContentListByListName: function(listName) {
        var list = R.getContentListByProperty('listName', listName);
        return list;
    },

    getContentListByProperty: function(propertyName, propertyValue) {
        var list = [];

        for (var key = 0; key < R.listComplete.length; key++) {
            if (R.listComplete[key][propertyName] == propertyValue) {
                list[key] = R.listComplete[key];
            }
        }
        return list;
    },

    getContentListDisplayedBySetId: function(setId) {
        var list = [];

        for (var key = 0; key < R.listComplete.length; key++) {
            if (R.listComplete[key]['setId'] == setId
                    && R.listComplete[key]['displayInFirstList'] == R.displayYes
                    && R.listComplete[key]['listName'] == R.firstListName){
                list[key] = R.listComplete[key];
            }
        }
        return list;
    },

    getNbElementInList: function(list) {
        var nbElt  = 0;
        list.forEach(function() {
            nbElt++;
        });

        return nbElt;
    }

};

R.verifyNbGroups = function(nbGroups) {
    if (nbGroups != R.listComplete.length) {
        var error_message = 'Erreur : Le nombre de voies fourni à l\'IHM (' + nbGroups + ') et calculé lors de l\'affichage (' + R.listComplete.length + ') ne correspondent pas !!!';
        throw error_message;
    }
 }

 // ---------------------------------- Affiche la liste des voies d'une commune ----------------------------------------------------

R.groupIconAfter = '<a href="#" onClick="return POPIN.popUpdateForGroups(\'upd_groups\', this)"><i class="buttonIcon ' + R.listIcones['edit'] + '" title="Modifier le libellé de la voie"></i></a>'
        + '<a href="#" onClick="return POPIN.popRemoveForGroups(\'rem_groups\', this)"><i class="buttonIcon ' + R.listIcones['remove'] + '" title="Supprimer la voie"></i></a>'
        + '<a href="#" onClick="R.moveInButton(this, \'#listSelect\')"><i class="buttonIcon ' + R.listIcones['gotoright'] + '" title="Déplacer dans le sas de fiabilisation"></i></a>';
R.groupRadio = '<INPUT type="radio" name="groupselect" onclick="R.displayUpdate(this)">'
        + '<a href="#" class="updatebtn" onClick="return POPIN.popUpdateForGroups(\'upd_groups\', this)"><i class="buttonIcon ' + R.listIcones['edit'] + '" title="Modifier le libellé de la voie"></i></a>';
R.groupIconBefore = '<a href="#" onClick="R.moveInButton(this, \'#listUpdate\')"><i class="buttonIcon ' + R.listIcones['gotoleft'] + '" title="Déplacer dans la liste des voies"></i></a>';

R.groupListWithoutUlTmpl = '{{#each set_of_groups as |groups_in_set num_set|}}'
        +'<li class="block__set_of_groups{{#if_sup @num_set ' + (N.pagination - 1)   + '}} not_displayed_in_pagination{{/if_sup}}">'
        +   '<ul id="{{@num_set}}">'
        +       '<li class="block__all{{#if_sup groups_in_set.length 1}} block__all_display{{/if_sup}}" id="moveAll-{{@num_set}}" data-set_id="{{@num_set}}">'
        +           '<div class="groupname"></div>'
        +           '<div class="groupiconafter moveAll" >'
        +               '<a href="#" onClick="R.moveAllButton(this)">'
        +                   '<i class="buttonIcon ' + R.listIcones['gotoright'] + '" title="Déplacer dans le sas de fiabilisation"></i>'
        +               '</a>'
        +           '</div>'
        +       '</li>'
        +   '{{#each groups_in_set as |group num_group_in_set|}}'
        +       '{{#if_diff num_group_in_set "length"}}'
        +       '<li class="block__group" id="{{id}}" data-set_id="{{@num_set}}" data-group_id="{{@num_group_in_set}}" data-version="{{version}}">'
        +           '<div class="groupname" >'
        +               '{{# if message_alert}}<i class="' + R.listIcones['warning'] + '" '
        +                   'title="{{message_alert}}">'
        +               '</i>{{/if}}<span>{{name}}</span>'
        +           '</div>'
        +           '<div class="groupiconafter">' + R.groupIconAfter + '</div>'
        +       '</li>'
        +       '{{/if_diff}}'
        +   '{{/each}}'
        +   '</ul>'
        +'</li>{{/each}}';

R.displayGroups = function(encodedGroups, nbGroups) {

        var JSONgroups = decodeURIComponent(encodedGroups);

        var municipality = JSON.parse(JSONgroups).name;
        var citycode = JSON.parse(JSONgroups).citycode;

        if (nbGroups > 0) {
            var groups = JSON.parse(JSONgroups).groups;

            var titre = 'Commune de ' + municipality + ' (' + citycode + ')';

            listUpdate.innerHTML = Handlebars.compile(R.groupListWithoutUlTmpl)({ set_of_groups: groups });

            R.pageInit(groups, nbGroups);
        }
        else {
            var titre = 'Pas de voie pour la commune de ' + municipality + ' (' + citycode + ')';
        }

        Z.qs("#pagetitle").innerHTML = titre;

}

 // ----------------------------------Gestion des mouvements d'une liste à l'autre ------------------------------------

R.moveIn = function(element, idWhere) {

    R.iconeManagement(element, idWhere);
    R.HideOrShowSetWhereListChange(element, idWhere);
    var eltWhere = Z.qs(idWhere);
    eltWhere.appendChild(element);
    R.changeList(idWhere, element.id);
}

R.moveAllButton = function(element) {

    var idSetFrom = Z.parents('ul', element);
    var setId = idSetFrom.id;
    var list = R.getContentListDisplayedBySetId(setId);

    list.forEach(function(eltToMove) {
        R.moveIn(Z.qs('#' + eltToMove.id), '#' + R.secondListName);
    });

    R.activateButton();
    R.displayNbFirstList();
}

/* on cache le "set" de voie s'il n'y en a plus à l'intérieur */

R.HideOrShowSetWhereListChange = function(elt, idWhere) {
    var li;

    if (idWhere == '#' + R.secondListName) {
        var ulFrom = Z.parents('ul', elt);
        li = Z.parents('li', ulFrom);

        var list = R.getContentListDisplayedBySetId(ulFrom.id);
        var nbElt = R.getNbElementInList(list);
        if (nbElt <= 1) {
            Z.addClass(li, 'no_group');
        }
    }
    else {
        li = Z.parents('li', Z.qs(idWhere));
        Z.removeClass(li, 'no_group');
    }
}

//idWhere : identificateur pour la liste de réception
R.moveInButton = function(element, idWhere) {
    var eltToMove = Z.parents('LI', element);

    if (idWhere == '#' + R.firstListName) {
        idWhere = idWhere + " [id='" + eltToMove.dataset['set_id'] + "']";
    }

    R.moveIn(eltToMove, idWhere);

    R.activateButton();
    R.displayNbFirstList();
    R.blocAllDisplayed(eltToMove.dataset['set_id']);
    N.afterAction();

}

R.iconeManagement = function(eltToMove, idWhere) {
    idWhere = idWhere.replace ('#','');
    switch(idWhere) {
        case R.secondListName:
            eltToMove.children[0].innerHTML = R.groupIconBefore + eltToMove.children[0].innerHTML
            eltToMove.children[1].innerHTML = R.groupRadio;
            break;
        default:
            eltToMove.children[0].removeChild(eltToMove.children[0].firstChild);
            eltToMove.children[1].innerHTML = R.groupIconAfter;
            break;
    }
}

R.changeList = function(idWhere, banId) {
    var id = R.getIdByBanId(banId);
    var group = R.listComplete[id];
    var elt =  Z.qs(idWhere + ' #' + banId);

    idWhere = idWhere.split(' ')[0].replace('#','');

    if (idWhere == R.secondListName) {
        if( group.displayInFirstList == R.displayYes ) {
            R.decreaseNbFirstList();
        }
    }
    else {
        if( group.displayInFirstList == R.displayYes ) {
            R.increaseNbFirstList();
        }
    }

    R.listComplete[id].listName = idWhere;
}


// ------------------ Gestion du bouton de modif côté SAS -----------------------

R.displayUpdate = function(radioClicked) {
    var eltParent = Z.parents('LI', radioClicked);
    var elts = Z.qsa('#' + R.secondListName + ' .updatebtn');

    for (var eltNb = 0; eltNb < elts.length; eltNb++) {
        elts[eltNb].style.display = R.displayNo;
    }

    Z.qs('#' + eltParent.id + ' .updatebtn').style.display="inline-block";
    R.activateButton();
}

R.radioActivatedOnce = function() {
    var elts = Z.qsa('#' + R.secondListName + ' input[type="radio"]');

    for (var nb = 0; nb < elts.length; nb++) {
        if (elts[nb].checked) {return true;}
    }
    return false;
}

// ---------------------------Gestion du bouton de validation du SAS ------------------
R.activateButton = function() {
    var button = Z.qs('.block__end input[type="button"]');
    var container = Z.qs('#' + R.secondListName);
    var state = true;

    var moreThanTwoInSas = Z.moreThan(container, 2);
    var radioActivated = R.radioActivatedOnce();

    if (moreThanTwoInSas && radioActivated) {
        state = false;
    }
    R.changeElementState(button, state);
}

R.changeElementState = function(element, state = null) {
    if (state == true || state == false) {
        if (element.disabled != state) {
            element.disabled = state;
        }
    }
    else if (state == null) {
        element.disabled = !element.disabled;
    }
}

// -----------------------------Gestion de l'accordéon de la zone de recherche
R.showSearch = function() {
    Z.hide('.block__search-accordion .glyphicon-plus');
    Z.show('.block__search-accordion .glyphicon-minus');
    Z.show('.block__search .block__search-content');
}

R.hideSearch = function() {
    Z.show('.block__search-accordion .glyphicon-plus');
    Z.hide('.block__search-accordion .glyphicon-minus');
    Z.hide('.block__search .block__search-content');
}

// ------------------------------------------ Recherche ----------------------------------------
R.activateSearch = function() {

    var listToShow = R.wordSearch();
    if (listToShow.length > 0) {
        R.searchResult(listToShow);
        N.afterAction();
    }
    else alert("Pas de résultat");
}

R.wordSearch = function() {
    var stringComplete = Z.qs('input[name="words"]').value;
    var words = stringComplete.split(";");
    var list = R.searchWordsInListUpdate(words);
    return list;
}

// Définition des voies à afficher
R.searchWordsInListUpdate= function(wordsList) {
    var listLiOK = [];

    for (var key = 0; key < R.listComplete.length; key++) {
        var str = R.listComplete[key].name;
        str = str.toUpperCase();
        var nbWordsOK = 0;
        for (var nbwords = 0; nbwords < wordsList.length; nbwords++) {
            var word = wordsList[nbwords];
            word = word.toUpperCase();

            if (str.indexOf(word) != -1) {
                nbWordsOK++;
            }
        }
        if (nbWordsOK == wordsList.length) {
            listLiOK.push(R.listComplete[key]);
        }
    }
    return listLiOK;
}

R.displayInFirstListOrNot = function(groupId, listDisplayed) {
    var display = R.displayNo;
    var endOfLoop = false;
    var key = 0;

    do {
        if (groupId == listDisplayed[key]['id']) {
            display = R.displayYes;
            endOfLoop = true;
        }
        key++;
        if(!listDisplayed[key]) {
            endOfLoop = true;
        }
    } while (!endOfLoop);

    return display;
}

// Affichage du résultat de la recherche ainsi que mise à jour des compteurs et de la pagination
R.searchResult = function(listDisplayed) {
    var oldSetId = null;

    R.nbDisplayedInFirstList = 0;

    for (var key = 0; key < R.listComplete.length; key++) {
        var groupId = R.listComplete[key]['id'];
        var elt = Z.qs('#' + groupId);
        var parentUl = Z.parents('ul', elt);
        var setId =  R.listComplete[key].setId;

        var display = R.displayInFirstListOrNot(groupId, listDisplayed);
        R.listComplete[key].displayInFirstList = display;

        if (parentUl.id != R.secondListName) {
            if (display == R.displayYes) {
                R.nbDisplayedInFirstList++;
                R.removeClass(elt, 'word_not_found');
            }
            else {
                R.addClass(elt, 'word_not_found');
            }
        }
        else {
            var parentUl = Z.qs('ul [id="' + setId + '"]');
        }

        var parentLi = Z.parents('li', parentUl);

        if (setId != oldSetId) {
            if (oldSetId != null)   R.blocAllDisplayed(oldSetId);
            oldSetId = setId;
            R.addClass(parentLi, 'no_group_found');
        }
        if (display == R.displayYes) {
            R.removeClass(parentLi, 'no_group_found');
        }
    }

    R.blocAllDisplayed(oldSetId);
    R.displayNbFirstList();
}

 // --------------------------------------------------
 // Réinitialise la recherche
R.deactivateSearch = function() {
    Z.qs('input[name="words"]').value = "";
    R.activateSearch();
}

// Incrémente de 1 le nombre de voies présentes dans la première liste (voies paginées inclus)
R.increaseNbFirstList = function() {
    R.nbDisplayedInFirstList++;
}

// Décrémente de 1 le nombre de voies présentes dans la première liste (voies paginées inclus)
R.decreaseNbFirstList = function() {
    R.nbDisplayedInFirstList--;
}

// Affiche le nombre de voies présentes dans la première liste (voies paginées inclus)
R.displayNbFirstList = function() {
    Z.qs('#nblistUpdate').textContent = R.nbDisplayedInFirstList;
}

// Incrémente de 1 le nombre total de voies présentes dans toutes les listes (voies paginées inclus)
R.increaseNbListComplete = function() {
    R.listComplete.length++;
}
// Décrémente de 1 le nombre total de voies présentes dans toutes les listes (voies paginées inclus)
R.decreaseNbListComplete = function() {
    R.listComplete.length--;
}
// Affiche le nombre total de voies présentes dans toutes les listes (voies paginées inclus)
R.displayNbListComplete = function(nb) {
    Z.qs('#nbtotal').textContent = nb;
}

R.blocAllDisplayed = function(setId) {
    var list = R.getContentListDisplayedBySetId(setId);
    var nbElt = R.getNbElementInList(list);
    var eltMoveAll = Z.qs('#moveAll-' + setId);

    if (nbElt < 2) {
        R.removeClass(eltMoveAll, 'block__all_display');
    }
    else {
        R.addClass(eltMoveAll, 'block__all_display');
    }
}

R.addClass = function(element, className) {
    if (!Z.hasClass(element, className)) Z.addClass(element, className);
}

R.removeClass = function (element, className) {
    if (Z.hasClass(element, className)) Z.removeClass(element, className);
}

// --------------------------------------------- dédoublonnage -------------------------------------------

R.deduplicate = function() {
    var groups = R.listGroupsToDeDuplicate();
    console.log(groups);
}

// Récupère les voies présentes dans le SAS en séparant la voie référence des autres
R.listGroupsToDeDuplicate = function() {
    var contentList = Z.qs('#' + R.secondListName)['children'];
    var checkedElt = Z.qs('#' + R.secondListName + ' input[type="radio"]:checked');
    var groupId = Z.parents("LI", checkedElt)['id'];
    var listGroups = {
        groupToKeep: [],
        groupToRemove: []
    };

    for (var key = 0; key < contentList.length; key++) {

        if (contentList[key].id == groupId) {
            listGroups.groupToKeep.push(contentList[key]);
        }
        else {
        }
            listGroups.groupToRemove.push(contentList[key]);
    }

    return listGroups;
}

R.redirectGroup = function() {

}