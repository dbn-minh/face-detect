import initModels from "../models/init-models.js";
import sequelize from "../config/database.js";
import {Op} from "sequelize";
let model = initModels(sequelize);

// Phần này nên đưa vào websocket làm realtime, sẽ fetch được những thông báo mới
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

export const getStudentsInfo = async (teacher_id) => {
    try {
        // Lấy thông tin bus của teacher_id chỉ có 1 journey ongoing
        const bus = await model.Bus.findOne({
            where: { teacher_id: teacher_id },
            attributes: ['bus_id'],
            include: [
                {
                    model: model.Journey,
                    as: 'Journeys',
                    where: { status: 'ongoing' }, // Chỉ lấy journey đang ongoing
                    attributes: ['journey_id']
                }
            ]
        });

        if (!bus || bus.Journeys.length === 0) {
            return { error: 'No ongoing journey found for this teacher.' };
        }

        const journeyId = bus.Journeys[0].journey_id;

        // Lấy tất cả học sinh trên bus này
        const students = await model.Student.findAll({
            attributes: ['student_id', 'name', 'class', 'avatar'],
            include: [
                {
                    model: model.Attendance,
                    as: 'Attendances',
                    where: { journey_id: journeyId },
                    attributes: ['status'],
                }
            ]
        });

        // Chia học sinh thành danh sách có mặt (boarded) và vắng mặt (not alighted)
        const presentStudents = [];
        const absentStudents = [];

        students.forEach(student => {
            const attendance = student.Attendances[0]; // Mỗi học sinh có 1 attendance cho journey_id đang ongoing
            if (attendance.status === 'boarded' || attendance.status === 'alighted') {
                presentStudents.push(student);
            } else if (attendance.status === 'absent') {
                absentStudents.push(student);
            }
        });

        // Trả về kết quả với tổng số lượng học sinh và danh sách học sinh có mặt, vắng mặt
        return {
            absentStudents: absentStudents.map(student => ({
                student_id: student.student_id,
                name: student.name,
                class: student.class,
                avatar: student.avatar
            })),
            presentCount: presentStudents.length,
            totalCount: presentStudents.length + absentStudents.length,
            presentStudents: presentStudents.map(student => ({
                student_id: student.student_id,
                name: student.name,
                class: student.class,
                avatar: student.avatar
            }))
        };
    } catch (error) {
        return { error: 'Error fetching students information: ' + error.message };
    }
};

export const getSettingOfTeacher = async (teacher_id) => {
    try {
        // Fetch the bus details and include the teacher's user information
        const bus = await model.Bus.findOne({
            where: { teacher_id: teacher_id },
            attributes: ['bus_id', 'license_plate'],
            include: [
                {
                    model: model.Teacher,
                    as: 'teacher',
                    attributes: ['teacher_id','department', 'user_id'],
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
            throw new Error('No bus found for this teacher.');
        }

        // Prepare the setting response
        return {
            bus_id: bus.bus_id,
            license_plate: bus.license_plate,
            teacher: {
                teacher_id: bus.teacher.teacher_id,
                department: bus.teacher.department,
                name: bus.teacher.user.name,
                email: bus.teacher.user.email,
                phone_number: bus.teacher.user.phone_number
            }
        };
    } catch (error) {
        throw new Error('Error fetching setting for teacher: ' + error.message);
    }
};

export const updateProfileOfTeacher = async (teacher_id, updatedData) => {
    const { name, email, phone_number, department } = updatedData;

    try {
        // Find the teacher by teacher_id
        const teacher = await model.Teacher.findOne({
            where: { teacher_id },
            include: [
                {
                    model: model.User,
                    as: 'user'
                }
            ]
        });

        if (!teacher) {
            throw new Error('Teacher not found.');
        }

        // Update the teacher's department
        teacher.department = department || teacher.department;  // Update only if provided
        await teacher.save();

        // Update the user's profile (name, email, phone number)
        const user = teacher.user;
        user.name = name || user.name;  // Update only if provided
        user.email = email || user.email;
        user.phone_number = phone_number || user.phone_number;
        await user.save();

        return {
            message: 'Profile updated successfully',
            updatedProfile: {
                teacher_id: teacher.teacher_id,
                department: teacher.department,
                name: user.name,
                email: user.email,
                phone_number: user.phone_number
            }
        };
    } catch (error) {
        throw new Error('Error updating profile: ' + error.message);
    }
};
export const writeFeedback = async (teacher_id, title, content) => {
    try {
        const teacher = await model.Teacher.findOne({
            where: { teacher_id },
            attributes: ['user_id'],
        });

        const user_id = teacher.user_id;

        return await model.Feedback.create({
            user_id,
            title,
            content,
        });

    } catch (error) {
        throw new Error('Error writing feedback: ' + error.message);
    }
};



