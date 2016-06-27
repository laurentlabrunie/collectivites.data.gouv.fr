'use strict';
var R = {
    listComplete: [],
    firstListName: 'listUpdate',
    secondListName: 'listSelect',
    displayNo : 'none',
    displayYes : 'flex',

    pageInit: function(groupList, nbGroups) {
        R.hideSearch();
        R.listComplete = R.initList(groupList);
        R.nbDisplayedInFirstList = R.listComplete.length;
        R.verifyNbGroups(nbGroups);
        R.displayNbListComplete(nbGroups);
        R.displayNbFirstList();
    },

    initList: function(groupList) {

        for (var key = 0; key < groupList.length; key++) {
            groupList[key].listName = R.firstListName;
            groupList[key].displayInFirstList = R.displayYes;
        }
        return groupList;
    },

    getContentListByListName: function(listName) {
        var list = [];

        for (var key = 0; key < R.listComplete.length; key++) {
            if (R.listComplete[key].listName == listName) {
                list[key] = R.listComplete[key];
            }
        }
        return list;
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
    }

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
    var eltWhere = Z.qs(idWhere);
    eltWhere.appendChild(element);
    R.changeList(idWhere, element.id);
}

R.moveInButton = function(element, idWhere) {
    var eltToMove = Z.parents('LI', element);
    var isParent = eltToMove.classList.contains('parent');

    if (isParent) {
        var childIds = R.getChildren(eltToMove);
        R.moveIn(eltToMove, idWhere);
        R.moveChilds(childIds, idWhere);
    }
    else {
        R.moveIn(eltToMove, idWhere);
    }

    R.activateButton();
    R.displayNbFirstList();

}

R.getChildren = function(element) {
    var idParent = element.id;
    var ulParent = Z.parents('UL', element);
    var listIdChilds = new Array();

    for (var eltNb = 0; eltNb < ulParent.children.length; eltNb++) {
        var elt = ulParent.children[eltNb];

        if (elt.dataset.parent_id == idParent) {
            listIdChilds.push(elt.id);
        }
    }
    return listIdChilds;
}

R.moveChilds = function(childIds, idWhere) {
    for (var idNb = 0; idNb < childIds.length; idNb++) {
        var eltToMove = Z.qs('#' + childIds[idNb]);
        eltToMove.style.display = R.displayYes;
        R.moveIn(eltToMove, idWhere);
    }
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
        case R.firstListName:
            eltToMove.children[0].removeChild(eltToMove.children[0].firstChild);
            eltToMove.children[1].innerHTML = groupIconAfter;
            break;
    }
}

R.changeList = function(idWhere, banId) {
    var id = R.getIdByBanId(banId);
    var group = R.listComplete[id];
    var elt =  Z.qs(idWhere + ' #' + banId);

    if (idWhere == '#' + R.secondListName) {
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

    R.listComplete[id].listName = idWhere.replace('#','');
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

R.moreThan = function(container, limitNumber) {
    if (container.children.length >= limitNumber) {
        return true;
    } else {
        return false;
    }
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

    var moreThanTwoInSas = R.moreThan(container, 2);
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

    R.nbDisplayedInFirstList = 0;

    for (var key = 0; key < list.length; key++) {
        display = R.displayNo;

        for (var key2 = 0; key2 < listDisplayed.length; key2++) {
            if (list[key]['id'] == listDisplayed[key2]['id']) {
                display = R.displayYes;
            }
        }

        R.listComplete[key].displayInFirstList = display;

        var elt = Z.qs('#' + list[key]['id']);
        var parent = elt.parentElement.id;

        if (parent == R.firstListName ) {
            elt.style.display = display;
            if (display ==  R.displayYes) R.nbDisplayedInFirstList++;
        }
    }
console.log(R.nbDisplayedInFirstList);
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