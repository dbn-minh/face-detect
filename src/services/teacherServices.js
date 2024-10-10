import initModels from "../models/init-models.js";
import sequelize from "../config/database.js";
import {Op} from "sequelize";
let model = initModels(sequelize);
// Phần này nên đưa vào websocket, sẽ fetch được những thông báo mới
export const getNotificationsByStudentIdService = async (student_id) => {
    try {
        const attendances = await model.Attendance.findAll({
            where: { student_id },
            include: [
                {
                    model: model.Notification,
                    as: 'Notifications',
                    attributes: ['notification_id', 'time_stamp', 'message', 'image', 'status']
                }
            ]
        });

        const notifications = [];
        const alertMessages = [];

        // Lặp qua tất cả Attendance để lọc Notification và tìm alert
        for (const attendance of attendances) {
            for (const notification of attendance.Notifications) {
                const notificationData = {
                    notification_id: notification.notification_id,
                    time_stamp: notification.time_stamp,
                    message: notification.message,
                    image: notification.image,
                    status: notification.status
                };

                notifications.push(notificationData);

                // Nếu là alert thì thêm vào alertMessages
                if (notification.status === 'alert') {
                    alertMessages.push({
                        alert_message: `Alert message: ${notification.message}`,
                        notification_id: notification.notification_id,
                        time_stamp: notification.time_stamp,
                        image: notification.image || null
                    });
                }
            }
        }

        return {
            notifications,
            alertMessages: alertMessages.length > 0 ? alertMessages : null
        };
    } catch (error) {
        throw new Error('Error fetching notifications: ' + error.message);
    }
};

export const getDetailsOfTeacher = async (teacher_id) => {
    try {
        const bus = await model.Bus.findOne({
            where: { teacher_id },
            include: [
                {
                    model: model.Driver,
                    as: 'driver',
                    include: [
                        {
                            model: model.User,
                            as: 'user',
                            attributes: ['user_id', 'name', 'email', 'phone_number']
                        }
                    ]
                }
            ]
        });

        if (!bus || !bus.driver) {
            return { error: "No driver found for this teacher", data: null };
        }

        const driver = {
            driver_id: bus.driver.driver_id,
            license_number: bus.driver.license_number,
            name: bus.driver.user.name,
            email: bus.driver.user.email,
            phone_number: bus.driver.user.phone_number,
            license_plate: bus.license_plate
        };

        // Lấy tất cả các học sinh trên bus và gọi service getNotificationsByStudentIdService
        const students = await model.Student.findAll({
            where: { bus_id: bus.bus_id }
        });

        const notifications = [];
        const alertMessages = [];

        for (const student of students) {
            const { notifications: studentNotifications, alertMessages: studentAlerts } = await getNotificationsByStudentIdService(student.student_id);

            notifications.push(...studentNotifications);
            if (studentAlerts) {
                alertMessages.push(...studentAlerts);
            }
        }

        return {
            error: null,
            data: {
                driver: driver,
                notifications: notifications,
                alertMessages: alertMessages.length > 0 ? alertMessages : null
            }
        };

    } catch (error) {
        return { error: error.message, data: null };
    }
};

