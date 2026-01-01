import { useState } from 'react';
import { assessmentAPI } from '../services/api';
import '../styles/PDFParser.css';

const PDFQuestionParser = ({ companies, topics, onAssessmentCreated }) => {
  const [pdfFile, setPdfFile] = useState(null);
  const [parsedQuestions, setParsedQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    companyId: '',
    topicId: '',
    duration: 60,
    totalMarks: 100,
    passingMarks: 40
  });

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file && file.type === 'application/pdf') {
      setPdfFile(file);
    } else {
      alert('Please select a PDF file');
    }
  };

  const handleParsePDF = async () => {
    if (!pdfFile) {
      alert('Please select a PDF file');
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('pdf', pdfFile);

      const response = await assessmentAPI.parsePDF(formData);
      setParsedQuestions(response.data.questions);
      alert(`Successfully parsed ${response.data.questionsCount} questions!`);
    } catch (error) {
      alert('Failed to parse PDF: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEditQuestion = (index, field, value) => {
    const updated = [...parsedQuestions];
    updated[index][field] = value;
    setParsedQuestions(updated);
  };

  const handleRemoveQuestion = (index) => {
    setParsedQuestions(parsedQuestions.filter((_, i) => i !== index));
  };

  const handleCreateAssessment = async () => {
    if (!formData.title || parsedQuestions.length === 0) {
      alert('Please provide assessment title and at least one question');
      return;
    }

    setLoading(true);
    try {
      await assessmentAPI.createFromPDF({
        ...formData,
        questions: parsedQuestions
      });
      alert('Assessment created successfully!');
      setPdfFile(null);
      setParsedQuestions([]);
      setFormData({
        title: '',
        description: '',
        companyId: '',
        topicId: '',
        duration: 60,
        totalMarks: 100,
        passingMarks: 40
      });
      if (onAssessmentCreated) onAssessmentCreated();
    } catch (error) {
      alert('Failed to create assessment: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pdf-parser">
      <div className="parser-section">
        <h3>Upload PDF</h3>
        <input
          type="file"
          accept=".pdf"
          onChange={handleFileSelect}
          className="file-input"
        />
        {pdfFile && <p className="file-name">{pdfFile.name}</p>}
        <button onClick={handleParsePDF} disabled={!pdfFile || loading} className="parse-btn">
          {loading ? 'Parsing...' : 'Parse PDF'}
        </button>
      </div>

      {parsedQuestions.length > 0 && (
        <>
          <div className="parser-section">
            <h3>Assessment Details</h3>
            
            <div className="form-grid">
              <input
                type="text"
                placeholder="Assessment Title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="form-input"
              />
              <input
                type="number"
                placeholder="Duration (minutes)"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
                className="form-input"
              />
              <input
                type="number"
                placeholder="Total Marks"
                value={formData.totalMarks}
                onChange={(e) => setFormData({ ...formData, totalMarks: parseInt(e.target.value) })}
                className="form-input"
              />
              <input
                type="number"
                placeholder="Passing Marks"
                value={formData.passingMarks}
                onChange={(e) => setFormData({ ...formData, passingMarks: parseInt(e.target.value) })}
                className="form-input"
              />
            </div>
            <textarea
              placeholder="Description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="form-textarea"
              rows={3}
            />
          </div>

          <div className="parser-section">
            <h3>Parsed Questions ({parsedQuestions.length})</h3>
            <div className="questions-list">
              {parsedQuestions.map((q, index) => (
                <div key={index} className="question-item-parsed">
                  <div className="question-header">
                    <span className="question-number">Q{index + 1}</span>
                    <button onClick={() => handleRemoveQuestion(index)} className="remove-btn">Remove</button>
                  </div>
                  <textarea
                    value={q.question}
                    onChange={(e) => handleEditQuestion(index, 'question', e.target.value)}
                    className="question-input"
                    rows={2}
                  />
                  <div className="options-grid">
                    {q.options.map((opt, optIndex) => (
                      <input
                        key={optIndex}
                        type="text"
                        value={opt}
                        onChange={(e) => {
                          const newOptions = [...q.options];
                          newOptions[optIndex] = e.target.value;
                          handleEditQuestion(index, 'options', newOptions);
                        }}
                        className="option-input"
                      />
                    ))}
                  </div>
                  <div className="question-meta">
                    <select
                      value={q.correctAnswer}
                      onChange={(e) => handleEditQuestion(index, 'correctAnswer', e.target.value)}
                      className="meta-select"
                    >
                      <option value="">Correct Answer</option>
                      {q.options.map((opt, i) => (
                        <option key={i} value={opt}>{opt}</option>
                      ))}
                    </select>
                    <select
                      value={q.section}
                      onChange={(e) => handleEditQuestion(index, 'section', e.target.value)}
                      className="meta-select"
                    >
                      <option value="aptitude">Aptitude</option>
                      <option value="reasoning">Reasoning</option>
                      <option value="verbal">Verbal</option>
                      <option value="coding">Coding</option>
                    </select>
                    <select
                      value={q.difficulty}
                      onChange={(e) => handleEditQuestion(index, 'difficulty', e.target.value)}
                      className="meta-select"
                    >
                      <option value="easy">Easy</option>
                      <option value="medium">Medium</option>
                      <option value="hard">Hard</option>
                    </select>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button onClick={handleCreateAssessment} disabled={loading} className="create-btn">
            {loading ? 'Creating...' : 'Create Assessment'}
          </button>
        </>
      )}
    </div>
  );
};

export default PDFQuestionParser;
