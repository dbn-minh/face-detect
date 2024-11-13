import {responseData} from "../config/response.js";
import * as service from '../services/teacherServices.js';
import {deleteFromAzure, uploadToAzure} from "../config/azureService.js";

export default class TeacherController {
    static async getHomepage(req, res) {
        try {
            const teacher_id  = req.params.teacher_id;

            // Fetch students and their parent information
            const homepage = await service.getDetailsOfTeacher(teacher_id);

            return responseData(res, "Success", homepage, 200);
        } catch (e) {
            return responseData(res, "Error", e.message, 500);
        }
    }

    static async getNotifications(req, res) {
        try {
            const teacher_id  = req.params.teacher_id;

            // Fetch students and their parent information
            const homepage = await service.getNotificationsByTeacherId(teacher_id);

            return responseData(res, "Success", homepage, 200);
        } catch (e) {
            return responseData(res, "Error", e.message, 500);
        }
    }

    static async getStudentsInformation(req, res) {
        try {
            const teacher_id  = req.params.teacher_id;

            // Fetch students and their parent information
            const data = await service.getStudentsInfo(teacher_id);

            // Trả về thông tin tổng số học sinh hiện diện và vắng mặt
            const response = {
                total_students: `${data.presentCount}/${data.totalCount}`, // Ví dụ: 19/20
                absent_students: data.absentStudents,
                present_students: data.presentStudents
            };

            return responseData(res, "Success", response, 200);
        } catch (e) {
            return responseData(res, "Error", e.message, 500);
        }
    }

    static async getSetting(req, res) {
        try {
            const teacher_id  = req.params.teacher_id;

            // Fetch students and their parent information
            const setting = await service.getSettingOfTeacher(teacher_id);

            return responseData(res, "Success", setting, 200);
        } catch (e) {
            return responseData(res, "Error", e.message, 500);
        }
    }

    static async updateProfile(req, res) {
        const teacher_id = req.params.teacher_id;
        const updatedData = req.body;

        try {
            const result = await service.updateProfileOfTeacher(teacher_id, updatedData);
            return responseData(res, "Success", result.updatedProfile, 200);
        } catch (error) {
            return responseData(res, "Fail", error.message, 500);
        }
    }
    static async writeFeedback(req, res){
        const { teacher_id } = req.params;
        const { title, content } = req.body;

        try {
            // Call the combined service to handle both getting user_id and writing feedback
            const feedback = await service.writeFeedback(teacher_id, title, content);

            return responseData(res, 'Success', feedback, 201);
        } catch (error) {
            return responseData(res, 'Fail', error.message, 500);
        }
    }

    static async getStudentsForDropdown(req, res) {
        const { teacher_id } = req.params;

        try {
            const students = await service.getValidStudentAttendances(teacher_id);
            return responseData(res, 'Fetched students successfully', students, 200);
        } catch (error) {
            return responseData(res, error.message, null, 500);
        }
    }

    // nếu set boarded thì xoá luôn phần thông báo cũ -> chưa xoá được trên cloud nên hãy tìm hiểu phần này
    static async uploadBrokenPhotos(req, res) {
        const { teacher_id } = req.params;
        const { attendance_id, status } = req.body;
        const file = req.file;

        try {
            // Lấy thông tin hiện tại của Notification để xác định file ảnh cũ
            const currentNotification = await service.getNotificationByAttendanceId(attendance_id);
            if (currentNotification && currentNotification.image) {
                const oldFileName = decodeURIComponent(currentNotification.image.split('/').pop().split('?')[0]); // Lấy tên file từ URL
                const oldStatus = oldFileName.includes('status=boarded') ? 'boarded' : 'alighted'; // Lấy `status` từ tên file
                // Kiểm tra xem `status` của file cũ có trùng với `status` của yêu cầu hiện tại không
                if (oldStatus === status) {
                    console.log(`Attempting to delete old file: ${oldFileName} from Azure with status ${status}`);
                    await deleteFromAzure(oldFileName, 'notifications');
                } else {
                    console.log(`Skipping delete for ${oldFileName} as it has a different status (${oldStatus}) than the current status (${status})`);
                }
            }

            const projectCode = 'STUDENT_TRACKING';
            const entityType = 'notification';
            const fileName = `${projectCode}-${entityType}-teacherId=${teacher_id}-attendanceId=${attendance_id}-status=${status}-${Date.now()}-${file.originalname}`;

            // Tải ảnh lên Azure Blob Storage và lấy URL
            const fileUrl = await uploadToAzure(req.file.buffer, fileName);

            // Tạo thông báo với URL từ Azure
            const newNotification = await service.createBrokenPhotoNotification(teacher_id, attendance_id, fileUrl, status);
            if (!newNotification.success) {
                return responseData(res, newNotification.message, null, 400);  // Trả về lỗi khi status không hợp lệ
            }

            const result = await service.updateAttendanceStatus(attendance_id, status);
            if (!result.success) {
                return responseData(res, result.message, null, 400);  // Trả về lỗi khi status không hợp lệ
            }

            // Trả về thông báo thành công với URL của ảnh
            return responseData(res, 'Broken photo uploaded and attendance updated successfully', newNotification.data, 200);
        } catch (error) {
            return responseData(res, error.message, null, 500);
        }
    }

    static async uploadEmergencyPhoto(req, res) {
        const { teacher_id } = req.params;
        const { attendance_id } = req.body;
        const fileName = `${Date.now()}-${req.file.originalname}`; // Đường dẫn lưu hình ảnh khẩn cấp

        try {
            const fileUrl = await uploadToAzure(req.file.buffer, fileName);
            // Tạo thông báo khẩn cấp mới
            const emergencyNotification = await service.createEmergencyNotification(teacher_id, attendance_id, fileUrl);

            if (!emergencyNotification.success) {
                return responseData(res, emergencyNotification.message, null, 400);  // Trả về lỗi nếu không thành công
            }

            // Trả về thông báo thành công
            return responseData(res, 'Emergency photo uploaded and alert notification created successfully', emergencyNotification.data, 200);
        } catch (error) {
            console.log('Error in uploadEmergencyPhoto:', error.message);
            return responseData(res, error.message, null, 500);
        }
    }
}

