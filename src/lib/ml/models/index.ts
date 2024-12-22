import { DataType, Model } from 'sequelize';
import { sequelize } from '../MLManager';

export const MLModel = sequelize.define('ml_models', {
  id: {
    type: DataType.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataType.STRING,
    allowNull: false
  },
  version: {
    type: DataType.STRING,
    allowNull: false
  },
  architecture: {
    type: DataType.JSONB,
    allowNull: true
  },
  metrics: {
    type: DataType.JSONB,
    allowNull: true
  }
});

export const TrainingMetric = sequelize.define('training_metrics', {
  id: {
    type: DataType.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  model_id: {
    type: DataType.INTEGER,
    references: {
      model: MLModel,
      key: 'id'
    }
  },
  epoch: {
    type: DataType.INTEGER,
    allowNull: false
  },
  loss: {
    type: DataType.FLOAT,
    allowNull: false
  },
  accuracy: {
    type: DataType.FLOAT,
    allowNull: false
  },
  metrics: {
    type: DataType.JSONB,
    allowNull: true
  }
});

export const Embedding = sequelize.define('embeddings', {
  id: {
    type: DataType.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  vector: {
    type: DataType.ARRAY(DataType.FLOAT),
    allowNull: false
  },
  metadata: {
    type: DataType.JSONB,
    allowNull: true
  }
});