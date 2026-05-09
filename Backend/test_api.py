import urllib.request
import json
import urllib.error

data = json.dumps({
    'email': 'test_pro@example.com',
    'password': 'P@ssw0rd2026!',
    'password_confirm': 'P@ssw0rd2026!',
    'first_name': 'Test',
    'last_name': 'User'
}).encode('utf-8')

req = urllib.request.Request(
    'http://localhost:8000/api/auth/register/',
    data=data,
    headers={'Content-Type': 'application/json'}
)

try:
    res = urllib.request.urlopen(req)
    print("Success:", res.read().decode())
except urllib.error.HTTPError as e:
    print("Error HTTP", e.code)
    print("Body:", e.read().decode())
