import initModels from "../models/init-models.js";
import sequelize from "../config/database.js";
let model = initModels(sequelize);
import bcrypt from 'bcrypt';
import { Op } from 'sequelize';

export const getAllStudentsInformationByParentId = async (parent_id) => {
    try {
        const studentInfo = await model.Student_Parent.findAll({
            where: { parent_id: parent_id },
            attributes: ['student_id'],
            include: [
                {
                    model: model.Student,
                    as: 'student',
                    attributes: ['student_id', 'name', 'class', 'teacher_id', 'driver_id', 'avatar'],
                    include: [
                        {
                            model: model.Teacher,
                            as: 'teacher',
                            attributes: ['teacher_id', 'user_id'],
                            include: [
                                {
                                    model: model.User,
                                    as: 'user',
                                    attributes: ['user_id', 'name', 'phone_number', 'email'],
                                }
                            ]
                        },
                        {
                            model: model.Driver,
                            as: 'driver',
                            attributes: ['driver_id', 'user_id'],
                            include: [
                                {
                                    model: model.User,
                                    as: 'user',
                                    attributes: ['user_id', 'name', 'phone_number', 'email'],
                                }
                            ]
                        }
                    ]
                }
            ]
        });

        // Trả về thông tin học sinh kèm theo giáo viên và tài xế
        return studentInfo.map((record) => ({
            student_id: record.student.student_id,
            name: record.student.name,
            class: record.student.class,
            avatar: record.student.avatar,
            teacher: record.student.teacher
                ? {
                    teacher_id: record.student.teacher.teacher_id,
                    "Teacher information": record.student.teacher.user
                        ? {
                            user_id: record.student.teacher.user.user_id,
                            name: record.student.teacher.user.name,
                            phone_number: record.student.teacher.user.phone_number,
                            email: record.student.teacher.user.email,
                        }
                        : null,
                }
                : null,
            driver: record.student.driver
                ? {
                    driver_id: record.student.driver.driver_id,
                    "Driver information": record.student.driver.user
                        ? {
                            user_id: record.student.driver.user.user_id,
                            name: record.student.driver.user.name,
                            phone_number: record.student.driver.user.phone_number,
                            email: record.student.driver.user.email,
                        }
                        : null,
                }
                : null,
        }));
    } catch (error) {
        throw new Error('Error fetching students for parent: ' + error.message);
    }
};


export const getCurrentLocationByDriverId = async (driver_id) => {
    try {
        const bus = await model.Bus.findOne({
            where: { driver_id: driver_id },
            attributes: ['current_location'],
        });

        if (!bus) {
            return null;
        }

        return bus.current_location;
    } catch (error) {
        throw new Error('Error fetching current location: ' + error.message);
    }
};

export const getNotificationsByParentId = async (parent_id) => {
    try {
        // Tìm student_id từ bảng Student_Parent, lấy kèm Attendance và Notification
        return await model.Student_Parent.findAll({
            where: { parent_id: parent_id },
            attributes: [],
            include: [
                {
                    model: model.Student,
                    as: 'student',
                    attributes: ['name'],
                    include: [
                        {
                            model: model.Attendance,
                            as: 'Attendances',
                            attributes: ['attendance_id'],
                            include: [
                                {
                                    model: model.Notification,
                                    as: 'Notifications',
                                    attributes: ['notification_id', 'time_stamp', 'message', 'image', 'status'],
                                },
                            ],
                        },
                    ],
                },
            ],
        });

    } catch (error) {
        throw new Error('Error fetching notifications: ' + error.message);
    }
};

export const getSetting = async (parent_id) => {
    try {
        return await model.Student_Parent.findAll({
            where: { parent_id: parent_id },
            attributes: ['student_id'],
            include: [
                {
                    model: model.Student,
                    as: 'student',
                    attributes: ['name', 'class', 'avatar', 'feature_vector'],
                    include: [
                        {
                            model: model.Driver,
                            as: 'driver',
                            attributes: ['driver_id'],
                            include: [
                                {
                                    model: model.Bus,
                                    as: 'Buses',
                                    attributes: ['bus_id', 'license_plate'],
                                }
                            ]
                        }
                    ]
                },
                {
                    model: model.Parent, // Liên kết đến bảng Parent
                    as: 'parent', // Đảm bảo alias trùng với alias trong initModels
                    attributes: ['address'], // Lấy địa chỉ từ bảng Parent
                    include: [
                        {
                            model: model.User, // Liên kết với bảng User để lấy số điện thoại
                            as: 'user',
                            attributes: ['phone_number'], // Lấy số điện thoại từ bảng User
                        }
                    ]
                }
            ]
        });
    } catch (error) {
        throw new Error('Error fetching students for parent: ' + error.message);
    }
};

export const updateSetting = async (parent_id, updateData) => {
    const { name, className, address, phone_number } = updateData;

    try {
        // Fetch the student_id based on the parent_id
        const studentParentRecord = await model.Student_Parent.findOne({
            where: { parent_id: parent_id },
            attributes: ['student_id'], // Only fetch the student_id
        });

        if (!studentParentRecord) {
            throw new Error('No student found for the given parent.');
        }

        const student_id = studentParentRecord.student_id;

        // Update student's information
        await model.Student.update(
            { name: name, class: className }, // Data to be updated
            { where: { student_id: student_id } } // Condition to find the student
        );

        // Update parent's address
        await model.Parent.update(
            { address: address }, // Data to be updated
            { where: { parent_id: parent_id } } // Condition to find the parent
        );

        // Update parent's phone number in the User table
        const parent = await model.Parent.findOne({
            where: { parent_id: parent_id },
            include: [{ model: model.User, as: 'user' }] // Include User to access the user table
        });

        if (parent && parent.user) {
            await model.User.update(
                { phone_number: phone_number }, // Data to be updated
                { where: { user_id: parent.user.user_id } } // Condition to find the user
            );
        }

        return { message: 'Update successful' };
    } catch (error) {
        throw new Error('Error updating settings: ' + error.message);
    }
};



























