import { responseData } from "../config/response.js";
import * as service from "../services/authServices.js";

export default class AuthController {
  static async signup(req, res) {
    const { role_id, name, phone_number, email, password, other, relationship} = req.body;
    const { error, data, status } = await service.signupService(
      role_id,
      name,
      phone_number,
      email,
      password,
      other,
      relationship
    );

    if (error) {
      return responseData(res, error, "", status);
    }
    return responseData(res, "success", data, status);
  }

  static async login(req, res) {
    const { email, password } = req.body;
    const { error, data, status } = await service.loginService(email, password);

    if (error) {
      return responseData(res, error, "", status);
    }
    return responseData(res, "Login successfully", data, status);
  }

  static async logout(req, res) {
    const { token } = req.headers;
    const { error, message, status } = await service.logoutService(token);

    if (error) {
      return responseData(res, error, "", status);
    }
    return responseData(res, message, "", status);
  }

  static async refreshToken(req, res) {
    const { token } = req.headers;
    const { error, data, status } = await service.refreshTokenService(token);

    if (error) {
      return responseData(res, error, "", status);
    }
    return responseData(res, "", data, status);
  }
}
