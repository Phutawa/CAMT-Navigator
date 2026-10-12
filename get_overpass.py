import urllib.request
import urllib.parse
import json

query = """
[out:json];
area["name"="มหาวิทยาลัยเชียงใหม่"]->.cmu;
(
  node(area.cmu)["name"~"คณะ"];
  way(area.cmu)["name"~"คณะ"];
  node(area.cmu)["name"~"หอพัก"];
  way(area.cmu)["name"~"หอพัก"];
  node(area.cmu)["name"~"อ่าง"];
  way(area.cmu)["name"~"อ่าง"];
  node(area.cmu)["name"~"ศาลา"];
  way(area.cmu)["name"~"ศาลา"];
);
out center;
"""

url = "https://overpass-api.de/api/interpreter"
data = urllib.parse.urlencode({'data': query}).encode('utf-8')
req = urllib.request.Request(url, data=data)
with urllib.request.urlopen(req) as response:
    result = json.loads(response.read().decode('utf-8'))
    
with open('cmu_faculties.json', 'w') as f:
    json.dump(result, f, ensure_ascii=False, indent=2)

print(f"Got {len(result.get('elements', []))} elements")
