module.exports = (sequelize, DataTypes) => {
  return sequelize.define(
    'virtualtransactions',
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
        allowNull: false
      },
      virtualchannelId: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      sigA: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      sigB: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      balanceA: {
        type: DataTypes.TEXT,
        allowNull: false
      },
      balanceB: {
        type: DataTypes.TEXT,
        allowNull: false
      },
      nonce: {
        type: DataTypes.INTEGER,
        allowNull: false
      }
    },
    {
      tableName: 'virtualtransactions',
      timestamps: true
    }
  )
}
