import {responseData} from "../config/response.js";
import * as service from '../services/parentServices.js';
import {saveAvatarPathToDatabase} from "../services/studentService.js";

export default class ParentController {
    static constructStudentResponse = (students, notifications) => {
        return students.map(student => {
            const studentNotifications = notifications[student.student_id] || {};

            return {
                ...student,
                notifications: {
                    alert_messages: studentNotifications.alert_messages || [],
                    bus_breakdown_info: studentNotifications.bus_breakdown_info || null,
                    general_notifications: studentNotifications.general_notifications || []
                }
            };
        });
    };
    static async getParentHome(req, res) {
      const parent_id = req.params.parent_id;

      try {
        // Get student_ids by parent_id
        const students = await service.getAllStudentsInformationByParentId(parent_id);

        // If no students found
        if (!students || students.length === 0) {
          return responseData(res, 'Fail', 'No students found for this parent', 404);
        }

        const notifications = await service.getNotificationsByParentId(parent_id);

        // Construct the response using the helper function
        const response = ParentController.constructStudentResponse(students, notifications);

        return responseData(res, 'Success', response, 200);

      } catch (error) {
        return responseData(res, 'Fail', error.message, 500);
      }
    }

    //pending
    // static async getEmergencyPhoto(req, res) {
    //     const parent_id = req.params.parent_id;
    //     try {
    //     const students = await service.getPhotoOfStudentAlighted(parent_id);
    //
    //     if (!students || students.length === 0) {
    //       return responseData(res, 'Fail', 'No students found for this parent', 404);
    //     }
    //
    //     return responseData(res, 'Success', students, 200);
    //
    //   } catch (error) {
    //     return responseData(res, 'Fail', error.message, 500);
    //   }
    // }

    static async getStudentInformation(req, res) {
        const parent_id = req.params.parent_id;
        try {
        const students = await service.getAllStudentsInformationByParentId(parent_id);

        if (!students || students.length === 0) {
          return responseData(res, 'Fail', 'No students found for this parent', 404);
        }

        return responseData(res, 'Success', students, 200);

      } catch (error) {
        return responseData(res, 'Fail', error.message, 500);
      }
    }

    static async getNotifications(req, res) {
        const parent_id = req.params.parent_id;
        try {
            const notifications = await service.getNotificationsByParentId(parent_id);

            if (!notifications || notifications.length === 0) {
                return responseData(res, 'Fail', 'No notifications found for this parent', 404);
            }

            return responseData(res, 'Success', notifications, 200);

        } catch (error) {
            return responseData(res, 'Fail', error.message, 500);
        }
    }

    static async getParentSetting(req, res) {
        const parent_id = req.params.parent_id;
        try {
            const data = await service.getSetting(parent_id);

            if (!data || data.length === 0) {
                return responseData(res, 'Fail', 'No notifications found for this parent', 404);
            }
            return responseData(res, 'Success', data, 200);
        } catch (error) {
            return responseData(res, 'Fail', error.message, 500);
        }
    }

    static async updateParentSetting(req, res) {
        const parent_id = req.params.parent_id;
        const updateData = req.body;
        try {
            const data = await service.updateSetting(parent_id, updateData);

            if (!data || data.length === 0) {
                return responseData(res, 'Fail', 'No settings found for this parent', 404);
            }
            return responseData(res, 'Success', data, 200);
        } catch (error) {
            return responseData(res, 'Fail', error.message, 500);
        }
    }

    // Controller to upload avatar to OneDrive and update DB
    static async uploadStudentAvatar(req, res) {
        const parent_id = req.params.parent_id;
        const fileName  = req.file.filename;  // File path trên server (để lưu vào database)
        const filePath = `uploads/avatars/${fileName}`;
        // try re-name the file to studentName + id
        try {
            const result = await saveAvatarPathToDatabase(parent_id, fileName);

            return responseData(res, 'Avatar uploaded successfully', { result, filePath: filePath }, 200);
        } catch (error) {
            // Xử lý lỗi bằng responseData
            return responseData(res, 'Error uploading avatar', error.message, 500);
        }
    }

    static async writeFeedback(req, res){
        const { parent_id } = req.params;
        const { title, content } = req.body;

        try {
            // Call the combined service to handle both getting user_id and writing feedback
            const feedback = await service.writeFeedback(parent_id, title, content);

            return responseData(res, 'Success', feedback, 201);
        } catch (error) {
            return responseData(res, 'Fail', error.message, 500);
        }
    }
}

