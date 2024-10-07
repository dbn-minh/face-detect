import {responseData} from "../config/response.js";
import * as service from '../services/parentServices.js';

export default class ParentController {
    static async getParentHome(req, res) {
      const parent_id = req.params.parent_id;

      try {
        // Gọi service để lấy danh sách học sinh dựa trên parent_id
        const students = await service.getAllStudentsInformationByParentId(parent_id);

        // Nếu không tìm thấy học sinh
        if (!students || students.length === 0) {
          return responseData(res, 'Fail', 'No students found for this parent', 404);
        }

        // Lấy thông tin current_location cho từng học sinh thông qua driver_id
        const studentsWithDetails = await Promise.all(
          students.map(async (student) => {
            let updatedStudent = { ...student };

            // Gọi service để lấy current_location từ driver_id
            if (student.driver && student.driver.driver_id) {
              const currentLocation = await service.getCurrentLocationByDriverId(student.driver.driver_id);
              updatedStudent.driver = {
                ...student.driver,
                current_location: currentLocation || 'Unknown location',
              };
            }

            // Gọi service để lấy notifications dựa trên student_id
            const notifications = await service.getNotificationsByStudentId(student.student_id);
            updatedStudent.notifications = notifications || [];

            return updatedStudent;
          })
        );

        // Trả về danh sách học sinh kèm thông tin tài xế, current_location và notifications
        return responseData(res, 'Success', studentsWithDetails, 200);

      } catch (error) {
        // Trả về lỗi nếu có vấn đề xảy ra trong quá trình xử lý
        return responseData(res, 'Fail', error.message, 500);
      }
    }

    static async getStudentInformation(req, res) {
      const parent_id = req.params.parent_id;

      try {
        // Gọi service để lấy danh sách học sinh dựa trên parent_id
        const students = await service.getAllStudentsInformationByParentId(parent_id);

        // Nếu không tìm thấy học sinh
        if (!students || students.length === 0) {
          return responseData(res, 'Fail', 'No students found for this parent', 404);
        }

        // Trả về danh sách học sinh kèm thông tin tài xế, current_location và notifications
        return responseData(res, 'Success', students, 200);

      } catch (error) {
        // Trả về lỗi nếu có vấn đề xảy ra trong quá trình xử lý
        return responseData(res, 'Fail', error.message, 500);
      }
    }

    static async getNotifications(req, res) {
      const { parent_id } = req.params;

      try {
        // Gọi service để lấy danh sách student_id dựa trên parent_id
        const studentIds = await service.getStudentIdsByParentId(parent_id);

        // Nếu không có student_id nào
        if (!studentIds || studentIds.length === 0) {
          return responseData(res, 'Fail', 'No students found for this parent', 404);
        }

        // Lấy tất cả notifications cho từng student_id
        const notifications = await Promise.all(
          studentIds.map(async (student_id) => {
            const studentNotifications = await service.getNotificationsByStudentId(student_id);
            return {
              student_id: student_id,
              notifications: studentNotifications || [],
            };
          })
        );

        // Trả về danh sách thông báo theo từng học sinh
        return responseData(res, 'Success', notifications, 200);

      } catch (error) {
        // Trả về lỗi nếu có vấn đề xảy ra trong quá trình xử lý
        return responseData(res, 'Fail', error.message, 500);
      }
    }
}
