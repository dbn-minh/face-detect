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

        // Step 2: Get all students related to the bus_id
        const students = await model.Student.findAll({
            where: { bus_id: bus.bus_id }, // Use bus_id to get students
            attributes: ['student_id', 'name', 'class', 'avatar'],
            include: [
                {
                    model: model.Student_Parent, // Join the Student_Parent table to link with Parent
                    as: 'Student_Parents',
                    attributes: ['parent_id'],
                    include: [
                        {
                            model: model.Parent, // Include the Parent to get the address
                            as: 'parent',
                            attributes: ['address'],
                        }
                    ]
                }
            ]
        });

        // Map the results to include both student and parent address
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
            students: students.length > 0
                ? students.map((student) => ({
                      student_id: student.student_id,
                      name: student.name,
                      class: student.class,
                      avatar: student.avatar,
                      address: student.Student_Parents.length > 0
                          ? student.Student_Parents[0].parent.address
                          : null // Get the first parent's address (if any)
                  }))
                : []
        };
    } catch (error) {
        throw new Error('Error fetching driver details: ' + error.message);
    }
};

export const getDriverSetting = async (driver_id) => {
    try {
        // Fetch the bus details first and include driver and user info
        const bus = await model.Bus.findOne({
            where: { driver_id },
            attributes: ['bus_id', 'license_plate'],
            include: [
                {
                    model: model.Driver,
                    as: 'driver',
                    attributes: ['driver_id', 'license_number'],
                    include: [
                        {
                            model: model.User,
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

        return {

            driver_id: bus.driver.driver_id,
            license_number: bus.driver.license_number,
            name: bus.driver.user.name,
            email: bus.driver.user.email,
            phone_number: bus.driver.user.phone_number,
            bus_id: bus.bus_id,
            license_plate: bus.license_plate
        };
    } catch (error) {
        throw new Error('Error fetching driver details: ' + error.message);
    }
};


