import { responseData } from "../config/response.js";
import * as service from "../services/adminServices.js";
import {getAdminDetails} from "../services/adminServices.js";

export default class AdminController {
    // Fetch details of a specific admin, including associated departments
    static async getAdminDetails(req, res) {
        try {
            const { error, data } = await service.getAdminDetails();

            if (error) {
                return responseData(res, "Fail", error, 404);
            }

            return responseData(res, "Success", data, 200);
        } catch (e) {
            return responseData(res, "Error", e.message, 500);
        }
    }

    // Fetch notifications for all students
    static async getNotifications(req, res) {
        try {
            // Step 1: Get all student IDs
            const { error: studentError, data: student_ids } = await service.getAllStudentIDs();

            if (studentError || student_ids.length === 0) {
                return responseData(res, "Fail", studentError || "No students found", 404);
            }

            // Step 2: Get attendance IDs for those students
            const { error: attendanceError, data: attendance_ids } = await service.getAttendanceIDsByStudentIDs(student_ids);

            if (attendanceError || attendance_ids.length === 0) {
                return responseData(res, "Fail", attendanceError || "No attendance records found for these students", 404);
            }

            // Step 3: Get notifications linked to those attendance records
            const { error: notificationError, data: notifications } = await service.getNotificationsByAttendanceIDs(attendance_ids);

            if (notificationError || notifications.length === 0) {
                return responseData(res, "Fail", notificationError || "No notifications found for these students", 404);
            }

            // Return the notifications
            return responseData(res, "Success", notifications, 200);

        } catch (error) {
            return responseData(res, "Error", "An error occurred while fetching notifications", 500);
        }
    }

    static async getAdminTracking(req, res) {
        // Function to get admin tracking info
    }

    // Fetch the profile of the currently authenticated admin
    static async getAdminProfile(req, res) {
        try {
            const user_id = req.user.user_id; // Assuming req.user contains the authenticated user's details

            const { error, data } = await service.getAdminProfileById(user_id);

            if (error) {
                return responseData(res, "Fail", error, 404);
            }

            return responseData(res, "Success", data, 200);
        } catch (e) {
            return responseData(res, "Error", e.message, 500);
        }
    }

    static async updateAdminProfile(req, res) {
        // Function to update admin profile
    }

    static async createAdminProfile(req, res) {
        // Function to create admin profile
    }

    static async deleteAdminProfile(req, res) {
        // Function to delete admin profile
    }

    static async listPendingRegistrations(req, res) {
        // Function to list students awaiting approval
    }

    static async adjustBusAssignments(req, res) {
        // Function to adjust bus assignments
    }

    static async logoutAdmin(req, res) {
        // Function to handle admin logout
    }
}
