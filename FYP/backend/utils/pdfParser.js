import fs from 'fs';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const pdfParse = require('pdf-parse'); // ✅ correct way

export async function parseQuestionsFromPDF(filePath) {
  try {
    const dataBuffer = fs.readFileSync(filePath);

    const data = await pdfParse(dataBuffer);
    const text = data.text;

    const questions = extractQuestions(text);

    fs.unlinkSync(filePath);

    return questions;
  } catch (error) {
    throw new Error('Failed to parse PDF: ' + error.message);
  }
}


function extractQuestions(text) {
  const questions = [];
  const lines = text.split('\n').map(line => line.trim()).filter(line => line);

  let currentQuestion = null;
  let optionCounter = 0;

  const questionPatterns = [
    /^(\d+)[.)]\s*(.+)/,
    /^Q[.\s]*(\d+)[.):\s]*(.+)/i,
    /^Question\s*(\d+)[.):\s]*(.+)/i
  ];

  const optionPatterns = [
    /^([A-D])[.)]\s*(.+)/i,
    /^([1-4])[.)]\s*(.+)/,
    /^\(([A-D])\)\s*(.+)/i
  ];

  const answerPatterns = [
    /^Answer[:\s]*([A-D])/i,
    /^Correct[:\s]*([A-D])/i,
    /^Ans[:\s]*([A-D])/i
  ];

  const difficultyPatterns = [
    /\[?(Easy|Medium|Hard)\]?/i,
    /Difficulty[:\s]*(Easy|Medium|Hard)/i
  ];

  const sectionPatterns = [
    /\[?(Aptitude|Reasoning|Verbal|Coding)\]?/i,
    /Section[:\s]*(Aptitude|Reasoning|Verbal|Coding)/i
  ];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    let isQuestion = false;
    for (const pattern of questionPatterns) {
      const match = line.match(pattern);
      if (match) {
        if (currentQuestion && currentQuestion.question) {
          questions.push(currentQuestion);
        }

        currentQuestion = {
          type: 'mcq',
          question: match[2].trim(),
          options: [],
          correctAnswer: '',
          difficulty: 'medium',
          section: 'aptitude',
          timeLimit: 60
        };
        optionCounter = 0;
        isQuestion = true;
        break;
      }
    }

    if (isQuestion) continue;

    if (currentQuestion) {
      let isOption = false;
      for (const pattern of optionPatterns) {
        const match = line.match(pattern);
        if (match && optionCounter < 4) {
          currentQuestion.options.push(match[2].trim());
          optionCounter++;
          isOption = true;
          break;
        }
      }

      if (isOption) continue;

      for (const pattern of answerPatterns) {
        const match = line.match(pattern);
        if (match) {
          const answerIndex = match[1].toUpperCase().charCodeAt(0) - 65;
          if (answerIndex >= 0 && answerIndex < currentQuestion.options.length) {
            currentQuestion.correctAnswer = currentQuestion.options[answerIndex];
          }
          break;
        }
      }

      for (const pattern of difficultyPatterns) {
        const match = line.match(pattern);
        if (match) {
          currentQuestion.difficulty = match[1].toLowerCase();
          break;
        }
      }

      for (const pattern of sectionPatterns) {
        const match = line.match(pattern);
        if (match) {
          currentQuestion.section = match[1].toLowerCase();
          break;
        }
      }
    }
  }

  if (currentQuestion && currentQuestion.question) {
    questions.push(currentQuestion);
  }

  return questions.filter(q => q.question && q.options.length === 4);
}
