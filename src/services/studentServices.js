// services/studentService.js
import initModels from '../models/init-models.js';
import sequelize from '../config/sequelize.js'; // Đảm bảo bạn đã export sequelize instance

const models = initModels(sequelize);

const getStudentsByParentId = async (parent_id) => {
  try {
    // Chỉ lấy danh sách student_id từ Student_Parent thông qua parent_id
    const studentParentRecords = await models.Student_Parent.findAll({
      where: { parent_id: parent_id },
      attributes: ['student_id'], // Chỉ lấy student_id
    });

    // Trả về danh sách student_id
    return studentParentRecords.map(record => record.student_id);
  } catch (error) {
    throw new Error('Error fetching student IDs for parent: ' + error.message);
  }
};

export default {
  getStudentsByParentId,
};
