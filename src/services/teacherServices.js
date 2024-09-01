import initModels from "../models/init-models.js";
import sequelize from "../config/database.js";
import {Op} from "sequelize";
let model = initModels(sequelize);
export const getStudentsByTeacherIdService = async (teacher_id) => {
    try {
        // Fetch students    associated with the teacher_id
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

// Service to get student IDs associated with a teacher
export const getStudentIDsByTeacherID = async (teacher_id) => {
    try {
        const students = await model.Student.findAll({
            where: { teacher_id: teacher_id },
            attributes: ['student_id']
        });

        const student_ids = students.map(student => student.student_id);
        return { error: null, data: student_ids };
    } catch (error) {
        console.error("Error fetching student IDs:", error);
        return { error: "An error occurred while fetching student IDs", data: null };
    }
};

// Service to get driver locations based on teacher ID
export const getDriverLocationsByTeacherId = async (teacher_id) => {
    try {
        console.log(`Service Start: Fetching driver locations for teacher_id: ${teacher_id}`);

        // Step 1: Get all student IDs associated with the teacher
        const { error: studentError, data: student_ids } = await getStudentIDsByTeacherID(teacher_id);
        console.log(`Step 1: Retrieved student_ids: ${JSON.stringify(student_ids)}`);

        if (studentError || student_ids.length === 0) {
            console.log("No students found or an error occurred while fetching students.");
            return { error: "No students found for this teacher", data: null };
        }

        // Step 2: Get the unique ongoing journey ID for each student by checking the `end_time` in the `Journey` table
        const journeys = await model.Attendance.findAll({
            where: {
                student_id: student_ids,
            },
            attributes: ['journey_id'],
            include: [{
                model: model.Journey,
                as: 'journey',
                where: {
                    end_time: { [Op.is]: null }, // Filter by `end_time` being `null`
                },
                attributes: ['journey_id'],
                required: true // Ensures that only attendance with an ongoing journey is fetched
            }],
        });

        const journey_ids = journeys.map(journey => journey.journey.journey_id);
        console.log(`Step 2: Retrieved current unique journey_ids: ${JSON.stringify(journey_ids)}`);

        if (journey_ids.length === 0) {
            console.log("No current journeys found for these attendance records.");
            return { error: "No current journeys found for these attendance records", data: null };
        }

        // Step 3: Find the driver locations for the current journeys
        const drivers = await model.Journey.findAll({
            where: { journey_id: journey_ids },
            attributes: ['driver_id'],
            include: [{
                model: model.Driver,
                as: 'driver',
                attributes: ['current_location'],
            }]
        });
        console.log(`Step 3: Retrieved driver locations for current journeys: ${JSON.stringify(drivers)}`);

        if (drivers.length === 0) {
            console.log("No drivers found for the current journeys.");
            return { error: "No drivers found for the current journeys", data: null };
        }

        // Step 4: Extract the current locations of all relevant drivers
        const locations = drivers.map(driver => driver.driver.current_location);
        console.log(`Step 4: Final driver locations to return: ${JSON.stringify(locations)}`);

        return { error: null, data: locations };
    } catch (error) {
        console.error("Error fetching driver locations:", error);
        return { error: "Failed to retrieve bus tracking information", data: null };
    }
};
