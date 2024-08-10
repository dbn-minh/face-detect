import {responseData} from "../config/response.js";
import {Sequelize} from "sequelize";
import sequelize from "../config/database.js";
import initModels from "../models/init-models.js";

let model = initModels(sequelize);

export default class DriverController {
    static async getDriverDetails(req, res) {
        // Function to get driver details
        try {
            let {driver_id} = req.params;

            let data = await model.Driver.findOne({
                where: {driverID: driver_id}
            });

            if (!data) {
                responseData(res, "Fail", "Driver not found", 404)
            }

            responseData(res, "Success", data, 200);
        } catch (e) {
            responseData(res, "Error ...", e.message, 500);
        }
    }

    static async getDriverProfile(req, res) {
        // Function to get driver profile

        try {
            let {id} = req.params;

            let data = await model.User.findOne({
                where: {userId: id}
            });
            if (!data || data.roleID !== 2) {
                return responseData(res, "Fail", "Driver not found", 404)
            }

            responseData(res, "Success", data, 200);
        } catch (e) {
            responseData(res, "Error ...", e.message, 500);
        }
    }

    static async updateDriverProfile(req, res) {
        // Function to update driver profile

        try {
            let {id} = req.params;
            let {name, phoneNumber, email} = req.body;

            let data = await model.User.findOne({
                where: {userId: id}
            });
            if (!data || data.roleID !== 2) {
                responseData(res, "No driver for update", "", 404);
            }

            await data.update({name, phoneNumber, email});


            responseData(res, "Success update", data, 200);
        } catch (e) {
            responseData(res, "Error ...", e.message, 500);
        }
    }

    static async createDriverProfile(req, res) {
        // Function to create driver profile
        try {
            let {name, phoneNumber, email} = req.body;

            let data = await model.User.findOne({
                where: {name, phoneNumber, email},
            });

            !data
                ? await model.User.create({name, phoneNumber, email, roleID: 2})
                : responseData(res, "Create Fail, user is available", data, 404);

            responseData(res, "Success create new driver", data, 200);
        } catch (e) {
            responseData(res, "Error ...", e.message, 500);
        }
    }

    static async deleteDriverProfile(req, res) {
        // Function to delete driver profile

        try {
            let {id} = req.params;

            let data = await model.User.findOne({
                where: {userId: id}
            });

            if (!data || data.roleID !== 2) {
                responseData(res, "Fail", "Driver not found", 404);
                return;
            }
            await data.destroy();

            responseData(res, "Success", "Driver profile deleted successfully", 200);
        } catch (e) {
            responseData(res, "Error ...", e.message, 500);
        }
    }

    static async logoutDriver(req, res) {
        // Function to handle driver logout
    }
}
