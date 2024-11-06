import {responseData} from "../config/response.js";
import * as service from "../services/driverServices.js";

export default class DriverController {
    // Fetch details students of driver in journey
    static async getDriverDetails(req, res) {
        const { driver_id } = req.params;
        try {
            const driverDetails = await service.getDriverDetails(driver_id);

            return responseData(res, "Success", driverDetails, 200);
        } catch (e) {
            return responseData(res, "Error", e.message, 500);
        }
    }

    static async getDriverSetting(req, res) {
        const { driver_id } = req.params;
        try {
            const driverSetting = await service.getDriverSetting(driver_id);

            return responseData(res, "Success", driverSetting, 200);
        } catch (e) {
            return responseData(res, "Error", e.message, 500);
        }
    }

    static async writeFeedback(req, res){
        const { driver_id } = req.params;
        const { title, content } = req.body;

        try {
            // Call the combined service to handle both getting user_id and writing feedback
            const feedback = await service.writeFeedback(driver_id, title, content);

            return responseData(res, 'Success', feedback, 201);
        } catch (error) {
            return responseData(res, 'Fail', error.message, 500);
        }
    }
    static async reportBrokenBus(req, res) {
        const { driver_id } = req.params;
        const action = req.body.action;

        try {
            const result = await service.reportBrokenBus(driver_id, action);

            // Check if the result contains an error message
            if (result.error) {
                return responseData(res, result.error, result.bus, 400); // 400 for client error
            }
            return responseData(res, "Broken bus reported successfully", result, 201);
        } catch (error) {
            return responseData(res, "Error reporting broken bus", error.message, 500);
        }
    }
}