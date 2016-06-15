// Ouverture de la popin en modification
POPIN.popUpdateForGroups = function(div, object) {

    eltFrom = Z.parents('LI', object);

    eltTo = Z.qs('.popin_update_groups .block_info');
    eltTo.id = eltFrom.id;
    eltTo.innerHTML = '<p>Modification du libellé de la voie "' + eltFrom.dataset.value + '"</p>';

    eltTo = Z.qs('#group_name_new');
    eltTo.value = "";

    return POPIN.pop(div);
}

// Ouverture de la popin en suppression
POPIN.popRemoveForGroups = function(div, object) {
    eltFrom = Z.parents('LI', object);

    eltTo = Z.qs('.popin_remove_groups .block_info');
    eltTo.id = eltFrom.id;
    eltTo.innerHTML = '<p>Etes vous sûr de vouloir supprimer la voie "' + eltFrom.dataset.value + '"</p>';

    return POPIN.pop(div);
}

// Modification du libellé de la voie
POPIN.updateAndHide = function(div, object) {

    eltId = Z.qs('.popin_update_groups .block_info').id;
    eltTo = Z.qs('#list #' + eltId);
    eltFrom = Z.qs('#group_name_new');
    if (eltFrom.value == "") {
        alert('Le libellé ne doit pas être vide. Veuillez renseigner le bon libellé.');
        return;
        }

    if (eltTo.dataset.value != eltFrom.value) {
    // TODO: ne modifie que l'affichage : optimiser lors de l'accès à la base
    // TODO: Faudra vérifier si la nouvelle valeur est conforme (avertissement si ce n'est pas le cas),
    // TODO: mettre à jour la base puis récupérer la nouvelle valeur en base et mettre à jour l'affichage
    // TODO: (avertissement si non conforme).
    // (on va chercher la donnée dans la ban mais on ne s'en sert pas).
    Z.get({uri: uriGroup + '/group/' + eltId, callback: function (err, xhr) {
                if (err) return console.error(err);
                eltTo.dataset.value = eltFrom.value;
                eltTo = Z.qs('#list #' + eltId + ' span');
                eltTo.textContent = eltFrom.value;
                }});
    }

    return POPIN.hide(div);
}

// Suppression de la voie
POPIN.removeAndHide = function(div, object) {

    eltId = Z.qs('.popin_remove_groups .block_info').id;
    eltTo = Z.qs('#list #' + eltId);

    // TODO: suppression en base
    // Supprime de l'affichage
    eltTo.remove();

    return POPIN.hide(div);
}
