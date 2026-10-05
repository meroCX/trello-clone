const jwt =require("jsonwebtoken")

function authMiddleware(req,res,next){
    const token = req.headers.token;
    const decoded = jwt.verify(token,"key-pair");
    
    const u_id = decoded.user_id
    if(u_id){
        req.u_id
        next()
    }
    else{
        return res.status(403).json({
            message : "User Token Not Found"
        });
    }

}

module.exports = {
    authMiddleware: authMiddleware
}