import {responseData} from "../config/response.js";
import * as service from '../services/parentServices.js';
import {getStudentIdByParentId, saveAvatarPathToDatabase, saveFeatureVectorToDatabase} from "../services/studentService.js";
import {
    deleteFromAzure,
    uploadAvatarToAzure,
    uploadBiometricToAzure
} from "../config/azureService.js";
import axios from 'axios';
import {getAllChildrenInformationByParentId} from "../services/parentServices.js"; // Use ES Module import


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

    static async getChildrenInformation(req, res) {
        const parent_id = req.params.parent_id;
        try {
        const students = await service.getAllChildrenInformationByParentId(parent_id);

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

    // Controller to upload avatar to OneDrive and update DB
    static async extractFeature(req, res) {
        const parent_id = req.params.parent_id;
        const files = req.files;
        const imageUrls = [];

        if (!files || files.length !== 3) {
            return responseData(res, 'Please upload exactly 3 images.', null, 400);
        }

        try {
            // get information of student from database 
            const {student_id, name} = await getStudentIdByParentId(parent_id);

            // create subFolder according to student_id
            const containerName = 'biometric';
            const subFolder = `student_id=${student_id}`;
            const projectCode = 'STUDENT_TRACKING';
            const entityType = 'feature-vector';
            const imageUrls = [];

            // Upload each file into subFolder
            for (const file of files) {
                const fileName = `${projectCode}-${entityType}-${Date.now()}-${file.originalname}`;
                const fileUrl = await uploadBiometricToAzure(file.buffer, fileName, containerName, subFolder);
                imageUrls.push(fileUrl);
            }
            console.log(`All uploaded files:`, imageUrls);

            // --- ADDITION: Transfer the file URL to the Flask API ---
            const flaskUrl = 'http://localhost:5000/extract-vector'; // Replace with Flask API URL
            const flaskResponse = await axios.post(flaskUrl, {imageUrls});

            if (flaskResponse.status !== 200) {
                throw new Error(`Flask API Error: ${flaskResponse.data.message || 'Unknown error'}`);
            }

            const featureVectors = flaskResponse.data.meanFeatureVector;


            // Lưu đường dẫn URL vào cơ sở dữ liệu
            await saveFeatureVectorToDatabase(student_id, featureVectors);

            console.log(featureVectors)

            // Trả về thông tin học sinh và URL ảnh
            return responseData(res, 'Avatar uploaded successfully', {
                student: {
                    student_id: student_id,
                    name: name,
                    feature_vector: featureVectors,
                    image_urls: imageUrls
                }
            }, 200);

        } catch (error) {
            // Dọn dẹp file đã upload trong trường hợp lỗi (NHƯNG PHẦN NÀY CÒN BUG CHƯA DÙNG ĐƯỢC DO CHỈ ĐANG XOÁ ĐƯỢC Ở THƯ MỤC PARENT CHƯA CÓ XOÁ ĐƯỢC TRONG SUBFOLDER
            for (const fileUrl of imageUrls) {
                try {
                    const fileName = decodeURIComponent(fileUrl.split('/').pop());
                    await deleteFromAzure(fileName, 'biometric');
                } catch (deleteError) {
                }
            }

            return responseData(res, 'Error extracting feature vectors.', error.message, 500);
        }
    }
}

