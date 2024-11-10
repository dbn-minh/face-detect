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
                    attributes: ['name'],
                }
            ]
        });

        return {
            student_id: studentParentRecord.student_id,
            name: studentParentRecord.student.name,
        }

    } catch (error) {
        throw new Error('Error fetching student by parent: ' + error.message);
    }
};
export const saveAvatarPathToDatabase = async (parent_id, fileName ) => {
    try {
        const student = await getStudentIdByParentId(parent_id);

        await model.Student.update(
            { avatar: fileName  },
            { where: { student_id: student.student_id } }
        );

        return { fileName, student  };
    } catch (error) {
        throw new Error('Error saving avatar path to database: ' + error.message);
    }
};
