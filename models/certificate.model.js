module.exports = (sequelize, DataTypes) => {
  return sequelize.define(
    'certificates',
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
        allowNull: false
      },
      virtualchannelId: {
        type: DataTypes.UUID,
        allowNull: false
      },
      type: {
        type: DataTypes.ENUM('opening', 'closing'),
        allowNull: false
      },
      data: {
        type: DataTypes.TEXT,
        allowNull: false
      },
      sig: {
        type: DataTypes.TEXT,
        allowNull: false
      },
      from: {
        type: DataTypes.TEXT,
        allowNull: false
      }
    },
    {
      tableName: 'certificates',
      timestamps: true
    }
  )
}
