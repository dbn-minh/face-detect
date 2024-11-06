import {responseData} from "../config/response.js";
import * as service from '../services/teacherServices.js';

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
}

