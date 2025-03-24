import bcrypt from "bcrypt";
import initModels from "../models/init-models.js";
import sequelize from "../config/database.js";
import crypto from "crypto";
import { Op } from 'sequelize'; // Import Op từ Sequelize
import jwt from "jsonwebtoken";

import {
  checkRefToken,
  checkToken,
  createRefToken,
  createToken,
  decodeToken,
  setCookie
} from "../config/jwt.js";
import {
	sendPasswordResetEmail,
	sendResetSuccessEmail,
	sendVerificationEmail,
	sendWelcomeEmail,
} from "../mailtrap/emails.js";
import Joi from "joi";

let model = initModels(sequelize);

export const signupService = async (email, password, role_id, name, phone_number, other, relationship) => {
  // Partial schema for initial email and password validation
  const initialSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string()
      .min(8)
      .pattern(new RegExp("^(?=.*[A-Z])(?=.*[!@#$&*])(?=.*[0-9])"))
      .required()
      .messages({
        "string.pattern.base": "Password must contain at least 1 uppercase letter, 1 special character, and 1 number.",
      })
  });

  // Validate email and password first
  const { error: initialError } = initialSchema.validate({ email, password });

  if (initialError) {
    return { error: initialError.details[0].message, status: 400 };
  }

  try {
    // Check if a user with the provided email already exists
    let existingUser = await model.User.findOne({ where: { email } });
    const verificationToken = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedPassword = await bcrypt.hash(password, 10);

    if (existingUser) {
      // If the account exists but is not verified
      if (!existingUser.isVerified) {
        existingUser.password = hashedPassword;
        existingUser.verificationToken = verificationToken;
        existingUser.verificationTokenExpiresAt = Date.now() + 24 * 60 * 60 * 1000;
        await existingUser.save();

        // Resend verification email
        await sendVerificationEmail(existingUser.email, verificationToken);

        return {
          status: 200,
          error: "Account exists but is not verified. A verification email has been resent.",
        };
      } else {
        // Account is already verified
        return {
          status: 400,
          error: "Email is already registered and verified.",
        };
      }
    }

    // If email does not exist, validate remaining fields for new account creation
    const fullSchema = Joi.object({
      role_id: Joi.number().integer().min(1).max(3).required(),
      name: Joi.string().min(3).max(50).required(),
      phone_number: Joi.string().pattern(/^[0-9]+$/).min(10).max(15).required(),
      email: Joi.string().email().required(),
      password: Joi.string()
        .min(8)
        .pattern(new RegExp("^(?=.*[A-Z])(?=.*[!@#$&*])(?=.*[0-9])"))
        .required(),
      other: Joi.alternatives().conditional("role_id", {
        switch: [
          { is: 1, then: Joi.string().required().messages({ "any.required": "Address is required for Parent role" }) },
          { is: 2, then: Joi.string().required().messages({ "any.required": "License number is required for Driver role" }) },
          { is: 3, then: Joi.string().required().messages({ "any.required": "Department is required for Teacher role" }) },
        ],
        otherwise: Joi.forbidden(),
      }),
      relationship: Joi.string()
        .valid("Father", "Mother", "Other")
        .when("role_id", { is: 1, then: Joi.required(), otherwise: Joi.forbidden() }),
    });

    const { error: fullError } = fullSchema.validate({ role_id, name, phone_number, email, password, other, relationship });

    if (fullError) {
      return { error: fullError.details[0].message, status: 400 };
    }

    // Create new account if validation passes
    let newUser = await model.User.create({
      role_id,
      name,
      phone_number,
      email,
      password: hashedPassword,
      verificationToken,
      verificationTokenExpiresAt: Date.now() + 24 * 60 * 60 * 1000,
    });

    // Create associated record based on role_id
    switch (role_id) {
      case 1: // Parent
        await model.Parent.create({ address: other, relationship, user_id: newUser.user_id });
        break;
      case 2: // Driver
        await model.Driver.create({ license_number: other, user_id: newUser.user_id });
        break;
      case 3: // Teacher
        await model.Teacher.create({ department: other, user_id: newUser.user_id });
        break;
    }

    // Send verification email
    await sendVerificationEmail(newUser.email, verificationToken);

    return { data: newUser, status: 200, message: "Account created successfully. A verification email has been sent." };

  } catch (error) {
    console.error(error);
    return { error: "Error creating user", status: 500 };
  }
};

export const resetVerificationTokenService = async (email) => {
  try {
    // Find the user with the specified email and unverified status
    const user = await model.User.findOne({
      where: {
        email,
        isVerified: false,
      },
    });

    if (!user) {
      return { status: 404, error: "User not found or already verified" };
    }

    // Generate a new verification token and set expiration time
    const newVerificationToken = Math.floor(100000 + Math.random() * 900000).toString();
    user.verificationToken = newVerificationToken;
    user.verificationTokenExpiresAt = Date.now() + 24 * 60 * 60 * 1000; // Expires in 24 hours

    // Save the updated user with the new token
    await user.save();

    // Resend verification email with the new token
    await sendVerificationEmail(user.email, newVerificationToken);

    return {
      data: newVerificationToken,
      status: 200,
      message: "Verification token has been reset and email sent",
    };
  } catch (error) {
    console.error(error);
    return { error: "Error resetting verification token", status: 500 };
  }
};


export const resetForgotPasswordTokenService = async (email) => {
  try {
    // Find the user with the specified email and unverified status
    const user = await model.User.findOne({
      where: {
        email,
        isVerified: true,
      },
    });

    if (!user) {
      return { status: 404, error: "User not found or already verified" };
    }

    // Generate a new verification token and set expiration time
    const newVerificationToken = Math.floor(100000 + Math.random() * 900000).toString();
    user.verificationToken = newVerificationToken;
    user.verificationTokenExpiresAt = Date.now() +   60 * 1000; // Expires in 60 seconds 

    // Save the updated user with the new token
    await user.save();

    // Resend verification email with the new token
    await sendVerificationEmail(user.email, newVerificationToken);

    return {
      data: newVerificationToken,
      status: 200,
      message: "Verification token has been reset and email sent",
    };
  } catch (error) {
    console.error(error);
    return { error: "Error resetting verification token", status: 500 };
  }
};

export const forgetPasswordService = async (email) => {
  try {
    // Find the user with the specified email and unverified status
    const user = await model.User.findOne({
      where: {
        email,
        isVerified: true,
      },
    });

    if (!user) {
      return { status: 404, error: "email not found" };
    }

    // Generate a new verification token and set expiration time
    const newVerificationToken = Math.floor(100000 + Math.random() * 900000).toString();
    user.verificationToken = newVerificationToken;
    user.verificationTokenExpiresAt = Date.now() +   60 * 1000; // Expires in 60s

    // Save the updated user with the new token
    await user.save();

    // Resend verification email with the new token
    await sendPasswordResetEmail(user.email, newVerificationToken);

    return {
      data: newVerificationToken,
      status: 200,
      message: "Token of resetting password is sent through email ",
    };
  } catch (error) {
    console.error(error);
    return { error: "Error sending token for resetting password", status: 500 };
  }
};

export const verifyResetOrVerificationTokenService = async (code) => {
	try {
		const user = await model.User.findOne({
			where: {
				verificationToken: code,
				verificationTokenExpiresAt: { [Op.gt]: new Date() },
			},
		});

		if (!user) {
			return { status: 400, error: "Invalid or expired verification code" };
		}

		// identify token valid, response front-end side to continue next step of resetting password

    return {
      status: 200,
      message: "Verification code is valid.",
    };
	} catch (error) {
		console.error(error);
    return { error: "Error verifying code", status: 500 };

	}
};


export const resetPasswordService = async (code, newPassword) => {
  try {
    // Update Joi schema for password validation
    const schema = Joi.object({
      newPassword: Joi.string()
        .min(8)
        .pattern(new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*(),.?\":{}|<>])[A-Za-z0-9!@#$%^&*(),.?\":{}|<>]{8,}$"))
        .required()
        .messages({
          "string.min": "Password must be at least 8 characters long.",
          "string.pattern.base": "Password must include uppercase, lowercase, a number, and a special character.",
        }),
    });

    // Validate new password
    const { error } = schema.validate({ newPassword });
    if (error) {
      return {
        status: 400,
        message: error.details[0].message,
      };
    }

    // Find the user by verification token
    const user = await model.User.findOne({
      where: {
        verificationToken: code,
        verificationTokenExpiresAt: { [Op.gt]: new Date() },
      },
    });

    if (!user) {
      return {
        status: 400,
        message: "Invalid or expired verification code",
      };
    }

    // Encrypt the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password and reset token fields
    user.password = hashedPassword;
    user.verificationToken = null;
    user.verificationTokenExpiresAt = null;
    await user.save();

    await sendResetSuccessEmail(user.email);
    return {
      status: 200,
      message: "Password has been reset successfully.",
    };
  } catch (error) {
    console.error(error);
    return { error: "Error resetting password", status: 500 };
  }
};





export const verifyEmailService = async (code, res) => {
	try {
		const user = await model.User.findOne({
			where: {
        verificationToken: code,
        verificationTokenExpiresAt: { [Op.gt]: new Date() }, 
      },
		});
    console.log(user);

		if (!user) {
			return res.status(400).json({ success: false, message: "Invalid or expired verification code" });
		}
    

    let key = new Date().getTime();
    let token = createToken({ user_id: user.user_id, key });
    let ref_token = createRefToken({ user_id: user.user_id, key });
    
    
    user.refresh_token = ref_token
    user.lastLogin = new Date();
    user.isVerified = true;
    user.verificationToken = null;
    user.verificationTokenExpiresAt = null;
    await user.save();  
    
    setCookie(res, token);

		await sendWelcomeEmail(user.email, user.name);
    return {
      data: token,
      status: 200,
      message: "Email verified successfully",
    };
	} catch (error) {
    console.error(error);
    return { error: "error in verifyEmail", status: 500 };
};
}

export const loginService = async (res, email, password) => {

  const schema = Joi.object({
    email: Joi.string().email().required().messages({
      "string.email": "Invalid email format",
      "any.required": "Email is required",
    }),

    password: Joi.string().min(8).required().messages({
      "string.min": "Password must be at least 8 characters long",
      "any.required": "Password is required",
    }),
  });
  // Validate the input
  const { error } = schema.validate({ email, password });

  if (error) {
    return { error: error.details[0].message, status: 400 };
  }
  try {   
    let user = await model.User.findOne({
      where: { email },
    });

    if (!user) {
      return { error: "Incorrect email or password", status: 400 };
    }

    if (user && bcrypt.compareSync(password, user.password)) {
      let key = new Date().getTime();
      let token = createToken({ user_id: user.user_id, key });
      let ref_token = createRefToken({ user_id: user.user_id, key });
      user.refresh_token = ref_token
      user.lastLogin = new Date();
      await user.save();  
      setCookie(res, token);

      return {
        data: {
          token,
          user_id: user.user_id,
          role_id: user.role_id,
        },
        status: 200 };
    } else {
      return { error: "Incorrect email or password", status: 400 };
    }
  } catch (error) {
    console.error(error);
    return { error: "Error logging in", status: 500 };
  }
};

export const logoutService = async (req, res) => {
  try {
    // Check if token exists
    if (!req.cookies || !req.cookies.token) {
      return { error: "No token found", status: 400 };
    }
    // let access_token = decodeToken(token);
    let access_token = decodeToken(req.cookies.token);

    // Check if the token was decoded successfully
    if (!access_token || !access_token.data || !access_token.data.user_id) {
      return { error: "Invalid token or missing user data in token", status: 400 };
    }

    let get_user = await model.User.findOne({
      where: { user_id: access_token.data.user_id },
    });

    await model.User.update(
      { refresh_token: null },
      {
        where: { user_id: get_user.user_id },
      }
    );
    res.clearCookie("token");
    return { message: "Logout successful", status: 200 };
  } catch (error) {
    console.error(error);
    return { error: "Error logging out", status: 500 };
  }
};


export const refreshTokenService = async (req, res) => {
  try {
    if (!req.cookies || !req.cookies.token) {
      return { error: "No token found", status: 400 };
    }
    let check = checkToken(req.cookies.token);
    if (check && check.name !== "TokenExpiredError") {
      return { error: "Invalid token", status: 401 };
    }

    let access_token = decodeToken(req.cookies.token);

    let get_user = await model.User.findOne({
      where: { user_id: access_token.data.user_id },
    });

    let check_ref = checkRefToken(get_user.refresh_token);
    if (check_ref) {
      get_user.refresh_token = "";
      await get_user.save();
      res.clearCookie("token");
      return { error: "Invalid or expired refresh token", status: 401 };
    }

    let ref_token = decodeToken(get_user.refresh_token);
    if (access_token.data.key !== ref_token.data.key) {
      get_user.refresh_token = "";
      await get_user.save();
      res.clearCookie("token");
      return { error: "Invalid token key", status: 401 };
    }

    let new_token = createToken({
      user_id: get_user.user_id,
      key: ref_token.data.key,
    });
    setCookie(res, new_token);

    return { data: new_token, status: 200 };
  } catch (error) {
    console.error(error);
    return { error: "Error refreshing token", status: 500 };
  }
};


export const changePasswordService = async (id, oldPassword, newPassword) => {
  try {
    // Joi schema for old password and new password validation
    const schema = Joi.object({
      oldPassword: Joi.string()
        .min(8)
        .required()
        .messages({
          "string.min": "Old password must be at least 8 characters long.",
          "any.required": "Old password is required.",
        }),
      newPassword: Joi.string()
        .min(8)
        .pattern(new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*(),.?\":{}|<>])[A-Za-z0-9!@#$%^&*(),.?\":{}|<>]{8,}$"))
        .required()
        .messages({
          "string.min": "Password must be at least 8 characters long.",
          "string.pattern.base": "Password must include uppercase, lowercase, a number, and a special character.",
          "any.required": "New password is required.",
        }),
    });

    // Validate both old and new passwords
    const { error } = schema.validate({ oldPassword, newPassword });
    if (error) {
      return {
        status: 400,
        message: error.details[0].message,
      };
    }

    // Find the user by ID
    const user = await model.User.findOne({ where: { user_id: id } });
    if (!user) {
      return {
        status: 404,
        error: "User not found",
      };
    }

    // Verify old password
    const isOldPasswordValid = await bcrypt.compare(oldPassword, user.password);
    console.log(isOldPasswordValid);
    if (!isOldPasswordValid) {
      return {
        status: 400,
        error: "Old password is incorrect",
      };
    }

    // Hash and update new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    return {
      status: 200,
      message: "Password has been changed successfully.",
    };
  } catch (error) {
    console.error(error);
    return { error: "Error changing password", status: 500 };
  }
};


// ---------------------------- Minh test upload avatar-----------------------------

import axios from "axios";
import qs from "qs";
import dotenv from "dotenv";
import { error } from "console";
import { get } from "http";

// Load environment variables from .env file
dotenv.config();

// Get access token from Microsoft Graph API
export const getAccessToken = async () => {
  const tenantId = process.env.AZURE_TENANT_ID;
  const clientId = process.env.AZURE_CLIENT_ID;
  const clientSecret = process.env.AZURE_CLIENT_SECRET;
  const scopes = "https://graph.microsoft.com/.default";

  const tokenEndpoint = `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`;

  const data = qs.stringify({
    grant_type: "client_credentials",
    client_id: clientId,
    client_secret: clientSecret,
    scope: scopes,
  });

  try {
    const response = await axios.post(tokenEndpoint, data, {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });
    return response.data.access_token; // Return the access token
  } catch (error) {
    console.error("Error fetching access token:", error.message);
    throw new Error("Failed to get access token");
  }
};
