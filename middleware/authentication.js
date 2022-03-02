module.exports = {
  userAuthenticated: (req, res, next) => {
    if (req.isAuthenticated()) {
      next();
    } else {
      res.redirect('/login');
    }

  },
  adminAuthenticated: (req, res, next) => {
    if (req.isAuthenticated() && req.user.role === 1) {
        next();
    } else {
       res.redirect('/admin');
    }
  }
};