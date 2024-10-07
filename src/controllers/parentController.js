import {responseData} from "../config/response.js";
import * as service from '../services/parentServices.js';

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

    static async getSettingOfParent(req, res) {
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
}
