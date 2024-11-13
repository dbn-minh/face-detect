import {responseData} from "../config/response.js";
import * as service from '../services/parentServices.js';
import {getStudentIdByParentId, saveAvatarPathToDatabase} from "../services/studentService.js";
import {deleteFromAzure, uploadAvatarToAzure} from "../config/azureService.js";

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
        const file = req.file;

        if (!file) {
            return responseData(res, 'No file uploaded', null, 400);
        }
        try {
            // Lấy thêm thông tin của học sinh từ database
            const { student_id, name, avatar: currentAvatarUrl } = await getStudentIdByParentId(parent_id);

            if (currentAvatarUrl) {
                const oldFileName = decodeURIComponent(currentAvatarUrl.split('/').pop().split('?')[0]);
                console.log(`Attempting to delete old file: ${oldFileName} from Azure`);
                await deleteFromAzure(oldFileName, 'avatars');
            }

            // Tạo tên file với định dạng mới
            const projectCode = 'STUDENT_TRACKING';
            const entityType = 'avatar';
            const fileName = `${projectCode}-${entityType}-parentId=${parent_id}-studentId=${student_id}-${Date.now()}-${file.originalname}`;

            // Tải ảnh lên Azure và lấy URL
            const fileUrl = await uploadAvatarToAzure(file.buffer, fileName);

            // Lưu đường dẫn URL vào cơ sở dữ liệu
            await saveAvatarPathToDatabase(parent_id, fileUrl);

            // Trả về thông tin học sinh và URL ảnh
            return responseData(res, 'Avatar uploaded successfully', {
                student: {
                    student_id: student_id,
                    name: name,
                    avatarUrl: fileUrl
                }
            }, 200);

        } catch (error) {
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

