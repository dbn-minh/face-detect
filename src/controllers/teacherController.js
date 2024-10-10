import {responseData} from "../config/response.js";
import * as service from '../services/teacherServices.js';

export default class TeacherController {
    static async getHomepage(req, res) {
        try {
            const teacher_id  = req.params.teacher_id;

            // Fetch students and their parent information
            const { error, data } = await service.getDetailsOfTeacher(teacher_id);

            if (error) {
                return responseData(res, "Fail", error, 404);
            }

            return responseData(res, "Success", data, 200);
        } catch (e) {
            return responseData(res, "Error", e.message, 500);
        }
    }

    // static async getNotifications(req, res) {
    //     const teacher_id = req.params.teacher_id;
    //
    //     try {
    //         const { error, data } = await service.getTeacherNotifications(teacher_id);
    //
    //         if (error) {
    //             return responseData(res, "Fail", error, 404);
    //         }
    //
    //         return responseData(res, "Success", data, 200);
    //     } catch (e) {
    //         return responseData(res, "Error", e.message, 500);
    //     }
    // }
    // static async getTeacherProfile(req, res) {
    //     const teacher_id = req.params.teacher_id;
    //
    //     try {
    //         const { error, data } = await service.getTeacherProfile(teacher_id);
    //
    //         if (error) {
    //             return responseData(res, "Fail", error, 404);
    //         }
    //
    //         return responseData(res, "Success", data, 200);
    //     } catch (e) {
    //         return responseData(res, "Error", e.message, 500);
    //     }
    // }
    //
    // static async updateTeacherProfile(req, res) {
    //     const teacher_id = req.params.teacher_id;
    //     const { name, email, phone_number, department } = req.body;
    //
    //     try {
    //         const userData = { name, email, phone_number };
    //
    //         const { error, data } = await service.updateTeacherProfile(
    //             teacher_id,
    //             userData,
    //             department
    //         );
    //
    //         if (error) {
    //             return responseData(res, "Fail", error, 400);
    //         }
    //
    //         return responseData(res, "Success", data, 200);
    //     } catch (e) {
    //         return responseData(res, "Error", e.message, 500);
    //     }
    // }
    //
    // // Get the current locations of all buses associated with the teacher's students
    // static async getBusTracking(req, res) {
    //     const { teacher_id } = req.params;
    //
    //     try {
    //         // Call the service to get the drivers' locations
    //         const { error, data } = await service.getDriverLocationsByTeacherId(teacher_id);
    //
    //         if (error) {
    //             return responseData(res, "Fail", error, 404);
    //         }
    //
    //         return responseData(res, "Success", data, 200);
    //     } catch (e) {
    //         console.error("Error in getBusTracking:", e.message);
    //         return responseData(res, "Error", "An unexpected error occurred", 500);
    //     }
    // }
}

