const LocalStrategy = require("passport-local").Strategy;
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const { getAll } = require("../crud");
const moment = require("moment-timezone");

module.exports = function (passport) {
  passport.use(
    new LocalStrategy({ usernameField: "name" }, (name, password, done) => {
      // Match User
      (async function () {
        let users;
        users = getAll("./storage/users.json");
        if (users.length > 0) {
          users = users.filter((x) => x.username == name);
          return users[0];
        }
      })()
        .then((user) => {
          //Check required fields
          if (!name || !password) {
            errors.push({ msg: "অনুগ্রহ করে সকল ঘর পূরণ করুন" });
          }

          if (!user) {
            return done(null, false, { message: "এই নামে কোনো আইডি নেই" });
          }

          if (!user.isApproved) {
            return done(null, false, { message: "এই আইডি এখনও অনুমোদিত হয়নি" });
          }

          // if (users.filter((x) => x.username == user.username).length > 0) {
          //   return done(null, false, {
          //     message: "এই আইডি অন্য কোথাও লগইন আছে!",
          //   });
          // }

          // Match password
          bcrypt.compare(password, user.password, (err, isMatch) => {
            if (err) throw err;

            if (isMatch) {
              if (users.filter((x) => x.username == user.username).length > 0) {
                return done(null, user);
              } else {
                let t = moment().locale("bn").tz("Asia/Dhaka").format("a h:mm");
                let ut = { username: user.username, time: t, id: user._id };
                users.push(ut);
                activeUsers.push(user._id);
                io.sockets.emit("nUser", ut);

                return done(null, user);
              }
            } else {
              return done(null, false, { message: "পাসওয়ার্ড ভুল হচ্ছে!" });
            }
          });
        })
        .catch((err) => console.log(err));
    })
  );

  passport.serializeUser((user, done) => {
    done(null, user._id);
  });

  passport.deserializeUser((id, done) => {
    (async function () {
      let users;
      users = getAll("./storage/users.json");
      if (users.length > 0) {
        users = users.filter((x) => x._id == id);
        return users[0];
      }
    })().then((user) => {
      if (user) {
        done(null, user);
      }
    });
  });
};
