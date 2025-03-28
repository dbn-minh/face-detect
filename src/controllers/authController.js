import { responseData } from "../config/response.js";
import * as service from "../services/authServices.js";

export default class AuthController {
  static async signup(req, res) {
    const {
      email,
      password,
      phone_number,
      role_id,
    } = req.body;
    const name = "Fill your name here"
    const other = "Fill your information here"
    const { error, data, status } = await service.signupService(
      email,
      password,
      role_id,
      name,
      phone_number,
      other,
    );

    if (error) {
      return responseData(res, error, "", status);
    }
    return responseData(res, "success", data, status);
  }
  static async verifyEmail(req, res) {
    const { code } = req.body;
    const { error, data, status } = await service.verifyEmailService(code, res);

    if (error) {
      return responseData(res, error, "", status);
    }
    return responseData(res, "success", data, status);
  }

  static async resetVerificationToken(req, res) {
    const { email } = req.body;
    const { error, message, data, status } =
      await service.resetVerificationTokenService(email);

    if (error) {
      return responseData(res, error, "", status);
    }
    return responseData(res, message, data, status);
  }

  static async resetForgotPasswordToken(req, res) {
    const { email } = req.body;
    const { error, message, data, status } =
      await service.resetForgotPasswordTokenService(email);

    if (error) {
      return responseData(res, error, "", status);
    }
    return responseData(res, message, data, status);
  }

  static async login(req, res) {
    const { email, password } = req.body;
    const { error, data, status } = await service.loginService(
      res,
      email,
      password
    );

    if (error) {
      return responseData(res, error, "", status);
    }
    return responseData(res, "Login successfully", data, status);
  }

  static async logout(req, res) {
    // const { token } = req.headers;
    const { error, message, status } = await service.logoutService(req, res);

    if (error) {
      return responseData(res, error, "", status);
    }
    return responseData(res, message, "", status);
  }

  static async refreshToken(req, res) {
    // const { token } = req.headers;
    const { error, data, status } = await service.refreshTokenService(req, res);

    if (error) {
      return responseData(res, error, "", status);
    }
    return responseData(res, "", data, status);
  }

  static async forgetPassword(req, res) {
    const { email } = req.body;
    const { error, message, data, status } =
      await service.forgetPasswordService(email);

    if (error) {
      return responseData(res, error, "", status);
    }
    return responseData(res, message, data, status);
  }

  static async resetPassword(req, res) {
    const { code, newPassword} = req.body;
    const { error,message, data, status } = await service.resetPasswordService(code, newPassword);

    if (error) {
      return responseData(res, error, "", status);
    }
    return responseData(res, message, data, status);
  }

  static async changePassword(req, res) {
    const { newPassword, oldPassword} = req.body;
    let id = req.user_id;
    console.log(id)
    const { error,message, data, status } = await service.changePasswordService(id, oldPassword, newPassword);

    if (error) {
      return responseData(res, error, "", status);
    }
    return responseData(res, message, data, status);
  }

  static async verifyResetOrVerificationToken(req, res) {
    const { code } = req.body;
    const { error,message, data, status } = await service.verifyResetOrVerificationTokenService(code);

    if (error) {
      return responseData(res, error, "", status);
    }
    return responseData(res, message, data, status);
  }
  
}
