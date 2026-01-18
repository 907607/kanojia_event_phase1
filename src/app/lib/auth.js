import jwt from "jsonwebtoken";

export function signToken(payload) {
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "7d" });
}

export function verifyToken(req) {
  const auth = req.headers.get("authorization");
  if (!auth) return null;
  return jwt.verify(auth.split(" ")[1], process.env.JWT_SECRET);
}
