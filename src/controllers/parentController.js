import {responseData} from "../config/response.js";
import {Sequelize, where} from "sequelize";
import sequelize from "../config/database.js";
import initModels from "../models/init-models.js";
// import {del} from "express/lib/application.js";

let model = initModels(sequelize);

export default class ParentController {
    static async getParentDetails(req, res) {
        // Function to get parent details

        try {
            let {id} = req.params;

            let parent = await model.Parent.findOne({
                where: {ParentId: id},
                include: [{
                    model: model.User, as: "user"
                }]
            });
            !parent ? responseData(res, "Fail", "Parent not found", 404) : null

            let {address} = parent;
            let {name, phoneNumber, email} = parent.user;
            let data = {
                name,
                phoneNumber,
                address,
                email
            }

            responseData(res, "Success", data, 200);
        } catch (e) {
            responseData(res, "Error ...", e.message, 500);
        }
    }

    static async getNotifications(req, res) {
        // Function to get parent notifications

        try {
            let {id} = req.params;

            let notification = await model.Notification.findOne({
                where: {notificationID: id}
            });

            responseData(res, "Success", notification, 200);
        } catch (e) {
            responseData(res, "Error ...", e.message, 500);
        }
    }

    static async getBusTracking(req, res) {
        // Function to get bus tracking info

        try {
            let {id} = req.params;

            let bus = await model.Bus.findOne({
                where: {
                    busID: id
                },
                include: [{ model: model.Driver, as: 'driver' }]
            });
            !bus ? responseData(res, "Fail", "Bus not found", 404) : null;

            let user = await model.User.findOne({
                where: { userID: bus.driver.userID },
                attributes: ['name', 'phoneNumber', 'email'] // Only select necessary fields
            });

            let {busID, licensePlate, currentLocation} = bus;
            let { driverID,  } = bus.driver;
            let {name, phoneNumber, email } = user;

            let data = {
                busID,
                licensePlate,
                currentLocation,
                driver: {
                    driverID,
                    name,
                    phoneNumber,
                    email
                }
            };

            responseData(res, "Success", data, 200);
        } catch (e) {
            responseData(res, "Error ...", e.message, 500);
        }
    }

    static async getParentProfile(req, res) {
        // Function to get parent profile

        try {
            let {id} = req.params;

            let PaProfile = await model.Parent.findOne({
                where: {parentID: id}
            });
            !PaProfile
                ? responseData(res, "Fail", "Bus not found", 404)
                : null



            responseData(res, "Success", data, 200);
        } catch (e) {
            responseData(res, "Error ...", e.message, 500);
        }
    }

    static async updateParentProfile(req, res) {
        // Fudinction to update parent profile
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
