from urllib import parse
import json


def jsonAndEncode(value):
    JSONvalue = json.dumps(value)
    return parse.quote(JSONvalue.encode('utf-8'))


def decodeAndUnJSON(value):
    JSONvalue = parse.unquote(value, encoding='utf-8')
    return json.loads(JSONvalue)

