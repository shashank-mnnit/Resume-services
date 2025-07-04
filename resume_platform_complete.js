// components/ResumeIntelligencePlatform.js
import React, { useState, useRef, useEffect } from 'react';
import { Upload, FileText, Target, Star, RefreshCw, Download, Search, Zap, CheckCircle, AlertCircle, TrendingUp, Loader2, Copy, ExternalLink } from 'lucide-react';
import axios from 'axios';

const ResumeIntelligencePlatform = () => {
  const [activeTab, setActiveTab] = useState('analyzer');
  const [uploadedFile, setUploadedFile] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [rewriteSettings, setRewriteSettings] = useState({
    tone: 'achievement-focused',
    role: 'Software Engineer',
    options: {
      optimizeKeywords: true,
      quantifyAchievements: true,
      improveFormatting: true,
      enhanceSummary: true,
    }
  });
  const [coverLetterData, setCoverLetterData] = useState({
    company: '',
    position: '',
    experience: '',
    tone: 'professional'
  });
  const [jobDescription, setJobDescription] = useState('');
  const [extractedData, setExtractedData] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [rewrittenResume, setRewrittenResume] = useState('');
  const [generatedCoverLetter, setGeneratedCoverLetter] = useState('');
  const [templates, setTemplates] = useState([]);
  const [loadingTemplates, setLoadingTemplates] = useState(false);
  const fileInputRef = useRef(null);

  // Load templates on component mount
  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    setLoadingTemplates(true);
    try {
      const response = await axios.get('/api/get-templates');
      if (response.data.success) {
        setTemplates(response.data.templates);
      }
    } catch (error) {
      console.error('Error loading templates:', error);
    } finally {
      setLoadingTemplates(false);
    }
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (file) {
      setUploadedFile(file);
      await analyzeResume(file);
    }
  };

  const analyzeResume = async (file) => {
    setIsAnalyzing(true);
    setAnalysis(null);
    
    try {
      const formData = new FormData();
      formData.append('resume', file);
      formData.append('targetRole', rewriteSettings.role);

      const response = await axios.post('/api/analyze-resume', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.success) {
        setAnalysis(response.data.analysis);
      } else {
        throw new Error('Analysis failed');
      }
    } catch (error) {
      console.error('Error analyzing resume:', error);
      alert('Failed to analyze resume. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const rewriteResume = async () => {
    if (!uploadedFile) {
      alert('Please upload a resume first');
      return;
    }

    setIsProcessing(true);
    try {
      // Extract text from the uploaded file first
      const formData = new FormData();
      formData.append('resume', uploadedFile);
      
      const extractResponse = await axios.post('/api/analyze-resume', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (extractResponse.data.success) {
        // Use the extracted text for rewriting
        const response = await axios.post('/api/rewrite-resume', {
          resumeText: extractResponse.data.extractedText || 'Resume text extracted from file',
          tone: rewriteSettings.tone,
          targetRole: rewriteSettings.role,
          options: rewriteSettings.options,
        });

        if (response.data.success) {
          setRewrittenResume(response.data.rewrittenResume);
        }
      }
    } catch (error) {
      console.error('Error rewriting resume:', error);
      alert('Failed to rewrite resume. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const generateCoverLetter = async () => {
    if (!coverLetterData.company || !coverLetterData.position) {
      alert('Please fill in company and position fields');
      return;
    }

    setIsProcessing(true);
    try {
      const response = await axios.post('/api/generate-cover-letter', {
        company: coverLetterData.company,
        position: coverLetterData.position,
        experience: coverLetterData.experience,
        tone: coverLetterData.tone,
      });

      if (response.data.success) {
        setGeneratedCoverLetter(response.data.coverLetter);
      }
    } catch (error) {
      console.error('Error generating cover letter:', error);
      alert('Failed to generate cover letter. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const parseJobDescription = async () => {
    if (!jobDescription) {
      alert('Please enter a job description');
      return;
    }

    setIsProcessing(true);
    try {
      const response = await axios.post('/api/parse-job-description', {
        jobDescription,
      });

      if (response.data.success) {
        setExtractedData(response.data.analysis);
      }
    } catch (error) {
      console.error('Error parsing job description:', error);
      alert('Failed to parse job description. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadText = (content, filename) => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard!');
  };

  const ScoreCard = ({ score, label, color = 'blue' }) => (
    <div className={`bg-white p-4 rounded-lg shadow-md border-l-4 border-${color}-500`}>
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-600">{label}</span>
        <span className={`text-2xl font-bold text-${color}-600`}>{score}</span>
      </div>
    </div>
  );

  const KeywordBadge = ({ keyword, type }) => {
    const colors = {
      missing: 'bg-red-100 text-red-800',
      suggested: 'bg-yellow-100 text-yellow-800',
      present: 'bg-green-100 text-green-800',
      technical: 'bg-blue-100 text-blue-800',
      soft: 'bg-purple-100 text-purple-800',
      required: 'bg-red-100 text-red-800',
      preferred: 'bg-orange-100 text-orange-800'
    };
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[type]} mr-2 mb-2`}>
        {keyword}
      </span>
    );
  };

  const renderAnalyzerTab = () => (
    <div className="space-y-6">
      {/* File Upload */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Upload Resume</h2>
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
          <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 mb-4">Drop your resume here or click to browse</p>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept=".pdf,.doc,.docx"
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors"
          >
            Choose File
          </button>
          {uploadedFile && (
            <p className="text-sm text-gray-500 mt-2">
              Uploaded: {uploadedFile.name}
            </p>
          )}
        </div>
      </div>

      {/* Target Role Selection */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Target Role</h2>
        <select
          value={rewriteSettings.role}
          onChange={(e) => setRewriteSettings({...rewriteSettings, role: e.target.value})}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="Software Engineer">Software Engineer</option>
          <option value="Data Scientist">Data Scientist</option>
          <option value="Product Manager">Product Manager</option>
          <option value="Marketing Manager">Marketing Manager</option>
          <option value="Sales Representative">Sales Representative</option>
          <option value="UX Designer">UX Designer</option>
        </select>
      </div>

      {/* Loading State */}
      {isAnalyzing && (
        <div className="bg-white rounded-xl shadow-lg p-6 text-center">
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Analyzing your resume...</p>
        </div>
      )}

      {/* Analysis Results */}
      {analysis && (
        <div className="space-y-6">
          {/* Score Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ScoreCard score={analysis.atsScore} label="ATS Score" color="blue" />
            <ScoreCard score={`${analysis.overallRating}/5`} label="Overall Rating" color="green" />
          </div>

          {/* Strengths & Improvements */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                Strengths
              </h3>
              <ul className="space-y-2">
                {analysis.strengths.map((strength, index) => (
                  <li key={index} className="flex items-start">
                    <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span className="text-gray-700">{strength}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <AlertCircle className="w-5 h-5 text-orange-500 mr-2" />
                Areas for Improvement
              </h3>
              <ul className="space-y-2">
                {analysis.improvements.map((improvement, index) => (
                  <li key={index} className="flex items-start">
                    <span className="w-2 h-2 bg-orange-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span className="text-gray-700">{improvement}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Keywords Analysis */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Keywords Analysis</h3>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-gray-700 mb-2">Missing Keywords</h4>
                <div className="flex flex-wrap">
                  {analysis.keywords.missing.map((keyword, index) => (
                    <KeywordBadge key={index} keyword={keyword} type="missing" />
                  ))}
                </div>
              </div>
              <div>
                <h4 className="font-medium text-gray-700 mb-2">Suggested Keywords</h4>
                <div className="flex flex-wrap">
                  {analysis.keywords.suggested.map((keyword, index) => (
                    <KeywordBadge key={index} keyword={keyword} type="suggested" />
                  ))}
                </div>
              </div>
              <div>
                <h4 className="font-medium text-gray-700 mb-2">Present Keywords</h4>
                <div className="flex flex-wrap">
                  {analysis.keywords.present.map((keyword, index) => (
                    <KeywordBadge key={index} keyword={keyword} type="present" />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Section Scores */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Section Analysis</h3>
            <div className="space-y-4">
              {Object.entries(analysis.sections).map(([section, data]) => (
                <div key={section} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-700 capitalize">{section}</h4>
                    <span className="text-lg font-bold text-blue-600">{data.score}/10</span>
                  </div>
                  <p className="text-sm text-gray-600">{data.feedback}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderRewriterTab = () => (
    <div className="space-y-6">
      {/* Rewrite Settings */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Rewrite Settings</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tone</label>
            <select
              value={rewriteSettings.tone}
              onChange={(e) => setRewriteSettings({...rewriteSettings, tone: e.target.value})}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="concise">Concise</option>
              <option value="formal">Formal</option>
              <option value="achievement-focused">Achievement-focused</option>
              <option value="creative">Creative</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Target Role</label>
            <select
              value={rewriteSettings.role}
              onChange={(e) => setRewriteSettings({...rewriteSettings, role: e.target.value})}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="Software Engineer">Software Engineer</option>
              <option value="Data Scientist">Data Scientist</option>
              <option value="Product Manager">Product Manager</option>
              <option value="Marketing Manager">Marketing Manager</option>
              <option value="Sales Representative">Sales Representative</option>
              <option value="UX Designer">UX Designer</option>
            </select>
          </div>
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Options</label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(rewriteSettings.options).map(([key, value]) => (
              <label key={key} className="flex items-center">
                <input
                  type="checkbox"
                  checked={value}
                  onChange={(e) => setRewriteSettings({
                    ...rewriteSettings,
                    options: {
                      ...rewriteSettings.options,
                      [key]: e.target.checked
                    }
                  })}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700 capitalize">
                  {key.replace(/([A-Z])/g, ' $1').trim()}
                </span>
              </label>
            ))}
          </div>
        </div>

        <button
          onClick={rewriteResume}
          disabled={!uploadedFile || isProcessing}
          className="mt-4 bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
        >
          {isProcessing ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Rewriting...
            </>
          ) : (
            <>
              <RefreshCw className="w-4 h-4 mr-2" />
              Rewrite Resume
            </>
          )}
        </button>
      </div>

      {/* Rewritten Resume */}
      {rewrittenResume && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Rewritten Resume</h2>
            <div className="flex space-x-2">
              <button
                onClick={() => copyToClipboard(rewrittenResume)}
                className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors flex items-center"
              >
                <Copy className="w-4 h-4 mr-2" />
                Copy
              </button>
              <button
                onClick={() => downloadText(rewrittenResume, 'rewritten-resume.txt')}
                className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors flex items-center"
              >
                <Download className="w-4 h-4 mr-2" />
                Download
              </button>
            </div>
          </div>
          <div className="bg-gray-50 rounded-lg p-4 max-h-96 overflow-y-auto">
            <pre className="whitespace-pre-wrap text-sm text-gray-800">{rewrittenResume}</pre>
          </div>
        </div>
      )}
    </div>
  );

  const renderCoverLetterTab = () => (
    <div className="space-y-6">
      {/* Cover Letter Form */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Generate Cover Letter</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Company Name</label>
            <input
              type="text"
              value={coverLetterData.company}
              onChange={(e) => setCoverLetterData({...coverLetterData, company: e.target.value})}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., Google"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Position</label>
            <input
              type="text"
              value={coverLetterData.position}
              onChange={(e) => setCoverLetterData({...coverLetterData, position: e.target.value})}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., Software Engineer"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Years of Experience</label>
            <input
              type="text"
              value={coverLetterData.experience}
              onChange={(e) => setCoverLetterData({...coverLetterData, experience: e.target.value})}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., 3 years"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tone</label>
            <select
              value={coverLetterData.tone}
              onChange={(e) => setCoverLetterData({...coverLetterData, tone: e.target.value})}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="professional">Professional</option>
              <option value="enthusiastic">Enthusiastic</option>
              <option value="formal">Formal</option>
              <option value="creative">Creative</option>
            </select>
          </div>
        </div>

        <button
          onClick={generateCoverLetter}
          disabled={isProcessing}
          className="mt-4 bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
        >
          {isProcessing ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <FileText className="w-4 h-4 mr-2" />
              Generate Cover Letter
            </>
          )}
        </button>
      </div>

      {/* Generated Cover Letter */}
      {generatedCoverLetter && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Generated Cover Letter</h2>
            <div className="flex space-x-2">
              <button
                onClick={() => copyToClipboard(generatedCoverLetter)}
                className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors flex items-center"
              >
                <Copy className="w-4 h-4 mr-2" />
                Copy
              </button>
              <button
                onClick={() => downloadText(generatedCoverLetter, 'cover-letter.txt')}
                className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors flex items-center"
              >
                <Download className="w-4 h-4 mr-2" />
                Download
              </button>
            </div>
          </div>
          <div className="bg-gray-50 rounded-lg p-4 max-h-96 overflow-y-auto">
            <pre className="whitespace-pre-wrap text-sm text-gray-800">{generatedCoverLetter}</pre>
          </div>
        </div>
      )}
    </div>
  );

  const renderTemplatesTab = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Resume Templates</h2>
        
        {loadingTemplates ? (
          <div className="text-center py-8">
            <Loader2 className="w-8 h-8 text-blue-500 animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Loading templates...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {templates.map((template) => (
              <div key={template.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-gray-900">{template.name}</h3>
                  <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                    {template.category}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-3">{template.description}</p>
                
                <div className="flex items-center justify-between text-sm mb-3">
                  <span className="text-gray-500">Popularity: {template.popularity}%</span>
                  <span className="text-gray-500">ATS Score: {template.atsScore}%</span>
                </div>
                
                <div className="flex flex-wrap gap-1 mb-3">
                  {template.features.map((feature, index) => (
                    <span key={index} className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded">
                      {feature}
                    </span>
                  ))}
                </div>
                
                <button className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Use Template
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  const renderJobParserTab = () => (
    <div className="space-y-6">
      {/* Job Description Input */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Job Description Parser</h2>
        <textarea
          value={jobDescription}
          onChange={(e) => setJobDescription(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent h-32 resize-none"
          placeholder="Paste the job description here..."
        />
        <button
          onClick={parseJobDescription}
          disabled={isProcessing}
          className="mt-4 bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
        >
          {isProcessing ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Parsing...
            </>
          ) : (
            <>
              <Search className="w-4 h-4 mr-2" />
              Parse Job Description
            </>
          )}
        </button>
      </div>

      {/* Parsed Data */}
      {extractedData && (
        <div className="space-y-6">
          {/* Skills */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Skills Required</h3>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-gray-700 mb-2">Technical Skills</h4>
                <div className="flex flex-wrap">
                  {extractedData.skills.technical.map((skill, index) => (
                    <KeywordBadge key={index} keyword={skill} type="technical" />
                  ))}
                </div>
              </div>
              <div>
                <h4 className="font-medium text-gray-700 mb-2">Soft Skills</h4>
                <div className="flex flex-wrap">
                  {extractedData.skills.soft.map((skill, index) => (
                    <KeywordBadge key={index} keyword={skill} type="soft" />
                  ))}
                </div>
              </div>
              <div>
                <h4 className="font-medium text-gray-700 mb-2">Required Skills</h4>
                <div className="flex flex-wrap">
                  {extractedData.skills.required.map((skill, index) => (
                    <KeywordBadge key={index} keyword={skill} type="required" />
                  ))}
                </div>
              </div>
              <div>
                <h4 className="font-medium text-gray-700 mb-2">Preferred Skills</h4>
                <div className="flex flex-wrap">
                  {extractedData.skills.preferred.map((skill, index) => (
                    <KeywordBadge key={index} keyword={skill} type="preferred" />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Keywords */}
          <div className="bg-