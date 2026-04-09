import jwt from 'jsonwebtoken';


export const authDoctor = async (req, res, next) => {
    try {
        const { token } = req.headers;
        if (!token) {
            return res.status(401).json({ success: false, message: "Not Authorized" });
        }

        const token_decode = jwt.verify(token, process.env.JWT_SECRET);
        
        // --- THE FIX IS HERE ---
        if (!req.body) {
            req.body = {}; 
        }
        // -----------------------

        req.body.doctorId = token_decode.id;
        next();
    } catch (error) {
        console.log("JWT Error:", error.message);
        res.status(401).json({ success: false, message: error.message });
    }
}

export const authDoctor1 = async (req, res, next) => {
    try {
        const { token } = req.headers;
        if (!token) {
            return res.status(401).json({ success: false, message: "Not Authorized" });
        }

        const token_decode = jwt.verify(token, process.env.JWT_SECRET);
        
        // --- THE FIX IS HERE ---
        if (!req.body) {
            req.body = {}; 
        }
        // -----------------------

        req.body.docId = token_decode.id;
        next();
    } catch (error) {
        console.log("JWT Error:", error.message);
        res.status(401).json({ success: false, message: error.message });
    }
}