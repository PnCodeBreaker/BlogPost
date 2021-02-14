const jwt = require('jsonwebtoken');
const User = require('../models/User');
require('dotenv').config();

const requireAuth = (req,res,next) => {

    const token = req.cookies.jwt;
    // check if jwt token exist and is verified 
    if(token){
        jwt.verify(token, process.env.AUTH_JWT, (err,decodedToken)=>{
            if(err){
                console.log(err.message);
                res.redirect('/login');
            }
            else {
                next();
            }
        })
    }
    else{
        res.redirect('/login');
    }
}

// check the current user is loged in or not
const checkUser = (req,res,next) => {
    const token = req.cookies.jwt;

    if (token) {
        jwt.verify(token, process.env.AUTH_JWT, async (err,decodedToken)=>{
            if(err){
                console.log(err.message);
                res.locals.user = null;
                next();
            }
            else {
                let user = await User.findById(decodedToken.id);
                res.locals.user = user;
                next();
            }
        })
    }
    else{
        res.locals.user = null;
        next();
    }
}

module.exports = { requireAuth, checkUser };