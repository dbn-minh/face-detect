import {responseData} from "../config/response.js";
import * as service from '../services/parentServices.js';
import {uploadAvatarToOneDrive} from "../services/studentService.js";

export default class ParentController {
    static async getParentHome(req, res) {
      const parent_id = req.params.parent_id;

      try {
        // Get student_ids by parent_id
        const students = await service.getAllStudentsInformationByParentId(parent_id);

        // If no students found
        if (!students || students.length === 0) {
          return responseData(res, 'Fail', 'No students found for this parent', 404);
        }

          // Lấy thông tin current_location cho từng học sinh thông qua driver_id
          const studentsWithDetails = await Promise.all(
              students.map(async (student) => {
                  let updatedStudent = { ...student };
                  let currentLocation = null;

                  if (student.driver && student.driver.driver_id) {
                      currentLocation = await service.getCurrentLocationByDriverId(student.driver.driver_id);
                  }

                  const notifications = await service.getNotificationsByParentId(parent_id);

                  return {
                      ...updatedStudent,
                      current_location: currentLocation || 'Unknown location',
                      notifications: notifications || [],
                  };
              })
          );

        return responseData(res, 'Success', studentsWithDetails, 200);

      } catch (error) {
        return responseData(res, 'Fail', error.message, 500);
      }
    }

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
    static async uploadStudentAvatar(req, res){
        const parent_id = req.params.parent_id;  // Get student ID from URL params
        const filePath = req.file.path;  // Temporary path where file is stored
        const originalFileName = req.file.originalname;  // Get original file name

        // Generate a unique file name using student ID and timestamp
        const timestamp = Date.now();
        const extension = originalFileName.split('.').pop();  // Get file extension
        const fileName = `avatars/${parent_id}-${timestamp}.${extension}`;

        try {
            // Upload the avatar to OneDrive
            const result = await uploadAvatarToOneDrive(parent_id, filePath, fileName);

            // Respond with the success message and avatar URL
            return res.status(200).json({ message: 'Success', data: result });
        } catch (error) {
            // Handle any errors that occur
            return res.status(500).json({ message: 'Error', error: error.message });
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

