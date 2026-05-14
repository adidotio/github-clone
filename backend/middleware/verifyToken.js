const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
    const authHeader = req.headers["Authorization"];

    if(!authHeader || !authHeader.startsWith("Bearer ")){
        return res.status(401).json({ message: "No tokens provided" });
    }

    const token = authHeader.split(" ")[1];

    try{
        const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);

        req.user = decoded;
        next();

    } catch(err){
        if(err.name == "TokenExpiredError"){
            res.status(401).json({ message: "Token expired" });
        }

        return res.status(403).json({ message: "Invalid token" });
    }
}

module.exports = verifyToken;