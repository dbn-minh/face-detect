import initModels from "../models/init-models.js";
import sequelize from "../config/database.js";
let model = initModels(sequelize);
export const getStudentsByTeacherIdService = async (teacher_id) => {
    try {
        // Fetch students associated with the teacher_id
        const students = await model.Student.findAll({
            where: { teacher_id },
            attributes: ['student_id', 'name', 'class', 'avatar', 'feature_vector', 'parent_id']
        });

        if (!students || students.length === 0) {
            return { error: "No students found for the given teacher_id", data: null };
        }

        // Extract parent_ids from the students
        const parentIds = students.map(student => student.parent_id);

        // Fetch parent information based on parent_ids
        const parents = await model.Parent.findAll({
            where: { parent_id: parentIds },
            attributes: ['parent_id', 'address'],
            include: [{
                model: model.User,
                as: 'user',
                attributes: ['name', 'email', 'phone_number']
            }]
        });

        // Convert parents array to a dictionary for easy lookup
        const parentMap = {};
        parents.forEach(parent => {
            parentMap[parent.parent_id] = parent;
        });

        // Combine students with their parent information
        const result = students.map(student => {
            const studentData = student.toJSON();
            studentData.parent = parentMap[student.parent_id] || null;
            return studentData;
        });

        return { error: null, data: result };
    } catch (error) {
        console.error("Error fetching students by teacher_id:", error);
        return { error: "An error occurred while fetching students", data: null };
    }
};

export const getTeacherNotifications = async (teacher_id) => {
    try {
        // Step 1: Get student IDs for the teacher
        const students = await model.Student.findAll({
            where: { teacher_id: teacher_id },
            attributes: ['student_id']
        });

        if (students.length === 0) {
            return { error: "No students found for this teacher", data: null };
        }

        const student_ids = students.map(student => student.student_id);

        // Step 2: Get attendance IDs for those students
        const attendances = await model.Attendance.findAll({
            where: { student_id: student_ids },
            attributes: ['attendance_id']
        });

        if (attendances.length === 0) {
            return { error: "No attendance records found for these students", data: null };
        }

        const attendance_ids = attendances.map(attendance => attendance.attendance_id);

        // Step 3: Get notifications linked to those attendance records
        const notifications = await model.Notification.findAll({
            where: { attendance_id: attendance_ids },
            attributes: ['notification_id', 'time_stamp', 'message', 'image']
        });

        if (notifications.length === 0) {
            return { error: "No notifications found for this teacher", data: null };
        }

        return { error: null, data: notifications };
    } catch (error) {
        console.error("Error fetching notifications:", error);
        return { error: "An error occurred while fetching notifications", data: null };
    }
};
export const getTeacherProfile = async (teacher_id) => {
    try {
        const teacher = await model.Teacher.findOne({
            where: { teacher_id },
            attributes: ['teacher_id', 'department'],
            include: [
                {
                    model: model.User,
                    as: 'user', // Ensure this matches the alias used in your associations
                    attributes: ['user_id', 'name', 'email', 'phone_number', 'role_id']
                }
            ]
        });

        if (!teacher) {
            return { error: "Teacher not found", data: null };
        }

        return { error: null, data: teacher.toJSON() };
    } catch (error) {
        console.error("Error fetching teacher profile:", error);
        return { error: "An error occurred while fetching the teacher profile", data: null };
    }
};

export const updateTeacherProfile = async (teacher_id, userData, department) => {
    try {
        // Fetch the teacher's user_id
        const teacher = await model.Teacher.findOne({
            where: { teacher_id },
            attributes: ['user_id']
        });

        if (!teacher) {
            return { error: "Teacher not found", data: null };
        }

        const user_id = teacher.user_id;

        // Update the User information
        const userUpdate = await model.User.update(userData, {
            where: { user_id },
            returning: true
        });

        // Update the Teacher information
        const teacherUpdate = await model.Teacher.update(
            { department },
            { where: { teacher_id }, returning: true }
        );

        if (userUpdate[0] === 0 || teacherUpdate[0] === 0) {
            return { error: "Failed to update teacher profile", data: null };
        }

        // Fetch the updated teacher profile
        const updatedProfile = await getTeacherProfile(teacher_id);
        return { error: null, data: updatedProfile.data };
    } catch (error) {
        console.error("Error updating teacher profile:", error);
        return { error: "An error occurred while updating the teacher profile", data: null };
    }
};