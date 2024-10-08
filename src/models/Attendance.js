import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class Attendance extends Model {
  static init(sequelize, DataTypes) {
  return super.init({
    attendance_id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    student_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Student',
        key: 'student_id'
      }
    },
    journey_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Journey',
        key: 'journey_id'
      }
    },
    boarded: {
      type: DataTypes.DATE,
      allowNull: true
    },
    alighted: {
      type: DataTypes.DATE,
      allowNull: true
    },
    status: {
      type: DataTypes.ENUM('boarded','alighted','not alighted','completed'),
      allowNull: true,
      defaultValue: "boarded"
    }
  }, {
    sequelize,
    tableName: 'Attendance',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "attendance_id" },
        ]
      },
      {
        name: "student_id",
        using: "BTREE",
        fields: [
          { name: "student_id" },
        ]
      },
      {
        name: "journey_id",
        using: "BTREE",
        fields: [
          { name: "journey_id" },
        ]
      },
    ]
  });
  }
}
