import initModels from "../models/init-models.js";
import sequelize from "../config/database.js";
import bcrypt from 'bcrypt';

let model = initModels(sequelize);

// Service to get driver details by ID
export const getDriverDetailsById = async (driver_id) => {
    try {
        // Get all journeys associated with the driver
        const journeys = await model.Journey.findAll({
            where: { driver_id },
            attributes: ['journey_id'],
        });

        if (!journeys.length) {
            return { error: "No journeys found for this driver", data: null };
        }

        // Extract all journey IDs
        const journeyIds = journeys.map(journey => journey.journey_id);

        // Get all students associated with these journeys
        const students = await model.Student.findAll({
            include: [{
                model: model.Attendance,
                as: 'Attendances',
                where: { journey_id: journeyIds },
                attributes: []
            }]
        });
        if (!students.length) {
            return { error: "No students found for this driver's journeys", data: null };
        }

        return {
            error: null,
            data: students.map(student => student.toJSON())
        };
    } catch (error) {
        console.error("Error fetching driver details:", error);
        return { error: "An error occurred while fetching driver details", data: null };
    }
};

// Service to get driver profile by ID
export const getDriverProfileById = async (driver_id) => {
    try {
        const driverProfile = await model.Driver.findOne({
            where: { driver_id },
            include: [{
                model: model.User,
                as: 'user',
                attributes: ['name', 'email', 'phone_number']
            }]
        });

        if (!driverProfile) {
            return { error: "Driver not found", data: null };
        }

        return { error: null, data: driverProfile.toJSON() };
    } catch (error) {
        console.error("Error fetching driver profile:", error);
        return { error: "An error occurred while fetching the driver profile", data: null };
    }
};

// Service to update driver profile by ID
export const updateDriverProfileById = async (driver_id, updatedDriverData) => {
    try {
        const { name, email, phone_number, password, license_number } = updatedDriverData;

        // Find the driver profile by ID
        const driverProfile = await model.Driver.findOne({
            where: { driver_id },
            include: [{
                model: model.User,
                as: 'user',
            }]
        });

        if (!driverProfile) {
            return { error: "Driver not found", data: null };
        }

        // Hash the new password if it's provided
        let hashedPassword;
        if (password) {
            hashedPassword = await bcrypt.hash(password, 10);
        }

        // Update the User table with the provided user-related attributes, including the password
        const updatedUser = await driverProfile.user.update({
            name: name || driverProfile.user.name,
            email: email || driverProfile.user.email,
            phone_number: phone_number || driverProfile.user.phone_number,
            password: hashedPassword || driverProfile.user.password,
        });

        // Update the Driver table with the provided driver-related attributes
        await driverProfile.update({
            license_number: license_number || driverProfile.license_number,
        });

        // Return the updated profile
        return { error: null, data: { ...driverProfile.toJSON(), user: updatedUser.toJSON() } };
    } catch (error) {
        console.error("Error updating driver profile:", error);
        return { error: "An error occurred while updating the driver profile", data: null };
    }
};
