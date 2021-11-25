
const requireLogin = (req,res,next)=>{
    req.session.returnto = req.url;
    if(!req.session.user_id)
    {
        return res.redirect("/auth/login");
    }
    next()
};

module.exports = requireLogin;