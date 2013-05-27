Countdown-Reader-closing
========================

Code of "Count down page (<http://goodbyereader.wingall.com/>)".

## Requirement

- Python
- Flask
- python-twitter
- Twitter API Keys <https://dev.twitter.com/>

## Setup

### Puts Twitter API Keys

You need to write Twitter API Keys in libs.TwitterSearch (CONSUMER. CONSUMER_SECRET...).

### Salt

It's recommended to make salt for session token , and session key.

Session token:  
utils.get_session_token()

Session key:  
app.secret_key = 'KeyOfSession' (in confg.py)

## Contact

- Twitter(@wg_koro) <https://twitter.com/wg_koro>
