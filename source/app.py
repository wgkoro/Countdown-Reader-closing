#!/usr/bin/env python
#-*- coding:utf-8 -*-
"""
Count down the days to Google Reader closing.
http://goodbyereader.wingall.com/

Copyright (c) 2013, @wg_koro (http://zafiel.wingall.com/)

Licensed under the MIT.
"""
import json
import traceback
from libs.TwitterSearch import TwitterSearch
from libs.utils import *
# flask config
from config import *

@app.before_request
def csrf_protect():
    if request.method == 'POST':
        session_str = session.pop('_csrf_token', None)
        posted = request.form.get('_token')
        restored_token = get_session_token(posted)
        if not session_str or session_str != restored_token:
            abort(403)

@app.route('/')
def index():
    csrf = generate_csrf_token()
    background = select_rand_img()
    temp_file = get_template_file()
    return render_template(temp_file, background=background, csrf=csrf);

@app.route('/data', methods=['POST'])
def tweet():
    session.clear()

    result = {
        'error' : 0,
        'token' : generate_csrf_token()
    }

    pager = check_pager(request.form.get('q', 1))
    lang = request.form.get('lang', 'ja')
    if lang != 'ja':
        lang = 'en'

    search_word = u'google reader'
    try:
        twitter = TwitterSearch()
        twitter.set_lang(lang)
        result['data'] = twitter.search(search_word, pager)
    except:
        app.logger.error(traceback.format_exc())
        result['error'] = 1

    return Response(json.dumps(result), mimetype='text/javascript')



if __name__ == '__main__':
    app.run(debug=DEBUG_MODE)
