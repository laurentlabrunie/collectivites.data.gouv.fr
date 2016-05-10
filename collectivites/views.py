from functools import wraps

from flask import (abort, redirect, render_template, request, session,
                   url_for)
from flask.ext.oauthlib.client import OAuth
import requests
from werkzeug import security

from . import app


@app.route('/')
def index():
    return render_template('index.html')


def auth_required(func):
    @wraps(func)
    def wrapper():
        if not session.get('oauth_token'):
            return redirect('/')  # TODO login page.
        return func()
    return wrapper


def with_ban_session(func):
    @wraps(func)
    def wrapper():
        if not session.get('ban_token'):
            url = '{base_url}/token'.format(base_url=app.config['BAN_URL'])
            resp = requests.post(url, data={
                'grant_type': 'client_credentials',
                'client_id': app.config['BAN_CLIENT_ID'],
                'client_secret': app.config['BAN_CLIENT_SECRET'],
                'ip': '1.2.3.4'
            })
            token = resp.json()['access_token']
            session['ban_token'] = token
        return func()
    return wrapper


@app.route('/ban/batch/', methods=['GET', 'POST'])
@auth_required
@with_ban_session
def ban_batch():
    if request.method == 'POST':
        token = session.get('ban_token')
        auth = "Bearer {}".format(token)
        resp = requests.post('http://localhost:5959/import/bal',
                             headers={'Authorization': auth},
                             files={'data': ('f.csv', request.files['data'])})
        return resp.text
    return render_template('ban/batch.html')

@app.route('/ban/groups')
def ban_groups():
    return render_template('ban/groups.html')


# Oauth
oauth = OAuth(app)

# Data.gouv.fr
dgfr = oauth.remote_app(
    'dgfr',
    base_url='https://www.data.gouv.fr/api/1/',
    request_token_url=None,
    request_token_params={'scope': 'default'},
    access_token_method='POST',
    access_token_url='https://www.data.gouv.fr/oauth/token',
    authorize_url='https://www.data.gouv.fr/oauth/authorize',
    app_key='DATAGOUV'
)


@dgfr.tokengetter
def get_oauth_token():
    return session.get('oauth_token')


@app.route('/login/<provider>/')
def login(provider):
    if provider == "dgfr":
        remote_app = dgfr
    else:
        abort(400, 'Unknown login provider')
    return remote_app.authorize(
        callback=url_for('authorized', provider=provider, _external=True),
        state=security.gen_salt(10),
        nonce=security.gen_salt(10),
    )


@app.route('/logout/')
def logout():
    session.pop('oauth_token', None)
    session.pop('username', None)
    session.pop('fullname', None)
    url = request.referrer or url_for('index')
    return redirect(url)


def get_dgfr_user_details(data):
    return {
        'username': data['id'],
        'fullname': ' '.join([data['first_name'], data['last_name']])
    }


@app.route('/authorized/<provider>/')
def authorized(provider):
    token_key = "access_token"
    if provider == 'dgfr':
        remote_app = dgfr
        endpoint = 'me'
        getter = get_dgfr_user_details
    resp = remote_app.authorized_response()
    if resp is None:
        return 'Access denied: reason=%s error=%s' % (
            request.args['error_reason'],
            request.args['error_description']
        )
    session['oauth_token'] = (resp[token_key],
                              resp.get('oauth_token_secret', ''))  # Oauth1
    session['auth_provider'] = provider
    data = getter(remote_app.get(endpoint).data)
    session['username'] = data['username']
    session['fullname'] = data['fullname']
    url = request.referrer or url_for('index')
    return redirect(url)


@app.context_processor
def shared_context():
    return {
        "SITE_NAME": "collectivités.data.gouv.fr",
        "SITE_URL": app.config['SITE_URL'],
        "BASELINE": "Le portail des collectivités territoriales pour la modernisation",  # noqa
        "DESCRIPTION": "Portail des collectivités pour la modernisation",
        "TWITTER": "@SGMAP",
        "API_URL": app.config['API_URL'],
        "CONTACT_EMAIL": "collectivites@data.gouv.fr"
    }
