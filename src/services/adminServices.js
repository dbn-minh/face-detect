import initModels from "../models/init-models.js";
import sequelize from "../config/database.js";
import { Sequelize } from 'sequelize';

let model = initModels(sequelize);

export const getAdminDetails = async () => {
    try {
        // Step 1: Fetch all students
        const students = await model.Student.findAll();

        if (!students.length) {
            return { error: "No students found", data: null };
        }

        // Step 2: Fetch parent details for each student
        const parentIds = students.map(student => student.parent_id);
        const parents = await model.Parent.findAll({
            where: { parent_id: parentIds },
            include: [{
                model: model.User,
                as: 'user',
                attributes: ['name', 'email', 'phone_number']
            }]
        });

        // Step 3: Fetch teacher details for each student
        const teacherIds = students.map(student => student.teacher_id).filter(id => id !== null);
        const teachers = await model.Teacher.findAll({
            where: { teacher_id: teacherIds },
            include: [{
                model: model.User,
                as: 'user',
                attributes: ['name', 'email', 'phone_number']
            }]
        });

        // Step 4: Combine the results
        const studentDetails = students.map(student => {
            const parent = parents.find(p => p.parent_id === student.parent_id);
            const teacher = teachers.find(t => t.teacher_id === student.teacher_id);

            return {
                student_id: student.student_id,
                student_name: student.name,
                class: student.class,
                avatar: student.avatar,
                feature_vector: student.feature_vector,
                parent: parent ? {
                    parent_id: parent.parent_id,
                    parent_name: parent.user.name,
                    parent_email: parent.user.email,
                    parent_phone_number: parent.user.phone_number,
                    address: parent.address
                } : null,
                teacher: teacher ? {
                    teacher_id: teacher.teacher_id,
                    teacher_name: teacher.user.name,
                    teacher_email: teacher.user.email,
                    teacher_phone_number: teacher.user.phone_number,
                    department: teacher.department
                } : null
            };
        });

        return { error: null, data: studentDetails };
    } catch (error) {
        console.error("Error fetching student details:", error);
        return { error: "An error occurred while fetching student details", data: null };
    }
};
// Service to get all student IDs
export const getAllStudentIDs = async () => {
    try {
        const students = await model.Student.findAll({
            attributes: ['student_id']
        });

        const student_ids = students.map(student => student.student_id);
        return { error: null, data: student_ids };
    } catch (error) {
        console.error("Error fetching student IDs:", error);
        return { error: "An error occurred while fetching student IDs", data: null };
    }
};

// Service to get attendance IDs associated with student IDs
export const getAttendanceIDsByStudentIDs = async (student_ids) => {
    try {
        const attendances = await model.Attendance.findAll({
            where: { student_id: student_ids },
            attributes: ['attendance_id']
        });

        const attendance_ids = attendances.map(attendance => attendance.attendance_id);
        return { error: null, data: attendance_ids };
    } catch (error) {
        console.error("Error fetching attendance IDs:", error);
        return { error: "An error occurred while fetching attendance IDs", data: null };
    }
};

// Service to get notifications associated with attendance IDs
export const getNotificationsByAttendanceIDs = async (attendance_ids) => {
    try {
        const notifications = await model.Notification.findAll({
            where: { attendance_id: attendance_ids },
            attributes: ['notification_id', 'time_stamp', 'message', 'image']
        });

        return { error: null, data: notifications };
    } catch (error) {
        console.error("Error fetching notifications:", error);
        return { error: "An error occurred while fetching notifications", data: null };
    }
};
// Service to fetch the admin profile by user ID
export const getAdminProfileById = async (user_id) => {
    try {
        // Fetch admin profile from the User table
        const admin = await model.User.findOne({
            where: { user_id },
            attributes: ['user_id', 'name', 'email', 'phone_number', 'role_id'],
            include: [{
                model: model.Role,
                attributes: ['role_name']
            }]
        });

        if (!admin) {
            return { error: "Admin not found", data: null };
        }

        return { error: null, data: admin.toJSON() };
    } catch (error) {
        console.error("Error fetching admin profile:", error);
        return { error: "An error occurred while fetching the admin profile", data: null };
    }
};