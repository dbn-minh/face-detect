import {responseData} from "../config/response.js";
import initModels from "../models/init-models.js";
import sequelize from "../config/database.js";
let model = initModels(sequelize);
import {
    getStudentsOfParent,
    getStudentDetailsWithTeacher,
    getStudentIDsByParentID,
    getAttendanceIDsByStudentIDs,
    getNotificationsByAttendanceIDs
} from '../services/parentServices.js';


export default class ParentController {
    // Fetch details of students associated with the parent
    static async getParentDetails(req, res) {
        const parent_id = req.params.parent_id;

        // Step 1: Get Students for the parent
        const { error: studentError, data: students } = await getStudentsOfParent(parent_id);

        if (studentError) {
            return responseData(res, "Fail", studentError, 404);
        }

        // Step 2: Get Teacher details for each student
        const { error: detailError, data: studentDetailsWithTeachers } = await getStudentDetailsWithTeacher(students);

        if (detailError) {
            return responseData(res, "Fail", detailError, 500);
        }

        // Return the combined data
        return responseData(res, "Success", studentDetailsWithTeachers, 200);
    }

    // Fetch notifications for the parent based on their associated students' attendance
    static async getNotifications(req, res) {
        const parent_id = req.params.parent_id;

        try {
            // Step 1: Get student IDs for the parent
            const { error: studentError, data: student_ids } = await getStudentIDsByParentID(parent_id);

            // Step 2: Get attendance IDs for those students
            const { error: attendanceError, data: attendance_ids } = await getAttendanceIDsByStudentIDs(student_ids);

            if (attendanceError || attendance_ids.length === 0) {
                return responseData(res, "Fail", attendanceError || "No attendance records found for these students", 404);
            }

            // Step 3: Get notifications linked to those attendance records
            const { error: notificationError, data: notifications } = await getNotificationsByAttendanceIDs(attendance_ids);

            if (notificationError || notifications.length === 0) {
                return responseData(res, "Fail", notificationError || "No notifications found for this parent", 404);
            }

            // Return the notifications
            return responseData(res, "Success", notifications, 200);

        } catch (error) {
            return responseData(res, "Error", "An error occurred while fetching notifications", 500);
        }
    }

    // Placeholder for bus tracking functionality (to be implemented)
    static async getBusTracking(req, res) {
        // Implementation pending
    }

    // Fetch the complete profile of the parent
    static async getParentProfile(req, res) {
        try {
            const { parent_id } = req.params;

            // Fetch the parent's profile with all attributes
            const PaProfile = await model.Parent.findOne({
                where: { parent_id: parent_id },
                include: [{
                    model: model.User,
                    as: 'user',
                }]
            });

            if (!PaProfile) {
                return responseData(res, "Fail", "Parent not found", 404);
            }

            // Prepare the data to return (all attributes of the parent)
            const data = PaProfile.toJSON(); // Converts Sequelize model instance to plain JSON

            return responseData(res, "Success", data, 200);
        } catch (e) {
            return responseData(res, "Error", e.message, 500);
        }
    }

    static async updateParentProfile(req, res) {
        // Fudinction to update parent profile
    }

    static async createParentProfile(req, res) {
        // Function to create parent profile
    }

    static async deleteParentProfile(req, res) {
        // Function to delete parent profile
    }

    static async registerStudent(req, res) {
        // Function to register student for bus
    }

    static async logoutParent(req, res) {
        // Function to handle parent logout
    }
}
