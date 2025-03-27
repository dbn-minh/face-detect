import initModels from "../models/init-models.js";
import sequelize from "../config/database.js";
let model = initModels(sequelize);

export const getAllChildrenInformationByParentId = async (parent_id) => {
    try {
        const studentInfo = await model.Student_Parent.findAll({
            where: { parent_id: parent_id },
            attributes: ['student_id'],
            include: [
                {
                    model: model.Parent,
                    as: 'parent',
                    attributes: ['parent_id', 'user_id', "address", "relationship"],
                    include: [
                        {
                            model: model.User,
                            as: 'user',
                            attributes: ['user_id', 'name', 'phone_number', 'email'],
                        }
                    ]
                },
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
            parent: record.parent
                ? {
                    parent_id: record.parent.user_id,
                    "Parent information": record.parent
                        ?{
                            address: record.parent.address,
                            relationship: record.parent.relationship,
                            name: record.parent.user.name,
                            phone_number: record.parent.user.phone_number,
                            email: record.parent.user.email,
                        }
                        :null,
                }
                :null,
            bus: record.student.bus
                ? {
                    bus_id: record.student.bus.bus_id,
                    current_location: record.student.bus.current_location || 'Unknown location',  // Use current_location
                    teacher: record.student.bus.teacher
                        ? {
                            teacher_id: record.student.bus.teacher.teacher_id,
                            "Teacher information": record.student.bus.teacher.user
                                ? {
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
                    attributes: ['student_id', 'name'],
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
                                {
                                    model: model.Journey,
                                    as: 'journey',
                                    attributes: ['bus_id'],
                                    include: [
                                        {
                                            model: model.Bus,
                                            as: 'bus',
                                            attributes: ['status', 'license_plate', 'current_location']
                                        }
                                    ]
                                }
                            ],
                        },
                    ],
                },
            ],
        });

        let notificationsByStudent = [];

        // Loop through notifications to organize by student and prioritize alert messages, bus breakdowns, and general notifications
        studentNotifications.forEach((record) => {
            const student = record.student;
            const attendances = student.Attendances;

            // Create an entry for each student in the notifications array
            const studentNotification = {
                student_id: student.student_id,
                student_name: student.name,
                alert_messages: [],
                bus_breakdown_info: null,
                general_notifications: []
            };

            attendances.forEach((attendance) => {
                const notifications = attendance.Notifications;
                const bus = attendance.journey?.bus;

                // Check if the bus is broken and set bus breakdown info if applicable
                if (bus && bus.status === 'broken' && !studentNotification.bus_breakdown_info) {
                    studentNotification.bus_breakdown_info = {
                        message: "The bus has broken down and is not operational.",
                        bus_id: bus.bus_id,
                        license_plate: bus.license_plate,
                        current_location: bus.current_location
                    };
                }

                // Collect alert and general notifications separately
                notifications.forEach((notification) => {
                    if (notification.status === 'alert') {
                        studentNotification.alert_messages.push({
                            message: notification.message,
                            notification_id: notification.notification_id,
                            time_stamp: notification.time_stamp,
                            image: notification.image || null
                        });
                    } else {
                        studentNotification.general_notifications.push({
                            message: notification.message,
                            notification_id: notification.notification_id,
                            time_stamp: notification.time_stamp,
                            image: notification.image || null,
                            status: notification.status
                        });
                    }
                });
            });

            // Push the constructed student notification to the array
            notificationsByStudent.push(studentNotification);
        });

        return notificationsByStudent;

    } catch (error) {
        throw new Error('Error fetching notifications: ' + error.message);
    }
};



export const getSetting = async (parent_id) => {
    try {
        const setting =  await model.Student_Parent.findAll({
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
        // Map the result to structure the payload
        return setting.map((record) => ({
            student_id: record.student_id,
            student_name: record.student.name,
            student_class: record.student.class,
            student_avatar: record.student.avatar,
            student_feature_vector: record.student.feature_vector,
            bus: record.student.bus
                ? {
                    bus_id: record.student.bus.bus_id,
                    license_plate: record.student.bus.license_plate
                }
                : null,
            parent: record.parent
                ? {
                    parent_address: record.parent.address,
                    phone_number: record.parent.user.phone_number
                }
                : null
        }));

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
