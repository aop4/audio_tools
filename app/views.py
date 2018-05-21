from flask import render_template, make_response
from app.util import *
from app import app
from flask import request

# Home page
@app.route('/')
def index():
	resp = make_response(render_template('transcribe.html'))
	secure_response(resp)
	return resp

