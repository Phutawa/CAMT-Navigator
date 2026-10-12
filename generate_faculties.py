import json
import random

faculties = [
    ("คณะวิทยาศาสตร์", "Faculty of Science"),
    ("คณะมนุษยศาสตร์", "Faculty of Humanities"),
    ("คณะสังคมศาสตร์", "Faculty of Social Sciences"),
    ("คณะนิติศาสตร์", "Faculty of Law"),
    ("คณะรัฐศาสตร์และรัฐประศาสนศาสตร์", "Faculty of Political Science"),
    ("คณะเศรษฐศาสตร์", "Faculty of Economics"),
    ("คณะการสื่อสารมวลชน", "Faculty of Mass Communication"),
    ("วิทยาลัยศิลปะ สื่อ และเทคโนโลยี", "College of Arts, Media and Technology"),
    ("คณะวิศวกรรมศาสตร์", "Faculty of Engineering"),
    ("คณะสถาปัตยกรรมศาสตร์", "Faculty of Architecture"),
    ("คณะศึกษาศาสตร์", "Faculty of Education"),
    ("คณะบริหารธุรกิจ", "Faculty of Business Administration"),
    ("คณะวิจิตรศิลป์", "Faculty of Fine Arts"),
    ("คณะเกษตรศาสตร์", "Faculty of Agriculture"),
    ("คณะเภสัชศาสตร์", "Faculty of Pharmacy"),
    ("คณะทันตแพทยศาสตร์", "Faculty of Dentistry"),
    ("คณะแพทยศาสตร์", "Faculty of Medicine"),
    ("คณะเทคนิคการแพทย์", "Faculty of Associated Medical Sciences"),
    ("คณะพยาบาลศาสตร์", "Faculty of Nursing"),
    ("คณะสาธารณสุขศาสตร์", "Faculty of Public Health"),
    ("อ่างแก้ว", "Ang Kaew Reservoir"),
    ("ศาลาธรรม", "Sala Dham"),
]

buildings = []
for i, (nameTh, nameEn) in enumerate(faculties):
    # Base center: 18.8000, 98.9520
    # Add small random offset
    lat = round(18.8000 + random.uniform(-0.008, 0.008), 6)
    lng = round(98.9520 + random.uniform(-0.008, 0.008), 6)
    
    code = f"F{i+1:02d}" if "คณะ" in nameTh or "วิทยาลัย" in nameTh else f"L{i+1:02d}"
    cat = "faculty" if "คณะ" in nameTh or "วิทยาลัย" in nameTh else "landmark"
    
    buildings.append(f"""  {{
    id: 'cmu-{i+1:02d}',
    code: '{code}',
    name: '{nameEn}',
    nameTh: '{nameTh}',
    faculty: '{nameEn}',
    zone: 'Zone Center',
    distance: '{random.randint(200, 1500)} m',
    walkTime: '{random.randint(3, 20)} mins',
    imageUrl: CAMPUS_IMAGES.rb5Exterior,
    floors: [1, 2, 3],
    elevatorsAvailable: true,
    hours: 'Open until 18:00',
    category: '{cat}',
    lat: {lat},
    lng: {lng},
    aliases: ['{nameTh}', '{nameEn.lower()}'],
    rooms: [
      {{ code: '101', name: 'Main Hall', wing: 'Level 1', floor: 1 }},
    ],
  }},""")

with open('new_buildings.txt', 'w') as f:
    f.write("\n".join(buildings))

