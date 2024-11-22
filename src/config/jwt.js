import jwt from 'jsonwebtoken';

export const createToken = (data) => {
    return jwt.sign({data}, "secret", {algorithm: "HS256", expiresIn: "10m"});
}

export const checkToken = (token) => jwt.verify(token, "secret", (error, decoded) => error
);

// use for logging in again
export const createRefToken = (data) => {
    let token = jwt.sign({ data }, "not_secret", { algorithm: "HS256", expiresIn: "2d" });

    return token;
}

export const checkRefToken = (token) => jwt.verify(token, "not_secret", (error, decoded) => error
);

export const decodeToken = (token) => {
    return jwt.decode(token);
}

export const verifyToken = (req, res, next) => {

    // let { token } = req.headers;
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ success: false, message: "Unauthorized - no token provided" });
    let check = checkToken(token);

    if (check == null) {
        // check token valid
        // add use_id by decoding the access Token
        let access_token = decodeToken(token);

		req.user_id = access_token.data.user_id;
        next()
    } else {
        // token not valid
        res.status(401).send(check.name)
    }
}

export const setCookie = (res, token) => {

	res.cookie("token", token, {
		httpOnly: true,
		secure: process.env.NODE_ENV === "production",
		sameSite: "strict",
		// maxAge: 7 * 24 * 60 * 60 * 1000,
	});

	return token;
};
