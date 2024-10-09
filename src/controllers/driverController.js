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
}