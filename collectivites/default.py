import os

DEBUG = True
TESTING = True
SITE_URL = os.environ.get('SITE_URL', '//collectivités.data.gouv.fr')
API_URL = os.environ.get('API_URL', '//www.data.gouv.fr/api/1/')
DATAGOUV_CONSUMER_KEY = "XXXX"
DATAGOUV_CONSUMER_SECRET = "YYYY"
BAN_CLIENT_ID = ''
BAN_CLIENT_SECRET = ''
BAN_URL = 'http://ban-dev.data.gouv.fr'
# BAN_URL = 'http://localhost:5959'