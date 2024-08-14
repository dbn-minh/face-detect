import initModels from "../models/init-models.js";
import sequelize from "../config/database.js";
let model = initModels(sequelize);

export default class ParentController {
    static async getParentDetails(req, res) {
        console.log("req.params:", req.params);

        const parentID = req.params.parentID; // Assuming parentID is passed as a URL parameter
        console.log("parentID value:", parentID);
        console.log("Type of parentID:", typeof parentID);

        // try {
        const students = await model.Student.findAll({
            where: {parentID: parentID},
            attributes: ['studentID', 'name', 'class', 'avatar'], // Selecting relevant attributes for the students
            // include: [
            //     {
            //         model: model.Teacher,
            //         as: 'teacher', // Include the teacher associated with the student
            //         attributes: ['teacherID', 'department'],
            //         include: [
            //             {
            //                 model: model.User,
            //                 as: 'user', // Include user details of the teacher
            //                 attributes: ['name', 'email', 'phoneNumber']
            //             }
            //         ]
            //     }
            // ]
        });

        // if (students.length > 0) {
        //     res.status(200).json(students);
        // } else {
        //     res.status(404).json({ message: "No students found for this parent" });
        // }
    // } catch (error) {
    //     console.error("Error fetching students and teacher details:", error);
    //     res.status(500).json({ message: "An error occurred while fetching student and teacher details" });
    // }
    }

    static async updateParentDetails(req, res) {
        // Function to update parent details
    }

    static async createParentDetails(req, res) {
        // Function to create parent details
    }

    static async getNotifications(req, res) {
        // Function to get parent notifications
    }

    static async getBusTracking(req, res) {
        // Function to get bus tracking info
    }

    static async getParentProfile(req, res) {
        // Function to get parent profile
    }

    static async updateParentProfile(req, res) {
        // Function to update parent profile
    }

    static async createParentProfile(req, res) {
        // Function to create parent profile
    }

    static async deleteParentProfile(req, res) {
        // Function to delete parent profile
    }

    static async registerStudent(req, res) {
        // Function to register student for bus
    }

    static async logoutParent(req, res) {
        // Function to handle parent logout
    }
}
