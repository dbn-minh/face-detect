import bcrypt from "bcrypt";
import initModels from "../models/init-models.js";
import sequelize from "../config/database.js";
import {
  checkRefToken,
  checkToken,
  createRefToken,
  createToken,
  decodeToken,
} from "../config/jwt.js";
import Joi from "joi";

let model = initModels(sequelize);

export const signupService = async (
  role_id,
  name,
  phone_number,
  email,
  password,
  other,
  relationship
) => {
  // Define Joi validation schema
  const schema = Joi.object({
    role_id: Joi.number().integer().min(1).max(3).required(),

    name: Joi.string().min(3).max(50).required(),

    phone_number: Joi.string()
      .pattern(/^[0-9]+$/)
      .min(10)
      .max(15)
      .required(),

    email: Joi.string().email().required(),
    password: Joi.string()
      .min(8)
      .pattern(new RegExp("^(?=.*[A-Z])(?=.*[!@#$&*])(?=.*[0-9])"))
      .required()
      .messages({
        "string.pattern.base":
          "Password must contain at least 1 uppercase letter, 1 special character, and 1 number.",
      }),

    other: Joi.alternatives().conditional("role_id", {
      switch: [
        {
          is: 1, // Parent
          then: Joi.string()
            .required()
            .messages({
              "any.required": "Address is required for Parent role",
            }),
        },
        {
          is: 2, // Driver
          then: Joi.string()
            .required()
            .messages({
              "any.required": "License number is required for Driver role",
            }),
        },
        {
          is: 3, // Teacher
          then: Joi.string()
            .required()
            .messages({
              "any.required": "Department is required for Teacher role",
            }),
        },
      ],
      otherwise: Joi.forbidden(), // prohibit to enter tha value which is out range from 1 to 3
    }),

    relationship: Joi.string()
      .valid("Father", "Mother", "Other")
      .when("role_id", {
        is: 1, // only validate relationship when role_id is 1 (Parent)
        then: Joi.required(),
        otherwise: Joi.forbidden(), // prohibit to enter the value which is not 1(parent)
      }),
  });

  // Validate the input
  const { error } = schema.validate({
    role_id,
    name,
    phone_number,
    email,
    password,
    other,
    relationship,
  });

  if (error) {
    return { error: error.details[0].message, status: 400 };
  }
  try {
    let check_user = await model.User.findOne({
      where: { email },
    });

    if (check_user) {
      return { error: "Email exists, use another email", status: 400 };
    }

    let hashedPassword = bcrypt.hashSync(password, 10);
    let newUser = await model.User.create({
      role_id,
      name,
      phone_number,
      email,
      password: hashedPassword,
    });

    let roleDetails = null;

    switch (role_id) {
      case 1: // Parent
        const parent = await model.Parent.create({
          address: other,
          relationship: relationship,
          user_id: newUser.user_id,
        });
        roleDetails = {
          role: "Parent",
          address: parent.address,
          relationship: parent.relationship
        };
        break;
      case 2: // Driver
        const driver = await model.Driver.create({
          license_number: other,
          user_id: newUser.user_id,
        });
        roleDetails = {
          role: "Driver",
          license_number: driver.license_number
        };
        break;
      case 3: // Teacher
        const teacher = await model.Teacher.create({
          department: other,
          user_id: newUser.user_id,
        });
        roleDetails = {
          role: "Teacher",
          department: teacher.department
        };
        break;
    }

    return {
      data: {
        user_id: newUser.user_id,
        role_id: newUser.role_id,
        name: newUser.name,
        phone_number: newUser.phone_number,
        email: newUser.email,
        role_details: roleDetails
      },
      status: 200
    };
  } catch (error) {
    console.error(error);
    return { error: "Error creating user", status: 500 };
  }
};

export const loginService = async (email, password) => {

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
    let check_user = await model.User.findOne({
      where: { email },
    });

    if (!check_user) {
      return { error: "Incorrect email or password", status: 400 };
    }


    if (check_user && bcrypt.compareSync(password, check_user.password)) {
      let key = new Date().getTime();
      let token = createToken({ user_id: check_user.user_id, key });
      let ref_token = createRefToken({ user_id: check_user.user_id, key });

      await model.User.update(
        { refresh_token: ref_token },
        {
          where: { user_id: check_user.user_id },
        }
      );

      return { data: token, status: 200 };
    } else {
      return { error: "Incorrect email or password", status: 400 };
    }
  } catch (error) {
    console.error(error);
    return { error: "Error logging in", status: 500 };
  }
};

export const logoutService = async (token) => {
  try {
    let access_token = decodeToken(token);

    // Check if the token was decoded succe                     ssfully
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

    return { message: "Logout successful", status: 200 };
  } catch (error) {
    console.error(error);
    return { error: "Error logging out", status: 500 };
  }
};

export const refreshTokenService = async (token) => {
  try {
    let check = checkToken(token);
    if (check && check.name !== "TokenExpiredError") {
      return { error: "Invalid token", status: 401 };
    }

    let access_token = decodeToken(token);

    let get_user = await model.User.findOne({
      where: { user_id: access_token.data.user_id },
    });

    let check_ref = checkRefToken(get_user.refresh_token);
    if (check_ref) {
      return { error: "Invalid refresh token", status: 401 };
    }

    let ref_token = decodeToken(get_user.refresh_token);
    if (access_token.data.key !== ref_token.data.key) {
      return { error: "Invalid token key", status: 401 };
    }

    let new_token = createToken({
      user_id: get_user.user_id,
      key: ref_token.data.key,
    });

    return { data: new_token, status: 200 };
  } catch (error) {
    console.error(error);
    return { error: "Error refreshing token", status: 500 };
  }
};

// ---------------------------- Minh test upload avatar-----------------------------

import axios from "axios";
import qs from "qs";
import dotenv from "dotenv";

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
