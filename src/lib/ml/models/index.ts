import { DataTypes } from 'sequelize';
import { sequelize } from '../MLManager';

export const MLModel = sequelize.define('ml_models', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  version: {
    type: DataTypes.STRING,
    allowNull: false
  },
  architecture: {
    type: DataTypes.JSONB,
    allowNull: true
  },
  metrics: {
    type: DataTypes.JSONB,
    allowNull: true
  }
});

export const TrainingMetric = sequelize.define('training_metrics', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  model_id: {
    type: DataTypes.INTEGER,
    references: {
      model: MLModel,
      key: 'id'
    }
  },
  epoch: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  loss: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  accuracy: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  metrics: {
    type: DataTypes.JSONB,
    allowNull: true
  }
});

export const Embedding = sequelize.define('embeddings', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  vector: {
    type: DataTypes.ARRAY(DataTypes.FLOAT),
    allowNull: false
  },
  metadata: {
    type: DataTypes.JSONB,
    allowNull: true
  }
});
