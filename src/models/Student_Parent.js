import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class Student_Parent extends Model {
  static init(sequelize, DataTypes) {
  return super.init({
    student_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      references: {
        model: 'Student',
        key: 'student_id'
      }
    },
    parent_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      references: {
        model: 'Parent',
        key: 'parent_id'
      }
    }
  }, {
    sequelize,
    tableName: 'Student_Parent',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "student_id" },
          { name: "parent_id" },
        ]
      },
      {
        name: "parent_id",
        using: "BTREE",
        fields: [
          { name: "parent_id" },
        ]
      },
    ]
  });
  }
}
