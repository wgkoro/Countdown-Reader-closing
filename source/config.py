#!/usr/bin/env python
#-*- coding:utf-8 -*-
"""
Flask and Logging config
"""
import os
import re
import socket
import logging
from flask import Flask, render_template, Response, request, session, abort
from logging.handlers import RotatingFileHandler

APP_ROOT = os.path.realpath(os.path.dirname(__file__))
DEBUG_MODE = False

host = socket.gethostname()
p = re.compile('.+\.local$')
if p.match(host):
    DEBUG_MODE = True

app = Flask(__name__)
app.secret_key = 'KeyOfSession'

"""
Logging
"""
app.logger.setLevel(logging.INFO)

formatter = logging.Formatter(
    '%(asctime)s %(levelname)s: %(message)s '
    '[in %(pathname)s:%(lineno)d]'
)

debug_log = os.path.join(APP_ROOT, 'log/syslog.log')
debug_file_handler = RotatingFileHandler(
    debug_log, maxBytes=100000, backupCount=10
)
debug_file_handler.setLevel(logging.INFO)
debug_file_handler.setFormatter(formatter)

app.logger.addHandler(debug_file_handler)

error_log = os.path.join(APP_ROOT, 'log/error.log')
error_file_handler = RotatingFileHandler(
    error_log, maxBytes=100000, backupCount=10
)
error_file_handler.setLevel(logging.ERROR)
error_file_handler.setFormatter(formatter)

app.logger.addHandler(error_file_handler)
