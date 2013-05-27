#!/usr/bin/env python
#-*- coding:utf-8 -*-
import string
import re
import random
import hashlib
from flask import request, session

def generate_csrf_token():
    rand_str = randstr(20)
    session['_csrf_token'] = get_session_token(rand_str)
    return rand_str

def get_session_token(rand_str):
    key = 'SaltOfToken'
    string = key + rand_str
    return hashlib.sha1(string).hexdigest()

def get_template_file():
    if not is_mobile():
        return 'top.html'

    return 'mobile.html'

def is_mobile():
    ua = request.headers.get('User-Agent', '')
    if not ua:
        return False

    ua = ua.lower()
    if re.match(r'.*(iphone|android).*', ua):
        return True

    return False

def check_pager(pager):
    try:
        pager = int(pager)
    except:
        pager = 1

    if pager > 50:
        pager = 1

    return pager

def randstr(n):
    alphabets = string.digits + string.letters
    return ''.join(random.choice(alphabets) for i in xrange(n))

def select_rand_img():
    imgs = ['nature', 'flower', 'night', 'metro', 'tree']
    background = random.choice(imgs)
    if is_mobile():
        return '%s_s.jpg' % background

    return '%s.jpg' % background

