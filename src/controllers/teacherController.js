import {responseData} from "../config/response.js";

import * as service from '../services/teacherServices.js';


export default class TeacherController {
//     // Fetch details of students associated with the parent
//     static async getParentDetails(req, res) {
//         const parent_id = req.params.parent_id;
//
//         // Step 1: Get Students for the parent
//         const { error: studentError, data: students } = await service.getStudentsOfParent(parent_id);
//
//         if (studentError) {
//             return responseData(res, "Fail", studentError, 404);
//         }
//
//         // Step 2: Get Teacher details for each student
//         const { error: detailError, data: studentDetailsWithTeachers } = await service.getStudentDetailsWithTeacher(students);
//
//         if (detailError) {
//             return responseData(res, "Fail", detailError, 500);
//         }
//
//         // Return the combined data
//         return responseData(res, "Success", studentDetailsWithTeachers, 200);
//     }
//
//     // Fetch notifications for the parent based on their associated students' attendance
//     static async getNotifications(req, res) {
//         const parent_id = req.params.parent_id;
//
//         try {
//             // Step 1: Get student IDs for the parent
//             const { error: studentError, data: student_ids } = await service.getStudentIDsByParentID(parent_id);
//
//             // Step 2: Get attendance IDs for those students
//             const { error: attendanceError, data: attendance_ids } = await service.getAttendanceIDsByStudentIDs(student_ids);
//
//             if (attendanceError || attendance_ids.length === 0) {
//                 return responseData(res, "Fail", attendanceError || "No attendance records found for these students", 404);
//             }
//
//             // Step 3: Get notifications linked to those attendance records
//             const { error: notificationError, data: notifications } = await service.getNotificationsByAttendanceIDs(attendance_ids);
//
//             if (notificationError || notifications.length === 0) {
//                 return responseData(res, "Fail", notificationError || "No notifications found for this parent", 404);
//             }
//
//             // Return the notifications
//             return responseData(res, "Success", notifications, 200);
//
//         } catch (error) {
//             return responseData(res, "Error", "An error occurred while fetching notifications", 500);
//         }
//     }
//
//     // Placeholder for bus tracking functionality (to be implemented)
//     static async getBusTracking(req, res) {
//         // Implementation pending
//     }
//
//     static async getParentProfile(req, res) {
//         try {
//             const { parent_id } = req.params;
//
//             const { error, data } = await service.getParentProfileById(parent_id);
//
//             if (error) {
//                 return responseData(res, "Fail", error, 404);
//             }
//
//             return responseData(res, "Success", data, 200);
//         } catch (e) {
//             return responseData(res, "Error", e.message, 500);
//         }
//     }
//
//     // Update the profile of a parent
//     static async updateParentProfile(req, res) {
//         try {
//             const { parent_id } = req.params;
//             const updatedParentData = req.body;
//
//             const { error, data } = await service.updateParentProfileById(parent_id, updatedParentData);
//
//             if (error) {
//                 return responseData(res, "Fail", error, 404);
//             }
//
//             return responseData(res, "Success", data, 200);
//         } catch (e) {
//             return responseData(res, "Error", e.message, 500);
//         }
//     }
//
//     static async registerStudent(req, res) {
//         try {
//             const { parent_id } = req.params;
//             const studentData = req.body;
//
//             const { error, data } = await service.registerStudent(parent_id, studentData);
//
//             if (error) {
//                 return responseData(res, "Fail", error, 404);
//             }
//
//             return responseData(res, "Success", data, 201);
//         } catch (e) {
//             return responseData(res, "Error", e.message, 500);
//         }
//     }
//
}
