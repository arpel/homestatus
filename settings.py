class Config(object):
    SECRET_KEY = 'secret key'


class ProdConfig(Config):
    SQLALCHEMY_DATABASE_URI = 'sqlite:///../database.db'

    CACHE_TYPE = 'simple'
    CACHE_DEFAULT_TIMEOUT = 60
    CACHE_THRESHOLD = 50


class DevConfig(Config):
    DEBUG = True

    SQLALCHEMY_DATABASE_URI = 'sqlite:///../database.db'
    SQLALCHEMY_ECHO = True

    #CACHE_TYPE = 'null'
    CACHE_TYPE = 'simple'
    CACHE_DEFAULT_TIMEOUT = 60
    CACHE_THRESHOLD = 50

    # This allows us to test the forms from WTForm
    WTF_CSRF_ENABLED = False
