import initModels from "../models/init-models.js";
import sequelize from "../config/database.js";
import bcrypt from "bcrypt";
import {
  createRefToken,
  createToken,
} from "../config/jwt.js";
import { findExistingUser } from '../utils/userUtils.js';
// import { v4 as uuidv4 } from 'uuid';
let model = initModels(sequelize);

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

    static async updateDriverInfo(user_id, { name, phone_number, email, license_number }) {
        try {
            // Check if the user already exists
            const existingUser = await findExistingUser(email, phone_number);
            if (existingUser) {
                return existingUser;
            }

            // Find the driver along with the associated user
            const driver = await model.Driver.findOne({
                where: { user_id },
                include: {
                    model: model.User,
                    as: 'user',
                },
            });

            // Update the driver's license number
            driver.license_number = license_number;
            await driver.save();

            // Update the associated user's details
            const user = driver.user;
            user.name = name;
            user.phone_number = phone_number;
            user.email = email;
            await user.save();

            // Return the updated driver and user information
            return {
                user_id: driver.user_id,
                license_number: driver.license_number,
                name: user.name,
                phone_number: user.phone_number,
                email: user.email,
            };
        } catch (error) {
            throw new Error('Error updating driver info: ' + error.message);
        }
    }

    static async addDriver({ name, phone_number, email, license_number }) {
        try {
            // Check if the user already exists
            const existingUser = await findExistingUser(email, phone_number);
            if (existingUser) {
                return existingUser; // Return existing user info
            }

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
                    password: generatedPassword,
                },
            };
        } catch (error) {
            throw new Error('Error creating driver: ' + error.message);
        }
    }

    static async deleteUsersByRole(role, userIdArray) {
        try {
            let deletedRoleEntries;

            // Determine which role-specific entries to delete
            switch (role) {
                case 'parent':
                    deletedRoleEntries = await model.Parent.destroy({ where: { user_id: userIdArray } });
                    break;
                case 'teacher':
                    deletedRoleEntries = await model.Teacher.destroy({ where: { user_id: userIdArray } });
                    break;
                case 'driver':
                    deletedRoleEntries = await model.Driver.destroy({ where: { user_id: userIdArray } });
                    break;
                default:
            }

            // Delete users based on user IDs
            const deletedUsers = await model.User.destroy({
                where: { user_id: userIdArray }
            });

            // Return the result of deletions
            return {
                deletedRoleEntries,
                deletedUsers
            };
        } catch (error) {
            throw new Error('Error deleting driver: ' + error.message);
        }
    }

    // Parents
    static async getAllParents() {
        try {
            // Fetch all parents with their associated user details
            const parents = await model.Parent.findAll({
                include: [
                    {
                        model: model.User,
                        as: 'user', // Make sure this alias matches your model association
                        attributes: ['user_id', 'name', 'phone_number', 'email']
                    }
                ]
            });

            return parents.map((parent) => ({
                parent_id: parent.parent_id,
                user_id: parent.user.user_id,
                name: parent.user.name,
                phone_number: parent.user.phone_number,
                email: parent.user.email,
                address: parent.address,
                relationship: parent.relationship
            }));
        } catch (error) {
            throw new Error('Error fetching parents: ' + error.message);
        }
    }

    static async updateParentInfo(user_id, { name, phone_number, email, address, relationship }) {
        try {
            // Check if the user already exists
            const existingUser = await findExistingUser(email, phone_number);
            if (existingUser) {
                return existingUser; // Return existing user info
            }

            // Find the parent along with the associated user
            const parent = await model.Parent.findOne({
                where: { user_id },
                include: {
                    model: model.User,
                    as: 'user',
                },
            });

            if (!parent) {
                return null; // Parent not found
            }

            // Update the associated user's details
            const user = parent.user;
            user.name = name;
            user.phone_number = phone_number;
            user.email = email;
            await user.save(); // Save updated user details

            // Update the parent-specific details
            parent.address = address;
            parent.relationship = relationship;
            await parent.save(); // Save updated parent details

            // Return the updated information
            return {
                parent_id: parent.parent_id,
                user: {
                    user_id: user.user_id,
                    name: user.name,
                    phone_number: user.phone_number,
                    email: user.email,
                },
                address: parent.address,
                relationship: parent.relationship,
            };
        } catch (error) {
            throw new Error('Error updating parent info: ' + error.message);
        }
    }

    static async addParent({name, phone_number, email, address, relationship}) {
        try {
            // Check if the user already exists
            const existingUser = await findExistingUser(email, phone_number);
            if (existingUser) {
                return existingUser; // Return existing user info
            }

            // Fetch the role_id for 'Driver'
            const parentRole = await model.Role.findOne({
                where: { role_name: 'Parent' },
                attributes: ['role_id'],
            });

            // Generate and hash the password
            // const generatedPassword = uuidv4().slice(0, 8); // Auto gen random password
            const generatedPassword = '123456789' // Hardcode to 123456789
            const hashedPassword = await bcrypt.hash(generatedPassword, 10);

            // Create a new user
            const newUser = await model.User.create({
                role_id: parentRole.role_id,
                name,
                phone_number,
                email,
                password: hashedPassword,
                refresh_token: null,
            });

            // Create a new driver with the user's ID
            const newParent = await model.Parent.create({
                user_id: newUser.user_id,
                address,
                relationship
            });

            return {
                parent_id: newParent.parent_id,
                address: newParent.address,
                relationship: newParent.relationship,
                user: {
                    user_id: newUser.user_id,
                    name: newUser.name,
                    phone_number: newUser.phone_number,
                    email: newUser.email,
                    password: generatedPassword
                },

            };

        } catch (error) {
            throw new Error('Error adding parent: ' + error.message);
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

