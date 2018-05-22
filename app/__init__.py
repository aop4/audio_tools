from flask import Flask
from flask_sslify import SSLify
# Initialize the app
app = Flask(__name__, instance_relative_config=True)
from app import views #yes, it needs to be down here

# Load app settings from config.py
app.config.from_object('config')

#force HTTPS protocol
sslify = SSLify(app)