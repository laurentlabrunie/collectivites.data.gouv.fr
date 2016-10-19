'use strict';

// Ouverture de la popin en modification
POPIN.popUpdateForGroups = function(div, object) {

    var eltFrom = Z.parents('LI', object);
    var eltTo = Z.qs('.popin_update_groups .block_info');
    var warning = Z.qs('#upd_groups .warning');

    Z.get({uri:'select?url=' + BAN.getUri() + '/group/' + eltFrom.id, callback: function (err, xhr) {
        if (err) return console.error(err);

        var eltMAJ = JSON.parse(xhr.responseText);

        warning.innerHTML = "";

        var oldName = eltFrom.textContent;
        var lastName = eltMAJ.name;

        eltTo.dataset.diff = "0";
        if (eltFrom.dataset.version != eltMAJ.version) {
            eltTo.dataset.diff = "1";
            if (lastName != oldName) {
                warning.innerHTML = "Attention : le nom de la voie a été modifié entre temps :<br />- Avant : " + oldName + "<br />- En cours : "+ lastName;
                eltTo.dataset.diff = "2";
            }
        }

        eltTo.id = eltFrom.id;
        eltTo.dataset.lastname = lastName;
        eltTo.dataset.version = eltMAJ.version;

        eltTo.innerHTML = '<p>Modification du libellé de la voie "' + lastName + '"</p>';

        var eltTo2 = Z.qs('#group_name_new');
        eltTo2.placeholder = lastName;

        return POPIN.pop(div);
    }});
}

// Fermeture de la popin de modification sans modification
POPIN.hidePopUpdateForGroupsWithoutSave = function(div) {

    var eltFrom = Z.qs('.popin_update_groups .block_info');
    var eltId = eltFrom.id;
    var eltTo = Z.qs('#' + eltId);
    var eltToName = Z.qs('#' + eltId + ' span');
    var warning = Z.qs('#upd_groups .warning');

    Z.get({uri: "verification?groupName=" + eltFrom.dataset.lastname, callback: function (err, xhr) {
        if (err) return console.error(err);

        var alertResponse = JSON.parse(xhr.responseText);
        if (alertResponse.alert == true) {
            warning.innerHTML = alertResponse.message_alert.replace(/\n/g, '<br />');
        }
        else {
            if (Z.qs('#' + eltId + ' .glyphicon-warning-sign')) Z.qs('#' + eltId + ' .glyphicon-warning-sign').remove();
            switch(eltFrom.dataset.diff) {
                case "1":
                    eltTo.dataset.version = eltFrom.dataset.version;
                    break;
                case "2":
                    eltToName.textContent = eltFrom.dataset.lastname;
                    eltTo.dataset.version = eltFrom.dataset.version;
                    break;
                }
                return POPIN.hide(div);
            }
        }});
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
POPIN.updateAndHide = function(div) {

    var eltId = Z.qs('.popin_update_groups .block_info').id;
    var eltVersion = Z.qs('.popin_update_groups .block_info').dataset.version;
    var eltVersion1 = parseInt(eltVersion,10)+parseInt(1,10);
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

            var url = BAN.getUri() + '/group/' + eltId;
            var name = eltFrom.value;

            Z.get({uri: 'update?url=' + BAN.getUri() + '/group/' + eltId + '&name=' + eltFrom.value + '&version=' + eltVersion1, callback: function (err, xhr) {
                if (err) return console.error(err);

                // TODO: ne modifie que l'affichage : optimiser lors de l'accès à la base
                // TODO: Faudra vérifier si la nouvelle valeur est conforme (avertissement si ce n'est pas le cas),
                // TODO: mettre à jour la base puis récupérer la nouvelle valeur en base et mettre à jour l'affichage
                // TODO: (avertissement si non conforme).
                // (on va chercher la donnée dans la ban mais on ne s'en sert pas).
                 Z.get({uri: 'select?url=' + BAN.getUri() + '/group/' + eltId, callback: function (err, xhr) {
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
POPIN.removeAndHide = function(div) {

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
