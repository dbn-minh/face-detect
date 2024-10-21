import { responseData } from "../config/response.js";
import service from "../services/adminServices.js";

export default class AdminController {
    // Main controllers
    static async getNotifications(req, res) {
        try {
            const homepage = await service.getNotifications();
            return responseData(res, "Success", homepage, 200);
        } catch (e) {
            return responseData(res, "Error", e.message, 500);
        }
    }

    static async getDashboard(req, res) {
        try {
            const homepage = await service.getDashboard();
            return responseData(res, "Success", homepage, 200);
        } catch (e) {
            return responseData(res, "Error", e.message, 500);
        }
    }

    static async getSetting(req, res) {
        try {
            const homepage = await service.getSetting();
            return responseData(res, "Success", homepage, 200);
        } catch (e) {
            return responseData(res, "Error", e.message, 500);
        }
    }

    static async getReport(req, res) {
        try {
            const homepage = await service.getReport();
            return responseData(res, "Success", homepage, 200);
        } catch (e) {
            return responseData(res, "Error", e.message, 500);
        }
    }

    static async updateInfo(req, res) {
        try {
            const homepage = await service.updateInfo(req.body);
            return responseData(res, "Success", homepage, 200);
        } catch (e) {
            return responseData(res, "Error", e.message, 500);
        }
    }

    // Routes - Buses
    static async getAllRoutes(req, res) {
        try {
            const buses = await service.getAllRoutes();
            return responseData(res, "Success", buses, 200);
        } catch (e) {
            return responseData(res, "Error", e.message, 500);
        }
    }

    static async getBusInfo(req, res) {
        try {
            const busInfo = await service.getBusInfo(req.params.bus_id);

            return responseData(res, "Success", busInfo, 200);
        } catch (e) {
            return responseData(res, "Error", e.message, 500);
        }
    }

    static async addBus(req, res) {
        try {
            const { capacity, license_plate } = req.body;

            // Validate input
            if (!capacity || !license_plate) {
                return responseData(res, 'Invalid input: Please provide capacity and license_plate.', null, 400);
            }

            const newBus = await service.addBus({capacity, license_plate});

            // Check if the bus already exists
            if (newBus.message === 'Bus with this license plate already exists.') {
                return responseData(res, newBus.message, newBus.bus, 409);
            }

            return responseData(res, "Success", newBus, 200);
        } catch (e) {
            return responseData(res, "Error", e.message, 500);
        }
    }

    static async deleteBus(req, res) {
        try {
            const { bus_ids } = req.params;

            // Validate the input
            if (!bus_ids) {
                return responseData(res, 'Invalid input: No bus IDs provided.', null, 400);
            }

            // Split the bus_ids into an array
            const busIdArray = bus_ids.split(',').map(id => parseInt(id.trim()));

            // Call the service layer to delete the buses
            const result = await service.deleteBuses(busIdArray);

            if (result.deletedBuses === 0) {
                return responseData(res, 'No buses found with the provided IDs.', null, 404);
            }

            return responseData(res, 'Buses deleted successfully.', { deletedBuses: result.deletedBuses }, 200);
        } catch (e) {
            return responseData(res, "Error", e.message, 500);
        }
    }

    // Drivers
    static async getAllDrivers(req, res) {
        try {
            const drivers = await service.getAllDrivers();
            return responseData(res, "Success", drivers, 200);
        } catch (e) {
            return responseData(res, "Error", e.message, 500);
        }
    }

    static async updateDriverInfo(req, res) {
        try {
            const { user_id } = req.params;
            const { name, phone_number, email, license_number } = req.body;

            // Validate the input fields
            if (!name || !phone_number || !email || !license_number) {
                return responseData(res, 'Invalid input: Please provide all required fields (name, phone_number, email, license_number)', null, 400);
            }

            const updateDriver = await service.updateDriverInfo(user_id, { name, phone_number, email, license_number });

            if (updateDriver.message === 'Email or phone number already exists.') {
                return responseData(res, 'Conflict', updateDriver, 409);
            }

            return responseData(res, "Success", updateDriver, 200);
        } catch (e) {
            return responseData(res, "Error", e.message, 500);
        }
    }

    static async addDriver(req, res) {
        try {
            const { name, phone_number, email, license_number } = req.body;

            // Validate the request body
            if (!name || !phone_number || !email || !license_number) {
                return responseData(res, 'Invalid input: Please provide all required fields (name, phone_number, email, license_number)', null, 400);
            }

            // Call the service layer with extracted data
            const addDriver = await service.addDriver({
                name,
                phone_number,
                email,
                license_number,
            });

            if (addDriver.message === 'User with the same email or phone number already exists.') {
                return responseData(res, 'Conflict', addDriver, 409);
            }

            return responseData(res, "Success", addDriver, 200);
        } catch (e) {
            return responseData(res, "Error", e.message, 500);
        }
    }

    static async deleteDriver(req, res) {
        try {
            const { user_ids } = req.params; // Get user_ids from URL parameters
            const userIdArray = user_ids.split(','); // Convert to array

            // Validate input
            if (userIdArray.length === 0) {
                return responseData(res, 'Invalid input: No user IDs provided.', null, 400);
            }

            // Call service to delete drivers and users
            const result = await service.deleteUsersByRole('driver', userIdArray);

            return responseData(res, 'Drivers deleted successfully.', result, 200);
        } catch (e) {
            return responseData(res, "Error", e.message, 500);
        }
    }

    // Parents
    static async getAllParents(req, res) {
        try {
            const parents = await service.getAllParents();

            if (!parents || parents.length === 0) {
                return responseData(res, 'No parents found.', null, 404);
            }

            return responseData(res, "Success", parents, 200);
        } catch (e) {
            return responseData(res, "Error", e.message, 500);
        }
    }

    static async updateParentInfo(req, res) {
        try {
            const { user_id } = req.params;
            const { name, phone_number, email, address, relationship } = req.body;

            // Validate the input fields
            if (!name || !phone_number || !email || !address || !relationship ) {
                return responseData(res, 'Invalid input: Please provide all required fields (name, phone_number, email, address, relationship, password).', null, 400);
            }

            const updateParent = await service.updateParentInfo(user_id, { name, phone_number, email, address, relationship });

            if (updateParent.message === 'Email or phone number already exists.') {
                return responseData(res, 'Conflict', updateParent, 409);
            }

            return responseData(res, "Success", updateParent, 200);
        } catch (e) {
            return responseData(res, "Error", e.message, 500);
        }
    }

    static async addParent(req, res) {
        try {
            const { name, phone_number, email, address, relationship } = req.body;

            // Validate input
            if (!name || !phone_number || !email || !address || !relationship ) {
                return responseData(res, 'Invalid input: Please provide all required fields (name, phone_number, email, address, relationship, password).', null, 400);
            }

            // Call the service layer to add the parent
            const addParent = await service.addParent({ name, phone_number, email, address, relationship });

            if (addParent.message === 'Email or phone number already exists.') {
                return responseData(res, 'Conflict', addParent, 409);
            }

            return responseData(res, "Success", addParent, 200);
        } catch (e) {
            return responseData(res, "Error", e.message, 500);
        }
    }

    static async deleteParent(req, res) {
        try {
            const { user_ids } = req.params; // Get user_ids from URL parameters
            const userIdArray = user_ids.split(','); // Convert to an array

            // Validate input
            if (userIdArray.length === 0) {
                return responseData(res, 'Invalid input: No user IDs provided.', null, 400);
            }

            // Call service to delete parents and users
            const result = await service.deleteUsersByRole('parent', userIdArray);

            return responseData(res, 'Success', result, 200);
        } catch (e) {
            return responseData(res, "Error", e.message, 500);
        }
    }

    // Teachers
    static async getAllTeachers(req, res) {
        try {
            const teachers = await service.getAllTeachers();

            if (!teachers || teachers.length === 0) {
                return responseData(res, 'No teachers found.', null, 404);
            }

            return responseData(res, "Success", teachers, 200);
        } catch (e) {
            return responseData(res, "Error", e.message, 500);
        }
    }

    static async updateTeacherInfo(req, res) {
        try {
            const { user_id } = req.params;
            const { name, phone_number, email, department } = req.body;

            // Validate the input fields
            if (!name || !phone_number || !email || !department ) {
                return responseData(res, 'Invalid input: Please provide all required fields (name, phone_number, email, department).', null, 400);
            }

            const updateTeacher = await service.updateTeacherInfo(user_id, {name, phone_number, email, department});

            if (updateTeacher.message === 'Email or phone number already exists.') {
                return responseData(res, 'Conflict', updateTeacher, 409);
            }

            return responseData(res, "Success", updateTeacher, 200);
        } catch (e) {
            return responseData(res, "Error", e.message, 500);
        }
    }

    static async addTeacher(req, res) {
        try {
            const { name, phone_number, email, department } = req.body;

            // Validate input
            if (!name || !phone_number || !email || !department) {
                return responseData(res, 'Invalid input: Please provide all required fields (name, phone_number, email, department).', null, 400);
            }

            // Call the service layer to add the teacher
            const addTeacher = await service.addTeacher({ name, phone_number, email, department });

            if (addTeacher.message === 'Email or phone number already exists.') {
                return responseData(res, 'Conflict', addTeacher, 409);
            }

            return responseData(res, "Success", addTeacher, 200);
        } catch (e) {
            return responseData(res, "Error", e.message, 500);
        }
    }

    static async deleteTeacher(req, res) {
        try {
            const { user_ids } = req.params; // Get user_ids from URL parameters
            const userIdArray = user_ids.split(','); // Convert to an array

            // Validate input
            if (userIdArray.length === 0) {
                return responseData(res, 'Invalid input: No user IDs provided.', null, 400);
            }

            // Call service to delete teachers and users
            const result = await service.deleteUsersByRole('teacher', userIdArray);

            return responseData(res, 'Teachers deleted successfully.', result, 200);
        } catch (e) {
            return responseData(res, "Error", e.message, 500);
        }
    }

    // Students
    static async getStudentInfo(req, res) {
        try {
            const studentInfo = await service.getStudentInfo(req.params.student_id);

            if (!studentInfo) {
                return responseData(res, 'Student not found.', null, 404);

            }
            return responseData(res, "Success", studentInfo, 200);
        } catch (e) {
            return responseData(res, "Error", e.message, 500);
        }
    }

    static async updateStudentInfo(req, res) {
        try {
            const { student_id } = req.params; // Get student_id from URL params
            const { name, class: studentClass } = req.body; // Extract fields from body

            // Validate input
            if (!name || !studentClass) {
                return responseData(res, 'Invalid input: Provide both name and class.', null, 400);
            }

            // Call service to update student info
            const updatedStudent = await service.updateStudentInfo(student_id, { name, studentClass });

            if (!updatedStudent) {
                return responseData(res, 'Student not found.', null, 404);
            }

            return responseData(res, 'Student updated successfully.', updatedStudent, 200);
        } catch (e) {
            return responseData(res, "Error", e.message, 500);
        }
    }

    static async addStudentInfo(req, res) {
        try {
            const { name, class: studentClass } = req.body;

             if (!name || !studentClass ) {
                return responseData(res, 'Invalid input: Please provide all required fields (name, class).', null, 400);
            }

            const newStudent = await service.addStudentInfo({ name, studentClass });
            return responseData(res, "Success", newStudent, 200);
        } catch (e) {
            return responseData(res, "Error", e.message, 500);
        }
    }

    static async getAllStudents(req, res) {
        try {
            const students = await service.getAllStudents();

            if (!students || students.length === 0) {
                return responseData(res, 'No students found.', null, 404);
            }

            return responseData(res, "Success", students, 200);
        } catch (e) {
            return responseData(res, "Error", e.message, 500);
        }
    }

    static async updateStudentRoute(req, res) {
        try {
            const homepage = await service.updateStudentRoute(req.params.student_id, req.body);
            return responseData(res, "Success", homepage, 200);
        } catch (e) {
            return responseData(res, "Error", e.message, 500);
        }
    }

    static async deleteStudent(req, res) {
        try {
            const { student_ids } = req.params; // Get student_ids from URL params
            const studentIdArray = student_ids.split(','); // Convert to array

            // Validate input
            if (studentIdArray.length === 0) {
                return responseData(res, 'Invalid input: No student IDs provided.', null, 400);
            }

            // Call service to delete students
            const result = await service.deleteStudents(studentIdArray);

            if (result.deletedCount === 0) {
                return responseData(res, 'No students found to delete.', null, 404);
            }

            return responseData(res, 'Students deleted successfully.', result, 200);
        } catch (e) {
            return responseData(res, "Error", e.message, 500);
        }
    }

    static async getUnassignedDrivers(req, res) {
        try {
            const unassignedDrivers = await service.getUnassignedDrivers();

            if (!unassignedDrivers || unassignedDrivers.length === 0) {
                return responseData(res, 'No unassigned drivers found.', null, 404);
            }

            return responseData(res, 'Success', unassignedDrivers, 200);
        } catch (e) {
            return responseData(res, 'Error', e.message, 500);
        }
    }

    static async getUnassignedTeachers(req, res) {
        try {
            const unassignedTeachers = await service.getUnassignedTeachers();

            if (!unassignedTeachers || unassignedTeachers.length === 0) {
                return responseData(res, 'No unassigned teachers found.', null, 404);
            }

            return responseData(res, 'Success', unassignedTeachers, 200);
        } catch (e) {
            return responseData(res, 'Error', e.message, 500);
        }
    }

    static async assignDriverToBus(req, res) {
        try {
            const { bus_id, driver_id } = req.params;

            // Call the service layer to assign the driver
            const result = await service.assignDriverToBus(bus_id, driver_id);

            return responseData(res, 'Driver assigned successfully.', result, 200);
        } catch (e) {
            return responseData(res, 'Error', e.message, 500);
        }
    }

    static async assignTeacherToBus(req, res) {
        try {
            const { bus_id, teacher_id } = req.params;

            // Call the service layer to assign the teacher
            const result = await service.assignTeacherToBus(bus_id, teacher_id);

            return responseData(res, 'Teacher assigned successfully.', result, 200);
        } catch (e) {
            return responseData(res, 'Error', e.message, 500);
        }
    }
    static async getStudentsWithoutParents(req, res) {
        try {
            // Call service layer to get unassigned students
            const students = await service.getStudentsWithoutParents();

            if (!students || students.length === 0) {
                return responseData(res, 'No students without parents found.', null, 404);
            }

            return responseData(res, 'Success', students, 200);
        } catch (e) {
            return responseData(res, 'Error', e.message, 500);
        }
    }
    static async getStudentsWithoutBus(req, res) {
        try {
            const students = await service.getStudentsWithoutBus();

            if (!students || students.length === 0) {
                return responseData(res, 'No students without a bus found.', null, 404);
            }

            return responseData(res, 'Success', students, 200);
        } catch (e) {
            return responseData(res, 'Error', e.message, 500);
        }
    }
    // Assign students to parents
    static async assignStudentsToParents(req, res) {
        try {
            const { student_ids, parent_id } = req.body;

            // Validate input
            if (!student_ids || !Array.isArray(student_ids) || student_ids.length === 0 || !parent_id) {
                return responseData(res, 'Invalid input: Provide valid student IDs and a parent ID.', null, 400);
            }

            // Call the service to assign students to parents
            const result = await service.assignStudentsToParents(student_ids, parent_id);

            return responseData(res, 'Students assigned to parent successfully.', result, 200);
        } catch (e) {
            return responseData(res, 'Error', e.message, 500);
        }
    }

    static async assignStudentsToBus(req, res) {
        try {
            const { bus_id } = req.params;
            const { student_ids } = req.body;

            // Validate input
            if (!student_ids || !Array.isArray(student_ids) || student_ids.length === 0) {
                return responseData(res, 'Invalid input: Provide valid student IDs.', null, 400);
            }

            // Call the service to assign students to the bus
            const result = await service.assignStudentsToBus(student_ids, bus_id);

            return responseData(res, 'Students assigned to bus successfully.', result, 200);
        } catch (e) {
            return responseData(res, 'Error', e.message, 500);
        }
    }
}
