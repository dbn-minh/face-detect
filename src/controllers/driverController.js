import {responseData} from "../config/response.js";
import * as service from "../services/driverServices.js";

export default class DriverController {
    // Fetch details students of driver in journey
    static async getDriverDetails(req, res) {
        try {
            const { driver_id } = req.params;
            const { error, data } = await service.getDriverDetailsById(driver_id);

            if (error) {
                return responseData(res, "Fail", error, 404);
            }

            return responseData(res, "Success", data, 200);
        } catch (e) {
            return responseData(res, "Error", e.message, 500);
        }

    }

    // Fetch the complete profile of a driver
    static async getDriverProfile(req, res) {
        try {
            const { driver_id } = req.params;
            const { error, data } = await service.getDriverProfileById(driver_id);

            if (error) {
                return responseData(res, "Fail", error, 404);
            }

            return responseData(res, "Success", data, 200);
        } catch (e) {
            return responseData(res, "Error", e.message, 500);
        }
    }

    // Update the profile of a driver
    static async updateDriverProfile(req, res) {
        try {
            const { driver_id } = req.params;
            const updatedDriverData = req.body;

            const { error, data } = await service.updateDriverProfileById(driver_id, updatedDriverData);

            if (error) {
                return responseData(res, "Fail", error, 404);
            }

            return responseData(res, "Success", data, 200);
        } catch (e) {
            return responseData(res, "Error", e.message, 500);
        }
    }
}