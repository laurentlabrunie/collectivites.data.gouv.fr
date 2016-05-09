from flask import Flask

app = Flask(__name__)
app.config.from_object('collectivites.default')
app.config.from_envvar('COLLECTIVITES_SETTINGS', silent=True)

if app.debug:
    if not app.config.get('SECRET_KEY'):
        app.config['SECRET_KEY'] = 'xxxxx'
    app.config['TESTING'] = True


# Import views to make Flask know about them
import collectivites.views  # noqa
