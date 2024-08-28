import initModels from "../models/init-models.js";
import sequelize from "../config/database.js";
let model = initModels(sequelize);
import bcrypt from 'bcrypt';
import { Op } from 'sequelize';

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
            attributes: ['notification_id', 'time_stamp', 'message', 'image']
        });

        return { error: null, data: notifications };
    } catch (error) {
        console.error("Error fetching notifications:", error);
        return { error: "An error occurred while fetching notifications", data: null };
    }
};

export const getParentProfileById = async (parent_id) => {
    try {
        const parentProfile = await model.Parent.findOne({
            where: { parent_id },
            include: [{
                model: model.User,
                as: 'user',
            }]
        });

        if (!parentProfile) {
            return { error: "Parent not found", data: null };
        }

        return { error: null, data: parentProfile.toJSON() };
    } catch (error) {
        console.error("Error fetching parent profile:", error);
        return { error: "An error occurred while fetching the parent profile", data: null };
    }
};

export const updateParentProfileById = async (parent_id, updatedParentData) => {
    try {
        const { address, name, phone_number, email, password } = updatedParentData;

        // Find the parent profile by ID
        const parentProfile = await model.Parent.findOne({
            where: { parent_id },
            include: [{
                model: model.User,
                as: 'user',
            }]
        });

        if (!parentProfile) {
            return { error: "Parent not found", data: null };
        }

        // Hash the new password if it's provided
        let hashedPassword;
        if (password) {
            hashedPassword = await bcrypt.hash(password, 10);
        }

        // Update the User table with the provided user-related attributes, including the password
        const updatedUser = await parentProfile.user.update({
            name: name || parentProfile.user.name,
            phone_number: phone_number || parentProfile.user.phone_number,
            email: email || parentProfile.user.email,
            password: hashedPassword || parentProfile.user.password,
        });

        // Update the Parent table with the provided parent-related attributes
        await parentProfile.update({
            address: address || parentProfile.address,
        });

        // Return the updated profile
        return { error: null, data: { ...parentProfile.toJSON(), user: updatedUser.toJSON() } };
    } catch (error) {
        console.error("Error updating parent profile:", error);
        return { error: "An error occurred while updating the parent profile", data: null };
    }
};
export const registerStudent = async (parent_id, studentData) => {
    try {
        const { name, class_name, avatar, feature_vector } = studentData;

        // Check if the parent_id exists in the Parent table
        const parent = await model.Parent.findOne({ where: { parent_id } });

        if (!parent) {
            return { error: "Parent not found", data: null };
        }

        // Create a new student with teacher_id as NULL
        const newStudent = await model.Student.create({
            name,
            teacher_id: null, // Leaving teacher_id empty
            class: class_name,
            parent_id,
            avatar: avatar || null,
            feature_vector: feature_vector || null,
        });

        return { error: null, data: newStudent.toJSON() };
    } catch (error) {
        console.error("Error registering student:", error);
        return { error: "An error occurred while registering the student", data: null };
    }
};

// current_location of the relevant driver_id, current Journey included
export const getDriverLocationsByParentId = async (parent_id) => {
    try {
        console.log(`Service Start: Fetching driver locations for parent_id: ${parent_id}`);

        // Step 1: Get all student IDs associated with the parent
        const { error: studentError, data: student_ids } = await getStudentIDsByParentID(parent_id);
        console.log(`Step 1: Retrieved student_ids: ${JSON.stringify(student_ids)}`);

        if (studentError || student_ids.length === 0) {
            console.log("No students found or an error occurred while fetching students.");
            return { error: "No students found for this parent", data: null };
        }

        // Step 2: Get the unique ongoing journey ID for each student
        const journeys = await model.Attendance.findAll({
            where: {
                student_id: student_ids,
            },
            attributes: ['journey_id'],
            include: [{
                model: model.Journey,
                as: 'journey',
                where: {
                    end_time: { [Op.is]: null },
                },
                attributes: ['journey_id'],
                required: true // Ensures that only attendance with an ongoing journey is fetched
            }],
            group: ['journey_id'] // Group by journey_id to ensure uniqueness
        });

        const journey_ids = journeys.map(journey => journey.journey_id);
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

