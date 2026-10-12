import urllib.request
import urllib.parse
import json
import time

faculties = [
    "คณะวิทยาศาสตร์ มหาวิทยาลัยเชียงใหม่",
    "คณะมนุษยศาสตร์ มหาวิทยาลัยเชียงใหม่",
    "คณะสังคมศาสตร์ มหาวิทยาลัยเชียงใหม่",
    "คณะนิติศาสตร์ มหาวิทยาลัยเชียงใหม่",
    "คณะรัฐศาสตร์ มหาวิทยาลัยเชียงใหม่",
    "คณะเศรษฐศาสตร์ มหาวิทยาลัยเชียงใหม่",
    "คณะการสื่อสารมวลชน มหาวิทยาลัยเชียงใหม่",
    "คณะวิศวกรรมศาสตร์ มหาวิทยาลัยเชียงใหม่",
    "คณะสถาปัตยกรรมศาสตร์ มหาวิทยาลัยเชียงใหม่",
    "คณะศึกษาศาสตร์ มหาวิทยาลัยเชียงใหม่",
    "คณะบริหารธุรกิจ มหาวิทยาลัยเชียงใหม่",
    "คณะวิจิตรศิลป์ มหาวิทยาลัยเชียงใหม่",
    "คณะเกษตรศาสตร์ มหาวิทยาลัยเชียงใหม่",
    "คณะแพทยศาสตร์ มหาวิทยาลัยเชียงใหม่",
    "คณะทันตแพทยศาสตร์ มหาวิทยาลัยเชียงใหม่",
    "อ่างแก้ว มหาวิทยาลัยเชียงใหม่"
]

results = []
for f in faculties:
    url = f"https://nominatim.openstreetmap.org/search?q={urllib.parse.quote(f)}&format=json&limit=1"
    req = urllib.request.Request(url, headers={'User-Agent': 'WayFind-App/1.0'})
    try:
        with urllib.request.urlopen(req) as response:
            data = json.loads(response.read().decode('utf-8'))
            if data:
                results.append({"name": f.replace(" มหาวิทยาลัยเชียงใหม่", ""), "lat": float(data[0]["lat"]), "lng": float(data[0]["lon"])})
    except Exception as e:
        print(f"Error for {f}: {e}")
    time.sleep(1)

with open('cmu_coords.json', 'w') as f:
    json.dump(results, f, ensure_ascii=False, indent=2)

print(f"Found {len(results)} locations.")
