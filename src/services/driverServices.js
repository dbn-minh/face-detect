import initModels from "../models/init-models.js";
import sequelize from "../config/database.js";
import bcrypt from 'bcrypt';

let model = initModels(sequelize);

export const getDriverDetails = async (driver_id) => {
    try {
        // Step 1: Get the Bus and Teacher info based on driver_id
        const bus = await model.Bus.findOne({
            where: { driver_id },
            attributes: ['bus_id', 'license_plate'],
            include: [
                {
                    model: model.Teacher,
                    as: 'teacher', // Include teacher information
                    attributes: ['teacher_id'],
                    include: [
                        {
                            model: model.User, // Get teacher's user info
                            as: 'user',
                            attributes: ['name', 'email', 'phone_number']
                        }
                    ]
                }
            ]
        });

        if (!bus) {
            throw new Error('No bus found for this driver');
        }

        // Step 2: Get all students related to this driver_id
        const students = await model.Student.findAll({
            where: { driver_id },
            attributes: ['student_id', 'name', 'class', 'avatar']
        });

        return {
            bus: {
                bus_id: bus.bus_id,
                license_plate: bus.license_plate,
                teacher: bus.teacher
                    ? {
                          teacher_id: bus.teacher.teacher_id,
                          name: bus.teacher.user.name,
                          email: bus.teacher.user.email,
                          phone_number: bus.teacher.user.phone_number
                      }
                    : null
            },
            students: students.length > 0 ? students : []
        };
    } catch (error) {
        throw new Error('Error fetching driver details: ' + error.message);
    }
};
