import initModels from "../models/init-models.js";
import sequelize from "../config/database.js";
let model = initModels(sequelize);

// Service to get detailed student information associated with a parent
// Function to get students by parent ID
export const getStudentsOfParent = async (parent_id) => {
    try {
        // Get Students for the parent
        const students = await model.Student.findAll({
            where: { parent_id: parent_id },
            attributes: ['student_id', 'name', 'class', 'avatar', 'teacher_id']
        });

        if (!students || students.length === 0) {
            return { error: "No students found for this parent", data: null };
        }

        return { error: null, data: students };

    } catch (error) {
        console.error("Error fetching students:", error);
        return { error: "An error occurred while fetching students", data: null };
    }
};

// Function to get detailed student information, including the teacher
export const getStudentDetailsWithTeacher = async (students) => {
    try {
        // Get Teacher details for each student
        const studentDetailsWithTeachers = await Promise.all(students.map(async (student) => {
            const teacher = await model.Teacher.findOne({
                where: { teacher_id: student.teacher_id },
                attributes: ['teacher_id', 'department'],
                include: [{
                    model: model.User,
                    as: 'user',
                    attributes: ['name', 'email', 'phone_number']
                }]
            });

            return {
                ...student.toJSON(),
                teacher: teacher ? teacher.toJSON() : null
            };
        }));

        return { error: null, data: studentDetailsWithTeachers };

    } catch (error) {
        console.error("Error fetching student details with teacher:", error);
        return { error: "An error occurred while fetching student details with teacher", data: null };
    }
};

// Service to get student IDs associated with a parent
export const getStudentIDsByParentID = async (parent_id) => {
    try {
        const students = await model.Student.findAll({
            where: { parent_id: parent_id },
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
            attributes: ['notification_id', 'timeStamp', 'message', 'image']
        });

        return { error: null, data: notifications };
    } catch (error) {
        console.error("Error fetching notifications:", error);
        return { error: "An error occurred while fetching notifications", data: null };
    }
};