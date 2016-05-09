from flask import url_for, session


def test_cant_access_ban_batch_view_without_auth(client):
    assert client.get(url_for('ban_batch')).status_code == 302


def test_can_access_ban_batch_view_with_auth(client):
    session['oauth_token'] = 'ok'
    assert client.get(url_for('ban_batch')).status_code == 302
