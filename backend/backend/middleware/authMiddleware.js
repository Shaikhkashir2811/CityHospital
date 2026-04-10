import jwt from "jsonwebtoken";

export const protectAdmin = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) return res.status(401).json({ msg: "No token" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // FIXED: Convert the decoded role to lowercase before comparing
    if (decoded.role?.toLowerCase() !== "admin") {
      return res.status(403).json({ msg: "Not authorized" });
    }

    req.user = decoded;
    next();
  } catch (err) {
    console.error("JWT Verification Error:", err.message);
    res.status(401).json({ msg: "Invalid token" });
  }
};



// middleware/authUser.js
export const authUser = (req, res, next) => {
    try {
        const { token } = req.headers;
        if (!token) return res.status(401).json({ msg: "Not Authorized" });

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // Contains id and role
        console.log("Authenticated User:", req.user); // Debug log
        next();
    } catch (error) {
        res.status(401).json({ msg: "Token Invalid" });
    }
};