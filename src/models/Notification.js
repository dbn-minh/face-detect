import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class Notification extends Model {
  static init(sequelize, DataTypes) {
  return super.init({
    notificationID: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    attendanceID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Attendance',
        key: 'attendanceID'
      }
    },
    timeStamp: {
      type: DataTypes.DATE,
      allowNull: false
    },
    message: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    image: {
      type: DataTypes.BLOB,
      allowNull: true
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
          { name: "notificationID" },
        ]
      },
      {
        name: "attendanceID",
        using: "BTREE",
        fields: [
          { name: "attendanceID" },
        ]
      },
    ]
  });
  }
}
