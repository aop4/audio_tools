import os

def secure_response(response):
	# force HTTPS protocol for security
	response.headers['Strict-Transport-Security'] = 'max-age=31536000; includeSubDomains'
	# disable auto-detection of response type
	response.headers['X-Content-Type-Options'] = 'nosniff'
	# disallow the embedding of this site in an i-frame
	response.headers['X-Frame-Options'] = 'SAMEORIGIN'
	# protect against XSS attacks
	response.headers['X-XSS-Protection'] = '1; mode=block'
	