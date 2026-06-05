import urllib.request
import json

data = json.dumps({'message': '/3d Hãy thay đổi tần số lên 5000', 'current_model': 'loudspeaker', 'history': []}).encode('utf-8')
req = urllib.request.Request('http://127.0.0.1:8000/chat', data=data, headers={'Content-Type': 'application/json'})
print(urllib.request.urlopen(req).read().decode('utf-8'))
