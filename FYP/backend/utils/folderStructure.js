import fs from 'fs';
import path from 'path';

const DIFFICULTIES = ['easy', 'medium', 'difficult'];
const UPLOADS_DIR = 'uploads';

export const createFolderStructure = async (companyId, topicId) => {
  try {
    const companyPath = path.join(UPLOADS_DIR, companyId);
    const topicPath = path.join(companyPath, topicId);

    if (!fs.existsSync(companyPath)) {
      fs.mkdirSync(companyPath, { recursive: true });
    }

    if (!fs.existsSync(topicPath)) {
      fs.mkdirSync(topicPath, { recursive: true });
    }

    for (const difficulty of DIFFICULTIES) {
      const diffPath = path.join(topicPath, difficulty);
      if (!fs.existsSync(diffPath)) {
        fs.mkdirSync(diffPath, { recursive: true });
      }
    }

    return {
      companyPath,
      topicPath,
      folders: {
        easy: path.join(topicPath, 'easy'),
        medium: path.join(topicPath, 'medium'),
        difficult: path.join(topicPath, 'difficult')
      }
    };
  } catch (error) {
    throw new Error(`Failed to create folder structure: ${error.message}`);
  }
};

export const getTopicFolderPath = (companyId, topicId) => {
  return path.join(UPLOADS_DIR, companyId, topicId);
};

export const getDifficultyFolderPath = (companyId, topicId, difficulty) => {
  return path.join(UPLOADS_DIR, companyId, topicId, difficulty);
};

export const getFilesFromDifficulty = (companyId, topicId, difficulty) => {
  const folderPath = getDifficultyFolderPath(companyId, topicId, difficulty);

  if (!fs.existsSync(folderPath)) {
    return [];
  }

  return fs.readdirSync(folderPath).filter(file => file.endsWith('.pdf'));
};

export const validateDifficulty = (difficulty) => {
  return DIFFICULTIES.includes(difficulty.toLowerCase());
};

export const getAllFilesFromTopic = (companyId, topicId) => {
  const files = {};

  for (const difficulty of DIFFICULTIES) {
    const folderPath = getDifficultyFolderPath(companyId, topicId, difficulty);
    if (fs.existsSync(folderPath)) {
      files[difficulty] = fs.readdirSync(folderPath).filter(file => file.endsWith('.pdf'));
    } else {
      files[difficulty] = [];
    }
  }

  return files;
};
