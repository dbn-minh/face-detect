import initModels from "../models/init-models.js";
import sequelize from "../config/database.js";
let model = initModels(sequelize);
export default class ParentController {
    static async getParentDetails(req, res) {
        const parentID = req.params.parentID;

        try {
            // Step 1: Get Students for the parent
            const students = await model.Student.findAll({
                where: { parentID: parentID },
                attributes: ['studentID', 'name', 'class', 'avatar']
            });

            if (!students || students.length === 0) {
                return res.status(404).json({ message: "No students found for this parent" });
            }

            // Step 2: Get Teacher details for each student
            const studentDetailsWithTeachers = await Promise.all(students.map(async (student) => {
                const teacher = await model.Teacher.findOne({
                    where: { teacherID: student.teacherID },
                    attributes: ['teacherID', 'department'],
                    include: [{
                        model: User,
                        as: 'user',
                        attributes: ['name', 'email', 'phoneNumber']
                    }]
                });

                return {
                    ...student.toJSON(),
                    teacher: teacher ? teacher.toJSON() : null
                };
            }));

            // Return the data
            res.status(200).json(studentDetailsWithTeachers);

        } catch (error) {
            console.error("Error fetching students and teacher details:", error);
            res.status(500).json({ message: "An error occurred while fetching student and teacher details" });
        }
    }

    static async getNotifications(req, res) {
        const parentID = req.params.id;

        try {
            // Step 1: Find all students associated with the parentID
            const students = await model.Student.findAll({
                where: { parentID: parentID },
                attributes: ['studentID']  // Only need the studentID for the next step
            });

            // Extract the student IDs
            const studentIDs = students.map(student => student.studentID);

            if (studentIDs.length === 0) {
                return res.status(404).json({ message: "No students found for this parent" });
            }

            // Step 2: Find all attendance records for those students
            const attendances = await model.Attendance.findAll({
                where: { studentID: studentIDs },
                attributes: ['attendanceID']  // Only need the attendanceID for the next step
            });

            // Extract the attendance IDs
            const attendanceIDs = attendances.map(attendance => attendance.attendanceID);

            if (attendanceIDs.length === 0) {
                return res.status(404).json({ message: "No attendance records found for these students" });
            }

            // Step 3: Find all notifications linked to those attendance records
            const notifications = await Notification.findAll({
                where: { attendanceID: attendanceIDs },
                attributes: ['notificationID', 'timeStamp', 'message', 'image']
            });

            if (notifications.length === 0) {
                return res.status(404).json({ message: "No notifications found for this parent" });
            }

            // Return the notifications
            res.status(200).json(notifications);

        } catch (error) {
            console.error("Error fetching notifications:", error);
            res.status(500).json({ message: "An error occurred while fetching notifications" });
        }
    }

    static async postNotification(req, res) {
        const { attendanceID, message, image } = req.body;

        try {
            // Ensure the attendanceID exists
            const attendance = await model.Attendance.findOne({
                where: { attendanceID: attendanceID }
            });

            if (!attendance) {
                return res.status(404).json({ message: "Attendance record not found" });
            }

            // Create the notification
            const newNotification = await Notification.create({
                attendanceID: attendanceID,
                timeStamp: new Date(),  // Use the current time for the timestamp
                message: message,
                image: image  // Assuming the image is already base64 encoded
            });

            // Return the newly created notification
            res.status(201).json(newNotification);

        } catch (error) {
            console.error("Error creating notification:", error);
            res.status(500).json({ message: "An error occurred while creating the notification" });
        }
    }

    static async getBusTracking(req, res) {
        // Function to get bus tracking info
    }

    static async getParentProfile(req, res) {
        const parentID = req.params.parent_id;

        try {
            // Step 1: Find the parent using the parentID
            const parent = await model.Parent.findOne({
                where: { parentID: parentID },
                include: [{
                    model: User,
                    as: 'user',  // This matches the alias used in your model associations
                    attributes: ['name', 'phoneNumber', 'email']  // Selecting specific attributes from the User model
                }],
                attributes: ['parentID', 'address']  // Selecting specific attributes from the Parent model
            });

            if (!parent) {
                return res.status(404).json({ message: "Parent not found" });
            }

            // Return the parent's profile
            res.status(200).json(parent);

        } catch (error) {
            console.error("Error fetching parent profile:", error);
            res.status(500).json({ message: "An error occurred while fetching the parent profile" });
        }
    }

    static async updateParentProfile(req, res) {
        const parentID = req.params.parent_id;
        const { name, phoneNumber, email, address } = req.body;

        try {
            // Step 1: Find the existing parent and associated user
            const parent = await model.Parent.findOne({
                where: { parentID: parentID },
                include: [{
                    model: User,
                    as: 'user'
                }]
            });

            if (!parent) {
                return res.status(404).json({ message: "Parent not found" });
            }

            // Step 2: Update the user and parent profile
            await parent.user.update({
                name: name,
                phoneNumber: phoneNumber,
                email: email
            });

            await parent.update({
                address: address
            });

            // Return the updated profile
            res.status(200).json({ message: "Parent profile updated successfully" });

        } catch (error) {
            console.error("Error updating parent profile:", error);
            res.status(500).json({ message: "An error occurred while updating the parent profile" });
        }
    }

    static async createParentProfile(req, res) {
        const parentID = req.params.parent_id;
        const { name, phoneNumber, email, address } = req.body;

        try {
            // Step 1: Check if the parent already exists
            const existingParent = await model.Parent.findOne({
                where: { parentID: parentID }
            });

            if (existingParent) {
                return res.status(400).json({ message: "Parent profile already exists" });
            }

            // Step 2: Create a new user (if needed) and parent profile
            const newUser = await model.User.create({
                name,
                phoneNumber,
                email,
                roleID: 1  // Assuming '1' is the roleID for 'Parent'
            });

            const newParent = await model.Parent.create({
                parentID: parentID,
                address: address,
                userID: newUser.userID
            });

            // Return the created parent profile
            res.status(201).json(newParent);

        } catch (error) {
            console.error("Error creating parent profile:", error);
            res.status(500).json({ message: "An error occurred while creating the parent profile" });
        }
    }

    static async registerStudent(req, res) {
        const { parentID, name, class: studentClass, avatar, featureVector } = req.body;

        try {
            // Step 1: Check if the parent exists
            const parent = await model.Parent.findOne({
                where: { parentID: parentID }
            });

            if (!parent) {
                return res.status(404).json({ message: "Parent not found" });
            }

            // Step 2: Create a new student without specifying teacherID
            const newStudent = await model.Student.create({
                name: name,
                class: studentClass,
                parentID: parentID,
                avatar: avatar,
                featureVector: featureVector,
                teacherID: null  // Make sure allow null
            });

            // Return the newly created student record
            res.status(201).json(newStudent);

        } catch (error) {
            console.error("Error registering student:", error);
            res.status(500).json({ message: "An error occurred while registering the student" });
        }
    }
}
