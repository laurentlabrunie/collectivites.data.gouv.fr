'use strict';
var reliability = {
    listToShow: [],

    pageInit: function() {
        reliability.hideFilter();
        reliability.afterChange();
    },

    initList: function(ulElt) {
        var list = [];
        var elts = ulElt.children;

        for (var nbLiElt = 0; nbLiElt < elts.length; nbLiElt++) {
            var elt = elts[nbLiElt];
            list[elt.id] = [elt.textContent];
        }
        list.length = nbLiElt;
        return list;
    },

    afterChange: function() {
        reliability.listToShow = reliability.initList(Z.qs('#list'));
        reliability.activateFilter();
    }
};

reliability.moveIn = function(element, idWhere) {
    reliability.iconeManagement(element, idWhere);
    var eltWhere = Z.qs(idWhere);
    eltWhere.appendChild(element);
}

reliability.moveInButton = function(element, idWhere) {
    var eltToMove = Z.parents('LI', element);
    var isParent = eltToMove.classList.contains('parent');

    if (isParent) {
        var childIds = reliability.getChildren(eltToMove);
        reliability.moveIn(eltToMove, idWhere);
        reliability.moveChilds(childIds, idWhere);
    }
    else {
        reliability.moveIn(eltToMove, idWhere);
    }
    reliability.activateButton();
    reliability.afterChange();
}

reliability.getChildren = function(element) {
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

reliability.moveChilds = function(childIds, idWhere) {
    for (var idNb = 0; idNb < childIds.length; idNb++) {
        var eltToMove = Z.qs('#' + childIds[idNb]);
        reliability.moveIn(eltToMove, idWhere);
    }
}

reliability.iconeManagement = function(eltToMove, idWhere) {
    idWhere = idWhere.replace ('#','');
    switch(idWhere) {
        case 'select':
            eltToMove.classList.remove("children");
            eltToMove.classList.remove("parent");
            eltToMove.children[0].innerHTML = groupIconBefore + eltToMove.children[0].innerHTML
                    .replace('<i class="' + listIcones['parent'] + '"></i>', '')
                    .replace('<i class="' + listIcones['children'] + '"></i>', '');
            eltToMove.children[1].innerHTML = groupRadio;
            break;
        case 'list':
            eltToMove.children[0].removeChild(eltToMove.children[0].firstChild);
            eltToMove.children[1].innerHTML = groupIconAfter;
            break;
    }
}

reliability.displayUpdate = function(radioClicked) {
    var eltParent = Z.parents('LI', radioClicked);
    var elts = Z.qsa('#select .updatebtn');

    for (var eltNb = 0; eltNb < elts.length; eltNb++) {
        elts[eltNb].style.display="none";
    }

    Z.qs('#' + eltParent.id + ' .updatebtn').style.display="inline-block";
    reliability.activateButton();
}

reliability.moreThan = function(container, limitNumber) {
    if (container.children.length >= limitNumber) {
        return true;
    } else {
        return false;
    }
}

reliability.radioActivatedOnce = function() {
    var elts = Z.qsa('#select input[type="radio"]');

    for (var nb = 0; nb < elts.length; nb++) {
        if (elts[nb].checked) {return true;}
    }
    return false;
}

reliability.activateButton = function() {
    var button = Z.qs('.block__end input[type="button"]');
    var container = Z.qs('#select');
    var state = true;

    var moreThanTwoInSas = reliability.moreThan(container, 2);
    var radioActivated = reliability.radioActivatedOnce();

    if (moreThanTwoInSas && radioActivated) {
        state = false;
    }
    reliability.changeElementState(button, state);
}

reliability.changeElementState = function(element, state = null) {
    if (state == true || state == false) {
        if (element.disabled != state) {
            element.disabled = state;
        }
    }
    else if (state == null) {
        element.disabled = !element.disabled;
    }
}

reliability.showFilter = function() {
    Z.hide('.block__filter-accordion .glyphicon-plus');
    Z.show('.block__filter-accordion .glyphicon-minus');
    Z.show('.block__filter .block__filter-content');
}

reliability.hideFilter = function() {
    Z.show('.block__filter-accordion .glyphicon-plus');
    Z.hide('.block__filter-accordion .glyphicon-minus');
    Z.hide('.block__filter .block__filter-content');
}

reliability.activateFilter = function() {

    var listToShow = reliability.wordFilter(reliability.listToShow);
    reliability.filter(Z.qs('#list'), listToShow);
}

reliability.wordFilter = function(list) {
    var stringComplete = Z.qs('input[name="words"]').value;
    var words = stringComplete.split(";");
    list = reliability.searchWordsInList(list, words);
    return list;
}

reliability.searchWordsInList= function(list, wordsList) {
    var listLiOK = [];

    for (var banId in list) {
        var str = list[banId];
        str = str.toString().toUpperCase();
        for (var nbwords = 0; nbwords < wordsList.length; nbwords++) {
            var word = wordsList[nbwords];
            word = word.toUpperCase();
            if (str.indexOf(word) != -1) {
                listLiOK[banId]=list[banId];
                listLiOK.length++;
            }
        }
    }
    return listLiOK;
}

reliability.filter = function(ulElt, list) {
    var elts = ulElt.children;
    var display;
    for (var nbLiElt = 0; nbLiElt < elts.length; nbLiElt++) {
        display = false;
        var elt = elts[nbLiElt];
        for (var banId in list) {
            if (banId == elt.id) {
                display = true;
            }
        }
        if (display == false) {
            elt.style.display = 'none';
        } else {
            elt.style.display = 'flex';
        }
    }
    Z.qs('#nbfiltre').textContent = list.length;
}

reliability.deactivateFilter = function() {
    Z.qs('input[name="words"]').value = "";
    reliability.activateFilter();
}