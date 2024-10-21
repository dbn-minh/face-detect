import initModels from "../models/init-models.js";
import sequelize from "../config/database.js";
let model = initModels(sequelize);

export const getAllStudentsInformationByParentId = async (parent_id) => {
    try {
        const studentInfo = await model.Student_Parent.findAll({
            where: { parent_id: parent_id },
            attributes: ['student_id'],
            include: [
                {
                    model: model.Student,
                    as: 'student',
                    attributes: ['student_id', 'name', 'class', 'bus_id', 'avatar'],
                    include: [
                        {
                            model: model.Bus,
                            as: 'bus',
                            attributes: ['bus_id', 'current_location'],
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
                }
            ]
        });

        // Return student information along with bus, teacher, and driver details
        return studentInfo.map((record) => ({
            student_id: record.student.student_id,
            name: record.student.name,
            class: record.student.class,
            avatar: record.student.avatar,
            bus: record.student.bus
                ? {
                    bus_id: record.student.bus.bus_id,
                    current_location: record.student.bus.current_location || 'Unknown location',  // Use current_location
                    teacher: record.student.bus.teacher
                        ? {
                            teacher_id: record.student.bus.teacher.teacher_id,
                            "Teacher information": record.student.bus.teacher.user
                                ? {
                                    user_id: record.student.bus.teacher.user.user_id,
                                    name: record.student.bus.teacher.user.name,
                                    phone_number: record.student.bus.teacher.user.phone_number,
                                    email: record.student.bus.teacher.user.email,
                                }
                                : null,
                        }
                        : null,
                    driver: record.student.bus.driver
                        ? {
                            driver_id: record.student.bus.driver.driver_id,
                            "Driver information": record.student.bus.driver.user
                                ? {
                                    user_id: record.student.bus.driver.user.user_id,
                                    name: record.student.bus.driver.user.name,
                                    phone_number: record.student.bus.driver.user.phone_number,
                                    email: record.student.bus.driver.user.email,
                                }
                                : null,
                        }
                        : null,
                }
                : null
        }));
    } catch (error) {
        throw new Error('Error fetching students for parent: ' + error.message);
    }
};

export const getNotificationsByParentId = async (parent_id) => {
    try {
        const studentNotifications = await model.Student_Parent.findAll({
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

        // Array to store alert messages
        let alertMessages = [];

        // Loop through the notifications to find 'alert' status and create alert messages
        const notifications = studentNotifications.map((record) => {
            // get all info from the call
            const student = record.student;
            const attendances = student.Attendances;

            // Duyệt qua từng thông báo
            attendances.forEach((attendance) => {
                const notifications = attendance.Notifications;

                notifications.forEach((notification) => {
                    if (notification.status === 'alert') {
                        alertMessages.push({
                            alert_message: `Alert message: ${notification.message}`,
                            notification_id: notification.notification_id,
                            student_name: student.name,
                            time_stamp: notification.time_stamp,
                            image: notification.image || null
                        });
                    }
                });
            });

            return {
                student_name: student.name,
                attendances: attendances.map((attendance) => ({
                    attendance_id: attendance.attendance_id,
                    notifications: attendance.Notifications.map((notification) => ({
                        notification_id: notification.notification_id,
                        time_stamp: notification.time_stamp,
                        message: notification.message,
                        image: notification.image,
                        status: notification.status
                    }))
                }))
            };
        });

        // Return the notifications and any alert messages
        return {
            alert_messages: alertMessages.length > 0 ? alertMessages : null,
            notifications
        };
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
                            model: model.Bus,
                            as: 'bus',
                            attributes: ['bus_id', 'license_plate'],
                        }
                    ]
                },
                {
                    model: model.Parent,
                    as: 'parent',
                    attributes: ['address'],
                    include: [
                        {
                            model: model.User,
                            as: 'user',
                            attributes: ['phone_number'],
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
            attributes: ['student_id'],
        });

        const student_id = studentParentRecord.student_id;

        await model.Student.update(
            { name: name, class: className },
            { where: { student_id: student_id } }
        );

        await model.Parent.update(
            { address: address },
            { where: { parent_id: parent_id } }
        );

        const parent = await model.Parent.findOne({
            where: { parent_id: parent_id },
            include: [{ model: model.User, as: 'user' }]
        });

        if (parent && parent.user) {
            await model.User.update(
                { phone_number: phone_number },
                { where: { user_id: parent.user.user_id } }
            );
        }

        return { message: 'Update successful' };
    } catch (error) {
        throw new Error('Error updating settings: ' + error.message);
    }
};
export const writeFeedback = async (parent_id, title, content) => {
    try {
        const parent = await model.Parent.findOne({
            where: { parent_id },
            attributes: ['user_id'],
        });

        const user_id = parent.user_id;

        return await model.Feedback.create({
            user_id,
            title,
            content,
        });

    } catch (error) {
        throw new Error('Error writing feedback: ' + error.message);
    }
};
