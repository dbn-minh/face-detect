import { responseData } from "../config/response.js";
import { Sequelize, where } from "sequelize";
import sequelize from "../config/database.js";
import initModels from "../models/init-models.js";
import bcrypt from "bcrypt";
import {
  checkRefToken,
  checkToken,
  createRefToken,
  createToken,
  decodeToken,
} from "../config/jwt.js";
let model = initModels(sequelize);

export default class AuthController {
  static async signup(req, res) {
    try {
      // Function to handle user signup
      let { roleID, name, phoneNumber, email, password, other } = req.body;
      let checkUser = await model.User.findOne({
        where: {
          email,
        },
      });
      // check duplicated accounts
      if (checkUser) {
        responseData(res, "email exist => using another email", "", 400);
        return;
      }
      // create new user
      let data = await model.User.create({
        roleID,
        name,
        phoneNumber,
        email,
        password: bcrypt.hashSync(password, 10),
      });

      // Create a record in the corresponding role table based on roleID
      switch (roleID) {
        case 1: // Parent
          let data1 = await model.Parent.create({
            address: other,
            userID: data.userID,
          });
          break;
        case 2: // Driver
          let data2 = await model.Driver.create({
            licenseNumber: other,
            userID: data.userID,
          });
          break;
        case 3: // Teacher
          let data3 = await model.Teacher.create({
            department: other,
            userID: data.userID,
          });
          break;
      }

      responseData(res, "success", data, 200);
    } catch (error) {
      responseData(res, "Error ...", "", 500);
    }
  }

  static async login(req, res) {
    // Function to handle user login
    // try {
    let { email, password } = req.body;

    // check email và pass_word == table user
    // SELECT * FROM users WHERE email=email AND password= password
    // if(email==email && password==password)
    let checkUser = await model.User.findOne({
      where: {
        email: email,
      },
    });

    // exist => login successfully
    if (checkUser) {
      if (bcrypt.compareSync(password, checkUser.password)) {
        // miliseconds
        let key = new Date().getTime();

        let token = createToken({
          userID: checkUser.userID,
          key,
        });

        // generate refresh token
        let refToken = createRefToken({
          userID: checkUser.userID,
          key,
        });

        // save refresh token into table user

        // UPDATE users SET ... WHERE ...
        await model.User.update(
          { ...checkUser.dataValues, refreshToken: refToken },
          {
            where: { userID: checkUser.userID },
          }
        );

        responseData(res, "Login successfully", token, 200);
      } else {
        responseData(res, "incorrect password", "", 400);
      }
    } else {
      // doesn't exist => wrong email or password
      responseData(res, "Email is incorrect", "", 400);
    }

    // } catch {
    //     responseData(res, "Lỗi ...", "", 500);
    // }
  }

  static async logout(req, res) {
    // Function to handle user logout
    try {

    let { token } = req.headers;

    // {data: { user_id: }}
    let accessToken = decodeToken(token);

    // get information of user in database
    let getUser = await model.User.findOne({
      where: {
        userID: accessToken.data.userID,
      },
    });

    await model.User.update(
      { ...getUser.dataValues, refreshToken: "" },
      {
        where: { userID: getUser.userID },
      }
    );

    responseData(res, "successfully", "", 200);

    } catch {
        responseData(res, "Error ...", "", 500);
    }
  }

  static async refreshToken(req, res) {
    // Function to handle token refresh
    try {
        let { token } = req.headers;
    
        // check access token (not refresh Token)
        let check = checkToken(token);
        if (check != null && check.name != "TokenExpiredError") {
          // token not legit
          res.status(401).send(check.name);
          return;
        }
    
        // {data: { user_id: }}
        let accessToken = decodeToken(token);
    
        // get info of user in database
        let getUser = await model.User.findOne({
          where: {
            userID: accessToken.data.userID,
          },
        });
    
        // check Ref token
        let checkRef = checkRefToken(getUser.refreshToken);
        if (checkRef != null) {
          // check refresh token expired or not
          res.status(401).send(check.name);p
          return;
        }
    
        // check code
        let refToken = decodeToken(getUser.refreshToken);
        if (accessToken.data.key != refToken.data.key) {
          res.status(401).send(check.name);
          return;
        }
    
        // create new access token
        let newToken = createToken({
          userID: getUser.userID,
          key: refToken.data.key,
        });
    
        responseData(res, "", newToken, 200);
      } catch {
        responseData(res, "Lỗi ...", "", 500);
      }
  }

//   static async validateToken(req, res) {
//     // Function to validate token
//     // try{
//     // let { userID }  = req.params;
//     const data = await model.User.findAll({
//       // where: {
//       //     userID : userID,
//       // }
//     });
//     responseData(res, "success", data, 200);

//     // res.status(200).json(data);

//     // }catch{
//     //     responseData(res, "Error", "", 500);

//     // }
//   }
}
