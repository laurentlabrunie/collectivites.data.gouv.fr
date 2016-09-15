'use strict';
var N = {
    pagination: 100,

    initPagination: function() {
        var list = Z.qsa("#listUpdate .block__set_of_groups:not(.no_group_found):not(.no_group)");
        N.nbPage = Math.ceil(list.length / N.pagination);
        Z.qs("#nbPage").textContent = N.nbPage;
        N.numPage = 1;
        Z.qs("#numPage").textContent = N.numPage;
        N.displayButton();
    },

    hideAndShow: function() {
        var list = Z.qsa("#listUpdate .block__set_of_groups:not(.no_group_found):not(.no_group)");
        for (var key = 0; key < list.length; key++) {
            if (key >= ((N.numPage-1)*N.pagination) && key < (N.numPage*N.pagination)) {
                R.removeClass(list[key], "not_displayed_in_pagination");
            }
            else {
                R.addClass(list[key], "not_displayed_in_pagination");
            }
        }
    },

    displayButton: function(){
        if (N.numPage == 1) {
            R.addClass(Z.qs("." +  R.listIcones['first'].replace(' ','.')), "buttonHidden");
            R.addClass(Z.qs("." +  R.listIcones['previous'].replace(' ','.')), "buttonHidden");
        }
        else {
            R.removeClass(Z.qs("." +  R.listIcones['first'].replace(' ','.')), "buttonHidden");
            R.removeClass(Z.qs("." +  R.listIcones['previous'].replace(' ','.')), "buttonHidden");
        }

        if (N.numPage == N.nbPage) {
            R.addClass(Z.qs("." +  R.listIcones['next'].replace(' ','.')), "buttonHidden");
            R.addClass(Z.qs("." +  R.listIcones['end'].replace(' ','.')), "buttonHidden");
        }
        else {
            R.removeClass(Z.qs("." +  R.listIcones['next'].replace(' ','.')), "buttonHidden");
            R.removeClass(Z.qs("." +  R.listIcones['end'].replace(' ','.')), "buttonHidden");
        }
    },

    changeNumPage: function() {
        Z.qs("#numPage").textContent = N.numPage;
    },

    moveFirst: function() {
        N.numPage = 1;
        N.hideAndShow();
        N.displayButton();
        N.changeNumPage();
    },

    movePrevious: function() {
        N.numPage--;
        N.hideAndShow();
        N.displayButton();
        N.changeNumPage();
    },

    moveNext: function() {
        N.numPage++;
        N.hideAndShow();
        N.displayButton();
        N.changeNumPage();
    },

    moveLast: function() {
        N.numPage = N.nbPage;
        N.hideAndShow();
        N.displayButton();
        N.changeNumPage();
    },

    afterAction: function() {
        N.initPagination();
        N.hideAndShow();
        N.displayButton();
    }
};