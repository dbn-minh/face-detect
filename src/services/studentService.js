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
            include: [
                {
                    model: model.Student,
                    as: 'student',
                    attributes: ['name', 'avatar'],
                }
            ]
        });

        return {
            student_id: studentParentRecord.student_id,
            name: studentParentRecord.student.name,
            avatar: studentParentRecord.student.avatar,
        }

    } catch (error) {
        throw new Error('Error fetching student by parent: ' + error.message);
    }
};
export const saveAvatarPathToDatabase = async (parent_id, fileUrl) => {
    try {
        const student_id = await getStudentIdByParentId(parent_id);

        await model.Student.update(
            { avatar: fileUrl }, // Lưu URL vào cột avatar
            { where: ( student_id ) }
        );

        return { message: 'Avatar path saved successfully', fileUrl };
    } catch (error) {
        throw new Error('Error saving avatar path to database: ' + error.message);
    }
};

