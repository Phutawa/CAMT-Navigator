const floors = [1, 2, 3, 4];
const rooms = [];
floors.forEach(floor => {
  for (let i = 1; i <= 9; i++) {
    const code = `${floor}0${i}`;
    let name = `Room ${code}`;
    let isTarget = false;
    let hasBackDoor = false;
    if (code === '204') {
      name = 'Robotics Lab (Course 953351)';
      isTarget = true;
      hasBackDoor = true;
    } else if (code === '201') {
      name = 'Meeting Room';
    } else {
      name = `Lecture Room ${code}`;
    }
    rooms.push({
      code,
      name,
      wing: `Level ${floor}`,
      floor,
      ...(isTarget && { isTarget }),
      ...(hasBackDoor && { hasBackDoor })
    });
  }
});
console.log(JSON.stringify(rooms, null, 2));
