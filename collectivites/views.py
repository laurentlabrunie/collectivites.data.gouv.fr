from functools import wraps

from flask import (abort, redirect, render_template, request, session,
                   url_for)
from flask.ext.oauthlib.client import OAuth
import requests

from werkzeug import security

from . import app
from . import utils
from . import addr_utils
from . import compare


@app.route('/')
def index():
    return render_template('index.html', url=app.config['BAN_URL'])


def auth_required(func):
    @wraps(func)
    def wrapper():
        sess = session
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
        url = '{base_url}/import/bal'.format(base_url=app.config['BAN_URL'])
        resp = requests.post(url,
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
    session.pop('ban_token', None)
    session.pop('userId', None)
    session.pop('fullname', None)
    session.pop('email', None)
    url = request.referrer or url_for('index')
    return redirect(url)


def get_dgfr_user_details(data):
    return {
        'userId': data['id'],
        'fullname': ' '.join([data['first_name'], data['last_name']]),
        'email': data['email']
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
    session['userId'] = data['userId']
    session['fullname'] = data['fullname']
    session['email'] = data['email']
    url = request.referrer or url_for('index')
    return redirect(url)


@app.context_processor
def shared_context():
    return {
        "SITE_NAME": "territoires.data.gouv.fr",
        "SITE_URL": app.config['SITE_URL'],
        "BASELINE": "Le portail des territoires pour la modernisation",  # noqa
        "DESCRIPTION": "Portail des territoires pour la modernisation",
        "TWITTER": "@SGMAP",
        "API_URL": app.config['API_URL'],
        "CONTACT_EMAIL": "collectivites@data.gouv.fr"
    }


@app.route('/ban/duplication')
def ban_duplication():
    return render_template('ban/duplication.html')


@app.route('/ban/reliability', methods=['POST'])
def ban_reliability():

    list_content = utils.decode_and_unjson(request.form['list'])
    nb_groups = len(list_content['groups'])

    if nb_groups != '0':
        make_file = compare.MakeGroupList(list_content)
        content_complete = make_file.create_content_complete()
        groups = utils.json_and_encode(content_complete)
    else:
        groups = request.form['list'],

    return render_template('ban/reliability.html',
                           groups=groups,
                           nb_groups=nb_groups)


@app.route('/ban/update', methods=['GET', 'POST'])
@auth_required
@with_ban_session
def ban_update():
    token = session.get('ban_token')
    auth = "Bearer {}".format(token)
    url = request.args['url']
    name = request.args['name']
    resp = requests.post(url, headers={'Authorization': auth}, data={'name': name})
    return resp.text


@app.route('/ban/select', methods=['GET', 'POST'])
@auth_required
@with_ban_session
def ban_select():
    token = session.get('ban_token')
    auth = "Bearer {}".format(token)
    url = request.args['url']
    resp = requests.get(url, headers={'Authorization': auth})
    return resp.text


@app.route('/ban/verification', methods=['GET'])
def ban_verification():

    group_name = request.args['groupName']
    addr = addr_utils.AddrGroup(group_name)
    message_alert = addr_utils.construction_message(addr)

    if message_alert == "":
        alert = False
    else:
        alert = True

    return utils.json.dumps({'alert': alert, 'message_alert': message_alert})

