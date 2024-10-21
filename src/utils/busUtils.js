import initModels from "../models/init-models.js";
import sequelize from "../config/database.js";
let model = initModels(sequelize);

export async function getExistingBusByLicensePlate(license_plate) {
    try {
        // Check if a bus with the given license_plate exists
        return await model.Bus.findOne({
            where: { license_plate },
        });

    } catch (error) {
        throw new Error('Error checking license plate: ' + error.message);
    }
}