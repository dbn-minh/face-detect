import _sequelize from 'sequelize';
const { Model, Sequelize } = _sequelize;

export default class Bus extends Model {
  static init(sequelize, DataTypes) {
  return super.init({
    busID: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    licensePlate: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    driverID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Driver',
        key: 'driverID'
      }
    },
    currentLocation: {
      type: "POINT",
      allowNull: true
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
          { name: "busID" },
        ]
      },
      {
        name: "driverID",
        using: "BTREE",
        fields: [
          { name: "driverID" },
        ]
      },
    ]
  });
  }
}
