module.exports = {
  ensureAuthenticated: function (req, res, next) {
    let exist = false;
    users.forEach((element) => {
      if (req.user?._id == element.id) exist = true;
    });

    if (req.isAuthenticated() && exist) {
      return next();
    }

    req.flash("error_msg", "অনুগ্রহ করে লগইন করুন");
    res.redirect("/users/login");
  },
};
