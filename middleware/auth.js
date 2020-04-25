const jwt = require('jsonwebtoken');
const config = require('config');

module.exports = (req, res, next) => {
    const token = req.header('x-auth-token');
    
    if(!token) return res.status(401).send({ msg: 'No token! Auth Denied!'});

    try {
        const decoded = jwt.verify(token, config.get('jwtSecret'));
        req.user = decoded.user;
        return next();
    } 
    catch(err) {
        console.error(err);
        return res.status(401).send({msg: 'Invalid Token!'});
    }
}   