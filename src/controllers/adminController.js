import { responseData } from "../config/response.js";
import * as service from "../services/adminServices.js";

export default class AdminController {
    // Fetch details of all students, parents and teachers relevant
    static async getStudentDetails(req, res) {
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

    static async getAllUsers(req, res) {
        try {
            const { error, data } = await service.getAllUsersWithRoleDetails();

            if (error) {
                return responseData(res, "Fail", error, 404);
            }

            return responseData(res, "Success", data, 200);
        } catch (e) {
            return responseData(res, "Error", e.message, 500);
        }
    }

static async createNewProfile(req, res) {
    const { role_id, name, phone_number, email, password, other } = req.body;
    const { error, data, status } = await service.adminCreateUserService(
      role_id,
      name,
      phone_number,
      email,
      password,
      other
    );

    if (error) {
      return responseData(res, error, "", status);
    }
    return responseData(res, "User created successfully", data, status);
  }

  //Update Profiles by user_id
    static async updateProfiles(req, res) {
    const { user_id } = req.params;
    const { role_id, name, phone_number, email, password, other } = req.body;

    const { error, data, status } = await service.adminUpdateUserService(
      user_id,
      role_id,
      name,
      phone_number,
      email,
      password,
      other
    );

    if (error) {
      return responseData(res, error, "", status);
    }
    return responseData(res, data, "", status);
  }

  //Delete profiles by ID
    static async deleteAdminProfile(req, res) {
        const { user_id } = req.params;

        const { error, data, status } = await service.adminDeleteUserService(user_id);

        if (error) {
            return responseData(res, error, "", status);
        }
        return responseData(res, data, "", status);
    }

    static async listPendingRegistrations(req, res) {
        const { error, data } = await service.listPendingRegistrationsService();

        if (error) {
            return responseData(res, "Fail", error, 404);
        }
        return responseData(res, "Success", data, 200);
    }

    static async getAllTeachers(req, res) {
        const { error, data } = await service.getAllTeachersService();

        if (error) {
            return responseData(res, "Fail", error, 404);
        }
        return responseData(res, "Success", data, 200);
    }

    static async assignTeachersToStudents(req, res) {
        try {
            const { teacher_id, student_ids } = req.body;

            // Assign the teacher to the students
            const { error, data } = await service.assignTeacherToStudentsService(teacher_id, student_ids);

            if (error) {
                return responseData(res, "Fail", error, 404);
            }

            // Response with detailed information
            return responseData(res, "Success", data, 200);
        } catch (e) {
            return responseData(res, "Error", e.message, 500);
        }
    }
    static async updateStudentInfo(req, res) {
        try {
            const { student_id } = req.params;
            const updateData = req.body;

            // Update the student information
            const { error, data } = await service.updateStudentInfoService(student_id, updateData);

            if (error) {
                return responseData(res, "Fail", error, 404);
            }

            // Response with detailed information
            return responseData(res, "Success", data, 200);
        } catch (e) {
            return responseData(res, "Error", e.message, 500);
        }
    }

}
