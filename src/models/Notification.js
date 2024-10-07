import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class Notification extends Model {
  static init(sequelize, DataTypes) {
  return super.init({
    notification_id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    attendance_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Attendance',
        key: 'attendance_id'
      }
    },
    time_stamp: {
      type: DataTypes.DATE,
      allowNull: false
    },
    message: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    image: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    status: {
      type: DataTypes.ENUM('common','alert'),
      allowNull: false
    }
  }, {
    sequelize,
    tableName: 'Notification',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "notification_id" },
        ]
      },
      {
        name: "attendance_id",
        using: "BTREE",
        fields: [
          { name: "attendance_id" },
        ]
      },
    ]
  });
  }
}
