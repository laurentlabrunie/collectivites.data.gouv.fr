from urllib import parse
import json


def json_and_encode(value):
    json_value = json.dumps(value)
    return parse.quote(json_value.encode('utf-8'))


def decode_and_unjson(value):
    json_value = parse.unquote(value, encoding='utf-8')
    return json.loads(json_value)

