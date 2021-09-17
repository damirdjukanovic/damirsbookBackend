const jwt = require('jsonwebtoken');

function auth(req, res, next) {
    const token = req.header('x-auth-token');

    // Check for token
    if(!token){
        return res.status(401).json({ msg: 'No token, authorization denied'});
    }
    
    try{
        // Verify token
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN);
        //Add user from payload
        req.user = decoded;
    next();
    } catch(e){
        res.status(400).json({ msg:'You need to be logged in to do that'});
    }
}

module.exports = auth;