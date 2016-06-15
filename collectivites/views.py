from functools import wraps

from flask import (abort, redirect, render_template, request, session,
                   url_for)
from flask.ext.oauthlib.client import OAuth
import requests

from werkzeug import security

from . import app
from . import utils
from addr_utils import AddrGroup


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
    make_file = MakeGroupList(list_content)
    content_complete = make_file.create_content_complete()

    return render_template('ban/reliability.html',
            groups=utils.json_and_encode(content_complete),
            nb_groups=nb_groups)


class MakeGroupList:

    """ travaille la liste d'origine et génère une liste où sont identifiés les doublons """

    def __init__(self, list_content):
        self.municipality = list_content['name']
        self.citycode = list_content['citycode']
        self.list_groups = list_content['groups']
        self.content_ordered = []
        self.content_complete = {}

    def add_compare_element(self):

        """ prépare les données à comparer

         (non finalisé pour l'instant) """

        for group in self.list_groups:

            addr = AddrGroup(group['name'])
            group['data_to_compare'] = addr.guess_typeof_street + addr.guess_strong_word
            group['message_alert'] = self.construction_message(addr)

    def construction_message(self, addr):

        """ """

        message_alert = ''
        message_content = []

        if addr.is_label_only_uppercased:
            message_content.append('Tous les caractères sont en majuscule')
        if (addr.is_label_bad_capitalized):
            message_content.append('Des caractères sont mal capitalisés')
        if (addr.is_label_with_repetition):
            message_content.append('Des mots sont en double')

        if len(message_content) != 0:
            message_alert = 'Mauvais libellé :'
            for value in message_content:
                    message_alert = message_alert + '\n - ' + value

        return message_alert

    def compare_groups(self):

        """ compare les voies et génère une nouvelle liste où sont identifiés les différents doublons potentiels :
           pour chaque voie étudiée dans la première liste,
           on la copie d'abord dans la seconde liste
           puis on la supprime dans la première

           Et c'est ensuite que l'on fait la comparaison... """

        nb_groups_before = len(self.list_groups)

        while len(self.list_groups) != 0:
            parent_id = self.list_groups[0]['id']
            self.content_ordered.append(self.list_groups[0])
            del self.list_groups[0]
            self.compare_one_group_to_others(parent_id)

        nb_groups_after = len(self.content_ordered)

        if nb_groups_before != nb_groups_after:
            raise ValueError('Fonction "compare_groups" : le nombre de voie est différent avant '
                                'et après le traitement : Avant <' + str(nb_groups_before) + '> '
                                'et Après <' + str(nb_groups_after) + '>')


    def compare_one_group_to_others(self, parent_id):

        """ ...compare la dernière voie de la seconde liste avec toutes les autres voies de la première
           et identifie les doublons...

           ...puis copie ces doublons à la suite de la voie comparée, et les supprime dans la première liste. """

        index_group = 0
        nb_group = len(self.list_groups)
        index_last_ordered = len(self.content_ordered)-1
        while nb_group > index_group:
            if self.list_groups[index_group]['data_to_compare'] \
                    == self.content_ordered[index_last_ordered]['data_to_compare']:
                self.content_ordered[index_last_ordered]['class_parent'] = 'parent'
                self.list_groups[index_group]['parent_id'] = parent_id
                self.list_groups[index_group]['class_children'] = 'children'
                self.content_ordered.append(self.list_groups[index_group])
                del self.list_groups[index_group]
                nb_group -= 1
            else:
                index_group += 1

    def add_municipality(self):

        """ met en forme le dictionnaire avec les données à faire passer en plus des voies """

        self.content_complete['name'] = self.municipality
        self.content_complete['citycode'] = self.citycode
        self.content_complete['groups'] = self.content_ordered

    def create_content_complete(self):

        """ fonction qui lance le traitement

         et renvoie le dictionnaire correctement organisé """

        self.add_compare_element()
        self.compare_groups()
        self.add_municipality()
        return self.content_complete
