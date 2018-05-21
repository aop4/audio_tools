import os

DEBUG = os.environ.get('DEV_SERVER',
	default=False) # Set to False in production.
SESSION_COOKIE_SECURE = True
SESSION_COOKIE_HTTPONLY = True
SESSION_COOKIE_SAMESITE = 'Lax'
PERMANENT_SESSION_LIFETIME = 3600
