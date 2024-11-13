import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class Bus extends Model {
  static init(sequelize, DataTypes) {
  return super.init({
    bus_id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    driver_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'Driver',
        key: 'driver_id'
      },
      unique: "Bus_ibfk_1"
    },
    teacher_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'Teacher',
        key: 'teacher_id'
      },
      unique: "Bus_ibfk_2"
    },
    capacity: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    license_plate: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    current_location: {
      type: "POINT",
      allowNull: true
    },
    status: {
      type: DataTypes.ENUM('ongoing','stopped','broken'),
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'Bus',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "bus_id" },
        ]
      },
      {
        name: "driver_id",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "driver_id" },
        ]
      },
      {
        name: "teacher_id",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "teacher_id" },
        ]
      },
    ]
  });
  }
}
