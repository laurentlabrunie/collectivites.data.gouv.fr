import os

import pytest

from collectivites import app as _app


def pytest_configure():
    # Be sure not to load local config during tests.
    os.environ['COLLECTIVITES_CONFIG_MODULE'] = ''


@pytest.fixture
def app():
    return _app
