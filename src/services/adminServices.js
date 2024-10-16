import initModels from "../models/init-models.js";
import sequelize from "../config/database.js";
import bcrypt from "bcrypt";
import {
  createRefToken,
  createToken,
} from "../config/jwt.js";
import {Op} from "sequelize";
import { v4 as uuidv4 } from 'uuid';
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
export const getAllUsersWithRoleDetails = async () => {
    try {
        // Fetch all users with their role information
        const users = await model.User.findAll({
            attributes: ['user_id', 'name', 'phone_number', 'email', 'role_id'],
            include: [{
                model: model.Role,
                as: 'role',
                attributes: ['role_name']
            }]
        });

        if (!users || users.length === 0) {
            return { error: "No users found", data: null };
        }

        // Process each user and fetch role-specific details
        const userDetails = await Promise.all(users.map(async (user) => {
            const userData = user.toJSON();

            // Fetch role-specific details based on role_id
            if (user.role_id === 1) { // Parent
                const parentDetails = await model.Parent.findOne({
                    where: { user_id: user.user_id },
                    attributes: ['address']
                });
                userData.role_details = parentDetails ? parentDetails.toJSON() : null;
            } else if (user.role_id === 2) { // Driver
                const driverDetails = await model.Driver.findOne({
                    where: { user_id: user.user_id },
                    attributes: ['license_number']
                });
                userData.role_details = driverDetails ? driverDetails.toJSON() : null;
            } else if (user.role_id === 3) { // Teacher
                const teacherDetails = await model.Teacher.findOne({
                    where: { user_id: user.user_id },
                    attributes: ['department']
                });
                userData.role_details = teacherDetails ? teacherDetails.toJSON() : null;
            }

            return userData;
        }));

        return { error: null, data: userDetails };
    } catch (error) {
        console.error("Error fetching users with role details:", error);
        return { error: "An error occurred while fetching users", data: null };
    }
};
export const adminCreateUserService = async (role_id, name, phone_number, email, password, other) => {
  try {
    let check_user = await model.User.findOne({
      where: { email },
    });

    if (check_user) {
      return { error: "Email exists, use another email", status: 400 };
    }

    let hashedPassword = bcrypt.hashSync(password, 10);
    let newUser = await model.User.create({
      role_id,
      name,
      phone_number,
      email,
      password: hashedPassword,
    });

    switch (role_id) {
      case 1: // Parent
        await model.Parent.create({
          address: other,
          user_id: newUser.user_id,
        });
        break;
      case 2: // Driver
        await model.Driver.create({
          license_number: other,
          user_id: newUser.user_id,
        });
        break;
      case 3: // Teacher
        await model.Teacher.create({
          department: other,
          user_id: newUser.user_id,
        });
        break;
      case 4: // Admin
        // No additional action needed unless there's admin-specific info
        break;
    }

    // Generate token for the new user (optional, depending on your use case)
    let key = new Date().getTime();
    let token = createToken({ user_id: newUser.user_id, key });
    let ref_token = createRefToken({ user_id: newUser.user_id, key });

    // Save refresh token
    await model.User.update(
      { refresh_token: ref_token },
      {
        where: { user_id: newUser.user_id },
      }
    );

    return { data: { newUser, token }, status: 200 };
  } catch (error) {
    console.error(error);
    return { error: "Error creating user", status: 500 };
  }
};
export const adminUpdateUserService = async (user_id, role_id, name, phone_number, email, password, other) => {
  try {
    // Fetch the user by user_id
    let user = await model.User.findOne({
      where: { user_id },
    });

    if (!user) {
      return { error: "User not found", status: 404 };
    }

    // Update user details
    let updatedData = {
      role_id,
      name,
      phone_number,
      email,
    };

    // If the password is provided, hash it
    if (password) {
      updatedData.password = bcrypt.hashSync(password, 10);
    }

    await model.User.update(updatedData, {
      where: { user_id },
    });

    // Update role-specific details
    switch (role_id) {
      case 1: // Parent
        await model.Parent.update(
          { address: other },
          { where: { user_id } }
        );
        break;
      case 2: // Driver
        await model.Driver.update(
          { license_number: other },
          { where: { user_id } }
        );
        break;
      case 3: // Teacher
        await model.Teacher.update(
          { department: other },
          { where: { user_id } }
        );
        break;
    }

    return { data: "User updated successfully", status: 200 };
  } catch (error) {
    console.error(error);
    return { error: "Error updating user", status: 500 };
  }
};

export const adminDeleteUserService = async (user_id) => {
    try {
        // Fetch the user by user_id
        let user = await model.User.findOne({
            where: { user_id },
        });

        if (!user) {
            return { error: "User not found", status: 404 };
        }

        // Determine the role of the user
        const role_id = user.role_id;

        // Delete role-specific details
        switch (role_id) {
            case 1: // Parent
                await model.Parent.destroy({
                    where: { user_id }
                });
                break;
            case 2: // Driver
                await model.Driver.destroy({
                    where: { user_id }
                });
                break;
            case 3: // Teacher
                await model.Teacher.destroy({
                    where: { user_id }
                });
                break;
        }

        // Delete the user record from the User table
        await model.User.destroy({
            where: { user_id }
        });

        return { data: "User deleted successfully", status: 200 };
    } catch (error) {
        console.error("Error deleting user:", error);
        return { error: "Error deleting user", status: 500 };
    }
};

export const listPendingRegistrationsService = async () => {
    try {
        // Fetch all students with teacher_id as null
        const pendingRegistrations = await model.Student.findAll({
            where: { teacher_id: null },
            attributes: ['student_id', 'name', 'class', 'parent_id', 'avatar', 'feature_vector'],
            include: [{
                model: model.Parent,
                as: 'parent',
                attributes: ['parent_id', 'user_id'],
                include: [{
                    model: model.User,
                    as: 'user',
                    attributes: ['name', 'email', 'phone_number']
                }]
            }]
        });

        if (!pendingRegistrations || pendingRegistrations.length === 0) {
            return { error: "No pending registrations found", data: null };
        }

        return { error: null, data: pendingRegistrations };
    } catch (error) {
        console.error("Error fetching pending registrations:", error);
        return { error: "An error occurred while fetching pending registrations", data: null };
    }
};

export const getAllTeachersService = async () => {
    try {
        const teachers = await model.Teacher.findAll({
            attributes: ['teacher_id', 'department'],
            include: [{
                model: model.User,
                as: 'user',
                attributes: ['name', 'email', 'phone_number']
            }]
        });

        if (!teachers || teachers.length === 0) {
            return { error: "No teachers found", data: null };
        }

        return { error: null, data: teachers };
    } catch (error) {
        console.error("Error fetching teachers:", error);
        return { error: "An error occurred while fetching teachers", data: null };
    }
};
export const assignTeacherToStudentsService = async (teacher_id, student_ids) => {
    try {
        // Check if the teacher exists
        const teacher = await model.Teacher.findOne({
            where: { teacher_id }
        });
        if (!teacher) {
            return { error: "Teacher not found", data: null };
        }

        // Fetch the teacher's user details separately
        const teacherUser = await model.User.findOne({
            where: { user_id: teacher.user_id },
            attributes: ['name', 'email', 'phone_number']
        });

        // Update students with the provided teacher_id
        await model.Student.update(
            { teacher_id },
            { where: { student_id: student_ids, teacher_id: null } } // Only update students with null teacher_id
        );

        // Fetch the updated student details
        const students = await model.Student.findAll({
            where: { student_id: student_ids },
            attributes: ['student_id', 'name', 'class', 'parent_id']
        });

        // Fetch the parent user details for each student
        const studentDetails = await Promise.all(
            students.map(async (student) => {
                const parent = await model.Parent.findOne({ where: { parent_id: student.parent_id } });
                const parentUser = await model.User.findOne({
                    where: { user_id: parent.user_id },
                    attributes: ['name', 'email', 'phone_number']
                });

                return {
                    student_id: student.student_id,
                    name: student.name,
                    class: student.class,
                    parent: {
                        address: parent.address,
                        user: parentUser
                    }
                };
            })
        );

        return {
            error: null,
            data: {
                teacher: {
                    teacher_id: teacher.teacher_id,
                    department: teacher.department,
                    user: teacherUser
                },
                students: studentDetails
            }
        };
    } catch (error) {
        console.error("Error assigning teacher:", error);
        return { error: "An error occurred while assigning the teacher", data: null };
    }
};

export const updateStudentInfoService = async (student_id, updateData) => {
    try {
        // Fetch the student record
        const student = await model.Student.findOne({
            where: { student_id }
        });

        if (!student) {
            return { error: "Student not found", data: null };
        }

        // Update student information
        const updatedStudent = await student.update(updateData);

        // If teacher_id is updated, fetch the new teacher's information
        let teacherInfo = null;
        if (updateData.teacher_id) {
            const teacher = await model.Teacher.findOne({
                where: { teacher_id: updateData.teacher_id }
            });
            if (teacher) {
                const teacherUser = await model.User.findOne({
                    where: { user_id: teacher.user_id },
                    attributes: ['name', 'email', 'phone_number']
                });
                teacherInfo = {
                    teacher_id: teacher.teacher_id,
                    department: teacher.department,
                    user: teacherUser
                };
            }
        }

        return {
            error: null,
            data: {
                student: updatedStudent.toJSON(),
                teacher: teacherInfo
            }
        };
    } catch (error) {
        console.error("Error updating student information:", error);
        return { error: "An error occurred while updating the student information", data: null };
    }
};
export const getAllCurrentJourneysWithLocationsStudentsAndTeachers = async () => {
    try {
        // Step 1: Fetch all current journeys (where `end_time` is null) and associated driver information
        const currentJourneys = await model.Journey.findAll({
            where: { end_time: { [Op.is]: null } },
            attributes: ['journey_id', 'driver_id'],
            include: [
                {
                    model: model.Driver,
                    as: 'driver',
                    attributes: ['current_location'],
                }
            ],
        });

        if (!currentJourneys || currentJourneys.length === 0) {
            return { error: "No current journeys found", data: null };
        }

        // Step 2: Initialize an array to hold the detailed journey information
        const journeyDetails = [];

        // Step 3: Iterate over each journey and fetch related attendances
        for (const journey of currentJourneys) {
            const attendances = await model.Attendance.findAll({
                where: { journey_id: journey.journey_id },
                attributes: ['student_id', 'boarded', 'alighted']
            });

            // Step 4: For each attendance, fetch the student, parent, and teacher details
            const students = [];
            for (const attendance of attendances) {
                const student = await model.Student.findOne({
                    where: { student_id: attendance.student_id },
                    attributes: ['student_id', 'name', 'class', 'parent_id', 'teacher_id'],
                    include: [
                        {
                            model: model.Parent,
                            as: 'parent',
                            attributes: ['parent_id'],
                            include: [{
                                model: model.User,
                                as: 'user',
                                attributes: ['name', 'email', 'phone_number']
                            }]
                        },
                        {
                            model: model.Teacher,
                            as: 'teacher',
                            attributes: ['teacher_id', 'department'],
                            include: [{
                                model: model.User,
                                as: 'user',
                                attributes: ['name', 'email', 'phone_number']
                            }]
                        }
                    ]
                });

                // Push the detailed student information to the students array
                students.push({
                    student_id: student.student_id,
                    student_name: student.name,
                    class: student.class,
                    parent: {
                        parent_id: student.parent.parent_id,
                        parent_name: student.parent.user.name,
                        parent_email: student.parent.user.email,
                        parent_phone_number: student.parent.user.phone_number
                    },
                    teacher: student.teacher ? {
                        teacher_id: student.teacher.teacher_id,
                        teacher_name: student.teacher.user.name,
                        teacher_email: student.teacher.user.email,
                        teacher_phone_number: student.teacher.user.phone_number,
                        department: student.teacher.department
                    } : null,
                    boarded: attendance.boarded,
                    alighted: attendance.alighted
                });
            }

            // Combine journey and student details
            journeyDetails.push({
                journey_id: journey.journey_id,
                driver_id: journey.driver_id,
                current_location: journey.driver.current_location,
                students: students
            });
        }

        return { error: null, data: journeyDetails };
    } catch (error) {
        console.error("Error fetching current journeys with locations, students, and teachers:", error);
        return { error: "An error occurred while fetching journey details", data: null };
    }
};

export default class service {
    // Main services
    static async getNotifications() {
        try {
            // Logic for fetching notifications
        } catch (error) {
            throw new Error('Error fetching notifications: ' + error.message);
        }
    }

    static async getDashboard() {
        try {
            // Logic for fetching dashboard data
        } catch (error) {
            throw new Error('Error fetching dashboard: ' + error.message);
        }
    }

    static async getSetting() {
        try {
            // Logic for fetching setting data
        } catch (error) {
            throw new Error('Error fetching settings: ' + error.message);
        }
    }

    static async getReport() {
        try {
            // Logic for fetching report data
        } catch (error) {
            throw new Error('Error fetching report: ' + error.message);
        }
    }

    static async updateInfo(info) {
        try {
            // Logic for updating info
        } catch (error) {
            throw new Error('Error updating info: ' + error.message);
        }
    }

    // Routes - Buses
    static async getAllRoutes() {
        try {
            return await model.Bus.findAll({
            attributes: ['bus_id', 'license_plate', 'capacity'], // Specify the required fields
            });
        } catch (error) {
            throw new Error('Error fetching routes: ' + error.message);
        }
    }

    static async getBusInfo(bus_id) {
        try {
            const busInfo = await model.Bus.findOne({
                where: { bus_id },
                attributes: ['bus_id', 'license_plate', 'capacity', 'status'],
                include: [
                    {
                        model: model.Student,
                        as: 'Students',
                        attributes: ['student_id', 'name', 'class', 'avatar'],
                        include: [
                            {
                                model: model.Parent,
                                as: 'parent_id_Parents',
                                attributes: ['address'],
                                include: [
                                    {
                                        model: model.User,
                                        as: 'user',
                                        attributes: ['phone_number'],
                                    },
                                ],
                            },
                        ],
                    },
                ],
            });

            // Map and structure the response payload
            return {
                bus_id: busInfo.bus_id,
                capacity: busInfo.capacity,
                license_plate: busInfo.license_plate,
                status: busInfo.status,
                students: busInfo.Students.map((student) => ({
                    student_id: student.student_id,
                    name: student.name,
                    class: student.class,
                    avatar: student.avatar,
                    address: student.parent_id_Parents[0]?.address || null, // Access first parent address safely
                    phone_number: student.parent_id_Parents[0]?.user?.phone_number || null,
                })),
            };
        } catch (error) {
            throw new Error('Error fetching bus info: ' + error.message);
        }
    }


    static async updateBusInfo(bus_id, busData) {
        try {
            // Logic for updating bus info
        } catch (error) {
            throw new Error('Error updating bus info: ' + error.message);
        }
    }

    static async addBus(busData) {
        try {
            // Logic for adding a new bus
        } catch (error) {
            throw new Error('Error adding bus: ' + error.message);
        }
    }

    static async deleteBus(bus_id) {
        try {
            // Logic for deleting a bus by ID
        } catch (error) {
            throw new Error('Error deleting bus: ' + error.message);
        }
    }

    // Drivers
    static async getAllDrivers() {
        try {
            const drivers = await model.Driver.findAll({
                attributes: ['driver_id', 'license_number'],
                include: [
                    {
                        model: model.User,
                        as: 'user',
                        attributes: ['user_id', 'name', 'phone_number', 'email'],
                    },
                ],
            });

            return drivers.map((driver) => ({
                driver_id: driver.driver_id,
                license_number: driver.license_number,
                user_id: driver.user.user_id,
                name: driver.user.name,
                phone_number: driver.user.phone_number,
                email: driver.user.email,
            }));
        } catch (error) {
            throw new Error('Error fetching drivers: ' + error.message);
        }
    }


    static async getDriverInfo(driver_id) {
        try {
            // Logic for fetching driver info by ID
        } catch (error) {
            throw new Error('Error fetching driver info: ' + error.message);
        }
    }

    static async updateDriverInfo(driver_id, driverData) {
        try {
            // Logic for updating driver info
        } catch (error) {
            throw new Error('Error updating driver info: ' + error.message);
        }
    }

    static async addDriver({ name, phone_number, email, license_number }) {
        try {
            // Fetch the role_id for 'Driver'
            const driverRole = await model.Role.findOne({
                where: { role_name: 'Driver' },
                attributes: ['role_id'],
            });

            // Generate and hash the password
            // const generatedPassword = uuidv4().slice(0, 8); // Auto gen random password
            const generatedPassword = '123456789' // Hardcode to 123456789
            const hashedPassword = await bcrypt.hash(generatedPassword, 10);

            // Create a new user
            const newUser = await model.User.create({
                role_id: driverRole.role_id,
                name,
                phone_number,
                email,
                password: hashedPassword,
                refresh_token: null,
            });

            // Create a new driver with the user's ID
            const newDriver = await model.Driver.create({
                user_id: newUser.user_id,
                license_number,
            });

            // Return the driver and user data, including the plain password
            return {
                driver_id: newDriver.driver_id,
                license_number: newDriver.license_number,
                user: {
                    user_id: newUser.user_id,
                    name: newUser.name,
                    phone_number: newUser.phone_number,
                    email: newUser.email,
                    password: generatedPassword, // Plain password for the response
                },
            };
        } catch (e) {
            throw new Error('Error creating driver: ' + e.message);
        }
    }

    static async deleteDriver(driver_id) {
        try {
            // Logic for deleting a driver by ID
        } catch (error) {
            throw new Error('Error deleting driver: ' + error.message);
        }
    }

    // Parents
    static async getAllParents() {
        try {
            // Logic for fetching all parents
        } catch (error) {
            throw new Error('Error fetching parents: ' + error.message);
        }
    }

    static async getParentInfo(parent_id) {
        try {
            // Logic for fetching parent info by ID
        } catch (error) {
            throw new Error('Error fetching parent info: ' + error.message);
        }
    }

    static async updateParentInfo(parent_id, parentData) {
        try {
            // Logic for updating parent info
        } catch (error) {
            throw new Error('Error updating parent info: ' + error.message);
        }
    }

    static async addParent(parentData) {
        try {
            // Logic for adding a new parent
        } catch (error) {
            throw new Error('Error adding parent: ' + error.message);
        }
    }

    static async deleteParent(parent_id) {
        try {
            // Logic for deleting a parent by ID
        } catch (error) {
            throw new Error('Error deleting parent: ' + error.message);
        }
    }

    // Teachers
    static async getAllTeachers() {
        try {
            // Logic for fetching all teachers
        } catch (error) {
            throw new Error('Error fetching teachers: ' + error.message);
        }
    }

    static async getTeacherInfo(teacher_id) {
        try {
            // Logic for fetching teacher info by ID
        } catch (error) {
            throw new Error('Error fetching teacher info: ' + error.message);
        }
    }

    static async updateTeacherInfo(teacher_id, teacherData) {
        try {
            // Logic for updating teacher info
        } catch (error) {
            throw new Error('Error updating teacher info: ' + error.message);
        }
    }

    static async addTeacher(teacherData) {
        try {
            // Logic for adding a new teacher
        } catch (error) {
            throw new Error('Error adding teacher: ' + error.message);
        }
    }

    static async deleteTeacher(teacher_id) {
        try {
            // Logic for deleting a teacher by ID
        } catch (error) {
            throw new Error('Error deleting teacher: ' + error.message);
        }
    }

    // Students
    static async addStudentToBus(bus_id, studentData) {
        try {
            // Logic for adding a student to a bus
        } catch (error) {
            throw new Error('Error adding student to bus: ' + error.message);
        }
    }

    static async getStudentInfo(student_id) {
        try {
            // Logic for fetching student info by ID
        } catch (error) {
            throw new Error('Error fetching student info: ' + error.message);
        }
    }

    static async updateStudentInfo(student_id, studentData) {
        try {
            // Logic for updating student info
        } catch (error) {
            throw new Error('Error updating student info: ' + error.message);
        }
    }

    static async addStudentInfo(student_id, studentData) {
        try {
            // Logic for adding student info
        } catch (error) {
            throw new Error('Error adding student info: ' + error.message);
        }
    }

    static async getAllStudents() {
        try {
            // Logic for fetching all students
        } catch (error) {
            throw new Error('Error fetching students: ' + error.message);
        }
    }

    static async updateStudentRoute(student_id, routeData) {
        try {
            // Logic for updating a student's route
        } catch (error) {
            throw new Error('Error updating student route: ' + error.message);
        }
    }

    static async deleteStudent(student_id) {
        try {
            // Logic for deleting a student by ID
        } catch (error) {
            throw new Error('Error deleting student: ' + error.message);
        }
    }
}

