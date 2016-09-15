'use strict';

// Ouverture de la popin en modification
POPIN.popUpdateForGroups = function(div, object) {

    var eltFrom = Z.parents('LI', object);
    var eltTo = Z.qs('.popin_update_groups .block_info');
    var warning = Z.qs('#upd_groups .warning');

    warning.innerHTML = "";

    eltTo.id = eltFrom.id;
    eltTo.innerHTML = '<p>Modification du libellé de la voie "' + eltFrom.textContent + '"</p>';

    eltTo = Z.qs('#group_name_new');
    eltTo.value = "";

    return POPIN.pop(div);
}

// Ouverture de la popin en suppression
POPIN.popRemoveForGroups = function(div, object) {
    var eltFrom = Z.parents('li', object);

    var eltTo = Z.qs('.popin_remove_groups .block_info');
    eltTo.id = eltFrom.id;
    eltTo.innerHTML = '<p>Etes vous sûr de vouloir supprimer la voie "' + eltFrom.textContent + '"</p>';

    return POPIN.pop(div);
}

// Modification du libellé de la voie
POPIN.updateAndHide = function(div, object) {

    var eltId = Z.qs('.popin_update_groups .block_info').id;
    var eltTo = Z.qs('#' + eltId + ' span');
    var id = R.getIdByBanId(eltId);
    var eltFrom = Z.qs('#group_name_new');
    var warning = Z.qs('#upd_groups .warning');


    if (eltFrom.value == "") {
        alert('Le libellé ne doit pas être vide. Veuillez renseigner le bon libellé.');
        return;
    }

    if (eltTo.textContent != eltFrom.value) {


    Z.get({uri: "verification?groupName=" + eltFrom.value, callback: function (err, xhr) {
        if (err) return console.error(err);

        var alertResponse = JSON.parse(xhr.responseText);
        if (alertResponse.alert == true) {
            warning.innerHTML = alertResponse.message_alert.replace(/\n/g, '<br />');
        }
        else {

            var url = uriGroup + '/group/' + eltId;
            var name = eltFrom.value;

            Z.get({uri: 'update?url=' + uriGroup + '/group/' + eltId + '&name=' + eltFrom.value, callback: function (err, xhr) {
                if (err) return console.error(err);

                // TODO: ne modifie que l'affichage : optimiser lors de l'accès à la base
                // TODO: Faudra vérifier si la nouvelle valeur est conforme (avertissement si ce n'est pas le cas),
                // TODO: mettre à jour la base puis récupérer la nouvelle valeur en base et mettre à jour l'affichage
                // TODO: (avertissement si non conforme).
                // (on va chercher la donnée dans la ban mais on ne s'en sert pas).
                 Z.get({uri: 'select?url=' + uriGroup + '/group/' + eltId, callback: function (err, xhr) {
                        if (err) return console.error(err);
                        var group = JSON.parse(xhr.responseText);

                        R.listComplete[id].name = group.name;
                        eltTo.textContent = R.listComplete[id].name;

                        if (Z.qs('#' + eltId + ' .glyphicon-warning-sign')) Z.qs('#' + eltId + ' .glyphicon-warning-sign').remove();
                        POPIN.hide(div);

                    }});
                }});
            }
        }});
    }
}

// Suppression de la voie
POPIN.removeAndHide = function(div, object) {

    var eltId = Z.qs('.popin_remove_groups .block_info').id;
    var eltTo = Z.parents('li', Z.qs('#' + R.firstListName + ' #' + eltId));
    var id = R.getIdByBanId(eltId);

    // TODO: suppression en base
    // Supprime de l'affichage
    eltTo.remove();

    delete R.listComplete[id];
    R.listComplete = Z.reorgArray(R.listComplete);

    R.decreaseNbFirstList();

    R.displayNbListComplete(R.listComplete.length);
    R.displayNbFirstList();

    N.afterAction();

    return POPIN.hide(div);
}
