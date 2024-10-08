import axios from 'axios';
import fs from 'fs';
import { getAccessToken } from './authServices.js';
import initModels from "../models/init-models.js";
import sequelize from "../config/database.js";

let model = initModels(sequelize);

export const getStudentIdByParentId = async (parent_id) => {
    try {
        const studentParentRecord = await model.Student_Parent.findOne({
            where: { parent_id },
            attributes: ['student_id'],
        });

        return studentParentRecord.student_id;  // Return the student_id associated with the parent_id
    } catch (error) {
        throw new Error('Error fetching student by parent: ' + error.message);
    }
};
export const uploadAvatarToOneDrive = async (parent_id, filePath, fileName) => {
    try {

        const student_id = await getStudentIdByParentId(parent_id);
        // Step 1: Get access token from Microsoft Graph API
        const accessToken = await getAccessToken();
        console.log('Access Token:', accessToken);  // Log this to ensure you are getting a valid token

        // Step 2: OneDrive API endpoint
        const driveApiUrl = `https://graph.microsoft.com/v1.0/me/drive/root:/${fileName}:/content`;

        // Step 3: Read file data from the local file system
        const fileData = fs.readFileSync(filePath);
        console.log('File Data:', fileData);

        // Step 4: Upload the file to OneDrive
        const response = await axios.put(driveApiUrl, fileData, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
                'Content-Type': 'application/octet-stream',
            },
        });

        // Step 5: Get the file's URL (webUrl) from the OneDrive response
        const avatarUrl = response.data.webUrl;

        // Step 6: Update the student's avatar URL in the database
        await model.Student.update(
            { avatar: avatarUrl },  // Save the avatar URL in the DB
            { where: { student_id } }
        );

        return { message: 'Avatar uploaded successfully', avatarUrl };
    } catch (error) {
        throw new Error('Error uploading avatar to OneDrive: ' + error.message);
    }
};
