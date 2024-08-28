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
    license_plate: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    driver_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Driver',
        key: 'driver_id'
      }
    },
    status: {
      type: DataTypes.BOOLEAN,
      allowNull: false
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
        using: "BTREE",
        fields: [
          { name: "driver_id" },
        ]
      },
    ]
  });
  }
}
