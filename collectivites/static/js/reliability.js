'use strict';
var R = {
    listComplete: [],
    firstListName: 'listUpdate',
    secondListName: 'listSelect',
    displayNo : 'none',
    displayYes : 'flex',

    pageInit: function(setList, nbGroups) {
        R.hideSearch();
        R.listComplete = R.initList(setList);
        R.nbDisplayedInFirstList = R.listComplete.length;
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

    getContentListBySetId: function(setId) {
        return R.getContentListByProperty('setId', setId);
    },

    getContentListByListName: function(listName) {
        return R.getContentListByProperty('listName', listName);
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

};

R.verifyNbGroups = function(nbGroups) {
    if (nbGroups != R.listComplete.length) {
        var error_message = 'Erreur : Le nombre de voies fourni à l\'IHM (' + nbGroups + ') et calculé lors de l\'affichage (' + R.listComplete.length + ') ne correspondent pas !!!';
        throw error_message;
    }
}
 // ----------------------------------Gestion des mouvements d'une liste à l'autre ------------------------------------

R.moveIn = function(element, idWhere) {

    R.iconeManagement(element, idWhere);
    R.HideOrShowSetWhereListChange(element, idWhere);
    var eltWhere = Z.qs(idWhere);
    eltWhere.appendChild(element);
    R.changeList(idWhere, element.id);
}

/* on cache le "set" de voie s'il n'y en a plus à l'intérieur
 ou plus précisément lorsqu'il n'y en aura plus après le déplacement */

R.HideOrShowSetWhereListChange = function(elt, idWhere) {
    var idSet;

    if (idWhere == '#' + R.secondListName) {
        var idSetFrom = Z.parents('ul', elt);
        idSet = Z.parents('li', idSetFrom);
        if (!Z.moreThan(idSetFrom, 2)) {
            Z.addClass(idSet, 'no_group');
        }

    }
    else {
        idSet = Z.parents('li', Z.qs(idWhere));
        Z.removeClass(idSet, 'no_group');
    }
}

R.moveInButton = function(element, idWhere) {
    var eltToMove = Z.parents('LI', element);

    if (idWhere == '#' + R.firstListName) {
        idWhere = idWhere + " [id='" + eltToMove.dataset['set_id'] + "']";
    }

    R.moveIn(eltToMove, idWhere);

    R.activateButton();
    R.displayNbFirstList();

    return
}

R.iconeManagement = function(eltToMove, idWhere) {
    idWhere = idWhere.replace ('#','');
    switch(idWhere) {
        case R.secondListName:
            eltToMove.classList.remove("children");
            eltToMove.classList.remove("parent");
            eltToMove.children[0].innerHTML = groupIconBefore + eltToMove.children[0].innerHTML
                    .replace('<i class="' + listIcones['parent'] + '"></i>', '')
                    .replace('<i class="' + listIcones['children'] + '"></i>', '');
            eltToMove.children[1].innerHTML = groupRadio;
            break;
        default:
            eltToMove.children[0].removeChild(eltToMove.children[0].firstChild);
            eltToMove.children[1].innerHTML = groupIconAfter;
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
        elt.style.display = R.displayYes;
    }
    else {
        if( group.displayInFirstList == R.displayYes ) {
            R.increaseNbFirstList();
        }
        elt.style.display = group.displayInFirstList;
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

// ------------------------- Recherche ----------------------------------------
R.activateSearch = function() {

    var listToShow = R.wordSearch();
    R.search(listToShow);
}

R.wordSearch = function() {
    var stringComplete = Z.qs('input[name="words"]').value;
    var words = stringComplete.split(";");
    var list = R.searchWordsInListUpdate(words);
    return list;
}

R.searchWordsInListUpdate= function(wordsList) {
    var listLiOK = [];

    var list = R.listComplete;

    for (var key = 0; key < list.length; key++) {
        var str = list[key].name;
        str = str.toUpperCase();
        for (var nbwords = 0; nbwords < wordsList.length; nbwords++) {
            var word = wordsList[nbwords];
            word = word.toUpperCase();
            if (str.indexOf(word) != -1) {
                listLiOK.push(list[key]);
            }
        }
    }
    return listLiOK;
}

R.search = function(listDisplayed) {
    var list = R.listComplete;
    var display;
    var key2;
    var endOfLoop;
    var oldSetId = null;

    R.nbDisplayedInFirstList = 0;

    for (var key = 0; key < list.length; key++) {
        display = R.displayNo;
        key2 = 0;
        endOfLoop = false;

        do {
            if (list[key]['id'] == listDisplayed[key2]['id']) {
                display = R.displayYes;
                endOfLoop = true;
            }
            key2++;
            if(!listDisplayed[key2]) {
                endOfLoop = true;
            }
        } while (!endOfLoop);

        R.listComplete[key].displayInFirstList = display;

        var elt = Z.qs('#' + list[key]['id']);
        var parentUl = Z.parents('ul', elt);
        var setId =  R.listComplete[key].setId;

        if (parentUl.id != R.secondListName ) {
            elt.style.display = display;
            if (display == R.displayYes) R.nbDisplayedInFirstList++;
        }
        else {
            var parentUl = Z.qs('ul [id="' + setId + '"]');
        }

        var parentLi = Z.parents('li', parentUl);

        if (setId != oldSetId) {
            oldSetId = setId;
            // Evite la redondance de la classe
            if (!Z.hasClass(parentLi, 'no_group_found')) {Z.addClass(parentLi, 'no_group_found');console.log(setId);}
        }

        if (display == R.displayYes) {
            Z.removeClass(parentLi, 'no_group_found');
        }
    }

    R.displayNbFirstList();
}

 // --------------------------------------------------
R.deactivateSearch = function() {
    Z.qs('input[name="words"]').value = "";
    R.activateSearch();
}

R.increaseNbFirstList = function() {
    R.nbDisplayedInFirstList++;
}

R.decreaseNbFirstList = function() {
    R.nbDisplayedInFirstList--;
}

R.displayNbFirstList = function() {
    Z.qs('#nblistUpdate').textContent = R.nbDisplayedInFirstList;
}

R.increaseNbListComplete = function() {
    R.listComplete.length++;
}

R.decreaseNbListComplete = function() {
    R.listComplete.length--;
}

R.displayNbListComplete = function(nb) {
    Z.qs('#nbtotal').textContent = nb;
}