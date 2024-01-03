var fs = require("fs");
const lockfile = require("proper-lockfile");

const sleep = (ms) => {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
};

function getAll(fileName) {
  let file;
  try {
    file = fs.readFileSync(fileName);
  } catch (ex) {
    Append(fileName, "");
    file = fs.readFileSync(fileName);
  }
  return (file = JSON.parse(file.toString()));
}

function Append(fileName, data) {
  let file;
  try {
    file = fs.readFileSync(fileName);
  } catch (ex) {
    console.log("Now creating file " + fileName);
    fs.writeFileSync(fileName, "[]");
    console.log("Done");
  }
  if (data) {
    file = fs.readFileSync(fileName);
    const json = JSON.parse(file.toString());
    json.push(data);

    // attempt to do this 10 times
    for (let i = 0; i < 9; i++) {
      const checkFile = lockfile.checkSync(fileName);
      try {
        if (checkFile) {
          sleep(1000);
        } else {
          // apply lock
          lockfile.lockSync(fileName);

          // do work
          fs.writeFileSync(fileName, JSON.stringify(json));

          // release lock
          lockfile.unlockSync(fileName);

          break;
        }
      } catch (error) {
        console.log(error);
      }
    }
  }
  return data;
}

function Update(fileName, data) {
  // attempt to do this 10 times
  for (let i = 0; i < 9; i++) {
    const checkFile = lockfile.checkSync(fileName);
    try {
      if (checkFile) {
        sleep(1000);
      } else {
        // apply lock
        lockfile.lockSync(fileName);

        // do work
        fs.writeFileSync(fileName, JSON.stringify(data));

        // release lock
        lockfile.unlockSync(fileName);

        break;
      }
    } catch (error) {
      console.log(error);
    }
  }
}
module.exports = { getAll, Append, Update };
