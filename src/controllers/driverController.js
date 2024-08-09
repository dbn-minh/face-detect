import {responseData} from "../config/response.js";
import { Sequelize } from "sequelize";
import sequelize from "../config/database.js";
import initModels from "../models/init-models.js";

let model = initModels(sequelize);

export default class DriverController {
    static async getDriverDetails(req, res) {
        // Function to get driver details
        try {
            let { driver_id } = req.params;

            let data = await model.Driver.findOne({
                where: {driverID: driver_id}
            });

            responseData(res, "Success", data, 200);
        } catch (e){
            responseData(res, "Error ...", e.message, 500);
        }
    }

    static async getDriverProfile(req, res) {
        // Function to get driver profile
    }

    static async updateDriverProfile(req, res) {
        // Function to update driver profile
    }

    static async createDriverProfile(req, res) {
        // Function to create driver profile
    }

    static async deleteDriverProfile(req, res) {
        // Function to delete driver profile
    }

    static async logoutDriver(req, res) {
        // Function to handle driver logout
    }
}
