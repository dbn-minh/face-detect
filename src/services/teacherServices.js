import initModels from "../models/init-models.js";
import sequelize from "../config/database.js";
let model = initModels(sequelize);
import { Op } from 'sequelize';

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
            alertMessages: alertMessages.length > 0 ? alertMessages : null,
            notifications
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
            data: {
                driver: driver,
                alertMessages: alertMessages.length > 0 ? alertMessages : null,
                notifications: notifications
            }
        };

    } catch (error) {
        return { error: error.message, data: null };
    }
};

export const getNotificationsByTeacherId = async (teacher_id) => {
    try {
        const bus = await model.Bus.findOne({
            where: {teacher_id},
            attributes: ['bus_id'],
        })
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
            data: {
                alertMessages: alertMessages.length > 0 ? alertMessages : null,
                notifications: notifications
            }
        };
    } catch (error) {
        throw new Error('Error writing feedback: ' + error.message);
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

export const updateAttendanceStatus = async (attendance_id, status) => {
    const time_stamp = new Date();
    // Kiểm tra xem status có hợp lệ không
    if (status !== 'boarded' && status !== 'alighted') {
        return { success: false, message: `Invalid status: ${status}. Accepted values are 'boarded' or 'alighted'.` };
    }

    try {
        // Nếu status là 'boarded', cập nhật thời gian boarded và xóa dữ liệu cũ của alighted
        if (status === 'boarded') {
            // Đặt thời gian boarded, xóa alighted và cập nhật status thành boarded
            await model.Attendance.update(
                { boarded: time_stamp, alighted: null, status: 'boarded' },
                { where: { attendance_id } }
            );

        } else if (status === 'alighted') {
            await model.Attendance.update(
                { alighted: time_stamp, status: 'alighted' },
                { where: { attendance_id } }
            );
        }
        return { success: true, message: 'Attendance status updated successfully.' };
    } catch (error) {
        throw new Error('Error updating attendance status: ' + error.message);
    }
};

export const getValidStudentAttendances = async (teacher_id) => {
    try {
        // Lấy bus_id từ teacher_id và tìm journey đang hoạt động
        const busRecord = await model.Bus.findOne({
            where: { teacher_id },
            attributes: ['bus_id'],
            include: [
                {
                    model: model.Journey,
                    as: 'Journeys',
                    where: { status: 'ongoing' },
                    attributes: ['journey_id']
                }
            ]
        });

        const journey_id = busRecord.Journeys[0].journey_id;

        // Lấy danh sách học sinh thuộc journey đang hoạt động
        const students = await model.Attendance.findAll({
            where: { journey_id },
            attributes: ['attendance_id'],
            include: [
                {
                    model: model.Student,
                    as: 'student',
                    attributes: ['student_id', 'name']
                }
            ]
        });

        // Trả về danh sách hợp lệ của học sinh với attendance_id và tên
        return students.map(student => ({
            attendance_id: student.attendance_id,
            student_id: student.student.student_id,
            name: student.student.name
        }));
    } catch (error) {
        throw new Error('Error fetching students by teacher ID: ' + error.message);
    }
};

export const createBrokenPhotoNotification = async (teacher_id, attendance_id, filePath, status) => {
    try {
        // Lấy danh sách học sinh hợp lệ từ `teacher_id`
        const validStudents = await getValidStudentAttendances(teacher_id);

        // Kiểm tra nếu `attendance_id` nằm trong danh sách hợp lệ
        const isValidAttendance = validStudents.some(student => student.attendance_id === parseInt(attendance_id, 10));

        if (!isValidAttendance) {
            return { success: false, message: 'Invalid attendance ID for this teacher and journey.' };
        }

        // Xóa thông báo cũ nếu `status` là 'boarded'
        if (status === 'boarded') {
            await model.Notification.destroy({
                where: {
                    attendance_id,
                    [Op.or]: [
                        { message: { [Op.like]: '%alighted%' } },
                        { message: { [Op.like]: '%boarded%' } }
                    ]
                }
            });
        }

        // Lấy tên học sinh từ danh sách hợp lệ
        const studentName = validStudents.find(student => student.attendance_id === parseInt(attendance_id, 10)).name;
        const message = `${studentName} has ${status === 'boarded' ? 'boarded' : 'alighted'} from the bus`;

        // Tạo bản ghi Notification mới
        const newNotification = await model.Notification.create({
            attendance_id,
            time_stamp: new Date(),
            message,
            image: filePath,
            status: 'common'
        });

        return { success: true, data: newNotification };

    } catch (error) {
        throw new Error('Error creating broken photo notification: ' + error.message);
    }
};

export const createEmergencyNotification = async (teacher_id, attendance_id, filePath) => {
    try {
        const validStudents = await getValidStudentAttendances(teacher_id);

        const isValidAttendance = validStudents.some(student => student.attendance_id === parseInt(attendance_id, 10));

        if (!isValidAttendance) {
            return { success: false, message: 'Invalid attendance ID for this teacher and journey.' };
        }

        const studentName = validStudents.find(student => student.attendance_id === parseInt(attendance_id, 10)).name;
        const message = `Emergency alert: ${studentName} is in need of urgent assistance`;

        // Tạo bản ghi Notification mới với status là 'alert'
        const newNotification = await model.Notification.create({
            attendance_id,
            time_stamp: new Date(),
            message,
            image: filePath,
            status: 'alert'
        });

        return { success: true, data: newNotification };

    } catch (error) {
        throw new Error('Error creating emergency alert notification: ' + error.message);
    }
};






