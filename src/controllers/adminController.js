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

    static async updateBusInfo(req, res) {
        try {
            const homepage = await service.updateBusInfo(req.params.bus_id, req.body);
            return responseData(res, "Success", homepage, 200);
        } catch (e) {
            return responseData(res, "Error", e.message, 500);
        }
    }

    static async addBus(req, res) {
        try {
            const homepage = await service.addBus(req.body);
            return responseData(res, "Success", homepage, 200);
        } catch (e) {
            return responseData(res, "Error", e.message, 500);
        }
    }

    static async deleteBus(req, res) {
        try {
            const homepage = await service.deleteBus(req.params.bus_id);
            return responseData(res, "Success", homepage, 200);
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

    static async getDriverInfo(req, res) {
        try {
            const homepage = await service.getDriverInfo(req.params.driver_id);
            return responseData(res, "Success", homepage, 200);
        } catch (e) {
            return responseData(res, "Error", e.message, 500);
        }
    }

    static async updateDriverInfo(req, res) {
        try {
            const homepage = await service.updateDriverInfo(req.params.driver_id, req.body);
            return responseData(res, "Success", homepage, 200);
        } catch (e) {
            return responseData(res, "Error", e.message, 500);
        }
    }

    static async addDriver(req, res) {
        try {
            // Log the entire request body to confirm it's received
            console.log('Request Body:', req.body);

            // Extract the relevant fields from req.body
            const { name, phone_number, email, license_number } = req.body;

            // Validate the request body
            if (!name || !phone_number || !email || !license_number) {
                throw new Error(
                    'Invalid input: Please provide all required fields (name, phone_number, email, license_number)'
                );
            }

            // Call the service layer with extracted data
            const addDriver = await service.addDriver({
                name,
                phone_number,
                email,
                license_number,
            });

            return responseData(res, "Success", addDriver, 200);
        } catch (e) {
            return responseData(res, "Error", e.message, 500);
        }
    }

    static async deleteDriver(req, res) {
        try {
            const homepage = await service.deleteDriver(req.params.driver_id);
            return responseData(res, "Success", homepage, 200);
        } catch (e) {
            return responseData(res, "Error", e.message, 500);
        }
    }

    // Parents
    static async getAllParents(req, res) {
        try {
            const homepage = await service.getAllParents();
            return responseData(res, "Success", homepage, 200);
        } catch (e) {
            return responseData(res, "Error", e.message, 500);
        }
    }

    static async getParentInfo(req, res) {
        try {
            const homepage = await service.getParentInfo(req.params.parent_id);
            return responseData(res, "Success", homepage, 200);
        } catch (e) {
            return responseData(res, "Error", e.message, 500);
        }
    }

    static async updateParentInfo(req, res) {
        try {
            const homepage = await service.updateParentInfo(req.params.parent_id, req.body);
            return responseData(res, "Success", homepage, 200);
        } catch (e) {
            return responseData(res, "Error", e.message, 500);
        }
    }

    static async addParent(req, res) {
        try {
            const homepage = await service.addParent(req.body);
            return responseData(res, "Success", homepage, 200);
        } catch (e) {
            return responseData(res, "Error", e.message, 500);
        }
    }

    static async deleteParent(req, res) {
        try {
            const homepage = await service.deleteParent(req.params.parent_id);
            return responseData(res, "Success", homepage, 200);
        } catch (e) {
            return responseData(res, "Error", e.message, 500);
        }
    }

    // Teachers
    static async getAllTeachers(req, res) {
        try {
            const homepage = await service.getAllTeachers();
            return responseData(res, "Success", homepage, 200);
        } catch (e) {
            return responseData(res, "Error", e.message, 500);
        }
    }

    static async getTeacherInfo(req, res) {
        try {
            const homepage = await service.getTeacherInfo(req.params.teacher_id);
            return responseData(res, "Success", homepage, 200);
        } catch (e) {
            return responseData(res, "Error", e.message, 500);
        }
    }

    static async updateTeacherInfo(req, res) {
        try {
            const homepage = await service.updateTeacherInfo(req.params.teacher_id, req.body);
            return responseData(res, "Success", homepage, 200);
        } catch (e) {
            return responseData(res, "Error", e.message, 500);
        }
    }

    static async addTeacher(req, res) {
        try {
            const homepage = await service.addTeacher(req.body);
            return responseData(res, "Success", homepage, 200);
        } catch (e) {
            return responseData(res, "Error", e.message, 500);
        }
    }

    static async deleteTeacher(req, res) {
        try {
            const homepage = await service.deleteTeacher(req.params.teacher_id);
            return responseData(res, "Success", homepage, 200);
        } catch (e) {
            return responseData(res, "Error", e.message, 500);
        }
    }

    // Students
    static async addStudentToBus(req, res) {
        try {
            const homepage = await service.addStudentToBus(req.params.bus_id, req.body);
            return responseData(res, "Success", homepage, 200);
        } catch (e) {
            return responseData(res, "Error", e.message, 500);
        }
    }

    static async getStudentInfo(req, res) {
        try {
            const homepage = await service.getStudentInfo(req.params.student_id);
            return responseData(res, "Success", homepage, 200);
        } catch (e) {
            return responseData(res, "Error", e.message, 500);
        }
    }

    static async updateStudentInfo(req, res) {
        try {
            const homepage = await service.updateStudentInfo(req.params.student_id, req.body);
            return responseData(res, "Success", homepage, 200);
        } catch (e) {
            return responseData(res, "Error", e.message, 500);
        }
    }

    static async addStudentInfo(req, res) {
        try {
            const homepage = await service.addStudentInfo(req.params.student_id, req.body);
            return responseData(res, "Success", homepage, 200);
        } catch (e) {
            return responseData(res, "Error", e.message, 500);
        }
    }

    static async getAllStudents(req, res) {
        try {
            const homepage = await service.getAllStudents();
            return responseData(res, "Success", homepage, 200);
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
            const homepage = await service.deleteStudent(req.params.student_id);
            return responseData(res, "Success", homepage, 200);
        } catch (e) {
            return responseData(res, "Error", e.message, 500);
        }
    }
}
