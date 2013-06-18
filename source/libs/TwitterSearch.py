#!/usr/bin/env python
#-*- coding:utf-8 -*-
import twitter
import socket
import urllib
import json

CONSUMER = 'xxx'
CONSUMER_SECRET = 'xxx'
ACCESS_TOKEN = 'xxx'
ACCESS_SECRET = 'xxx'
MAX_RESULT = 72

class TwitterSearch:
    def __init__(self):
        socket.setdefaulttimeout(10)
        self._lang = 'ja'
        self._api = twitter.Api(
            consumer_key = CONSUMER,
            consumer_secret = CONSUMER_SECRET,
            access_token_key = ACCESS_TOKEN,
            access_token_secret = ACCESS_SECRET
        )
        self._api.SetCacheTimeout(120)

    def set_lang(self, lang):
        if not lang:
            return

        self._lang = lang

    def search(self, word, pager=1):
        search_word = urllib.quote(word.encode('utf-8'))
        result = self._api.GetSearch(
                term=search_word,
                count=MAX_RESULT,
                result_type='recent',
                lang=self._lang,
                include_entities=True
            )

        tweet_list = []
        for status in result:
            tweet = {}

            url_list = {}
            for u in status.urls:
                url_list[u.url] = u.expanded_url

            tweet['id'] = status.id
            tweet['screen_name'] = status.user.screen_name
            tweet['image'] = status.user.profile_image_url
            tweet['text'] = status.text
            tweet['urls'] = url_list
            tweet['user_url'] = 'https://twitter.com/%s' % status.user.screen_name
            tweet['tweet_url'] = 'https://twitter.com/%s/status/%s' % (status.user.screen_name, status.id)
            tweet['created_at'] = status.created_at_in_seconds

            tweet_list.append(tweet)

        return tweet_list



if __name__ == '__main__':
    word = u'google reader'

    t = TwitterSearch()
    t.search(word)
