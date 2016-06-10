POPIN.popForGroups = function(div, object) {
    eltFrom = object.parentElement.parentElement;

    eltTo = Z.qs('.popin_groups .block_info');
    eltTo.id = eltFrom.id;
    eltTo.innerHTML = '<p>' + eltFrom.dataset.value + '</p>';

    eltTo = Z.qs('#group_name_new');
    eltTo.value = "";

    return POPIN.pop(div);
}

POPIN.updateAndHide = function(div, object) {

    eltId = Z.qs('.popin_groups .block_info').id;
    eltTo = Z.qs('#list #' + eltId);
    eltFrom = Z.qs('#group_name_new');

    eltTo.dataset.value = eltFrom.value;

    eltTo = Z.qs('#list #' + eltId + ' span');
    eltTo.textContent = eltFrom.value;

    return POPIN.hide(div);
}