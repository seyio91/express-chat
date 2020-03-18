module.exports = {
    userAuth: (req, res, next) => {
        if(req.isAuthenticated()){
            return next();
        }
        req.flash('error_msg', 'Please Login to View this Resource');
        res.redirect('/users/login')
    }
}