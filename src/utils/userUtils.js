import { Op } from 'sequelize';
import initModels from "../models/init-models.js";
import sequelize from "../config/database.js";
let model = initModels(sequelize);

/**
 * Finds an existing user by email or phone number.
 * @param {string} email - The user's email.
 * @param {string} phone_number - The user's phone number.
 * @returns {Promise<Object|null>} - Returns user data if found, or null if not found.
 */
export async function findExistingUser(email, phone_number) {
    const existingUser = await model.User.findOne({
        where: {
            [Op.or]: [{ email }, { phone_number }]
        },
        attributes: ['user_id', 'name', 'email', 'phone_number', 'role_id']
    });

    if (existingUser) {
        return {
            message: 'Email or phone number already exists.',
            user: {
                user_id: existingUser.user_id,
                name: existingUser.name,
                email: existingUser.email,
                phone_number: existingUser.phone_number
            }
        };
    }

    return null;
}
