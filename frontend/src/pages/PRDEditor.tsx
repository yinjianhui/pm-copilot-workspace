import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAppSelector } from '../hooks/useAppSelector';
import { useAppDispatch } from '../hooks/useAppDispatch';
import { fetchPRD, generatePRD, updatePRDContent, updatePRD } from '../store/prdSlice';
import { Button } from '../components/common/Button';
import { Modal } from '../components/common/Modal';
import { LoadingSpinner } from '../components/common/LoadingSpinner';

export const PRDEditor: React.FC = () => {
  const { requirementId } = useParams<{ requirementId: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const { currentPRD, loading, generating, saving, error } = useAppSelector((state) => state.prds);

  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);
  const [generatePrompt, setGeneratePrompt] = useState('');
  const [editingField, setEditingField] = useState<keyof typeof currentPRD | null>(null);
  const [tempContent, setTempContent] = useState('');

  useEffect(() => {
    if (requirementId) {
      dispatch(fetchPRD(requirementId));
    }
  }, [requirementId, dispatch]);

  const handleGeneratePRD = async () => {
    if (!requirementId || !generatePrompt.trim()) return;

    try {
      await dispatch(
        generatePRD({ requirementId, prompt: generatePrompt })
      ).unwrap();
      setIsGenerateModalOpen(false);
      setGeneratePrompt('');
    } catch (err) {
      console.error('Failed to generate PRD:', err);
    }
  };

  const handleStartEdit = (field: keyof typeof currentPRD) => {
    setEditingField(field);
    setTempContent(currentPRD?.[field] || '');
  };

  const handleSaveEdit = async () => {
    if (!editingField || !currentPRD) return;

    dispatch(updatePRDContent({ key: editingField, value: tempContent }));

    try {
      await dispatch(
        updatePRD({
          prdId: currentPRD.id,
          data: { [editingField]: tempContent },
        })
      ).unwrap();
      setEditingField(null);
      setTempContent('');
    } catch (err) {
      console.error('Failed to save PRD:', err);
    }
  };

  const renderField = (label: string, field: keyof typeof currentPRD, isList = false) => {
    const content = currentPRD?.[field];

    if (!content) {
      return (
        <div className="mb-6">
          <h3 className="text-lg font-medium text-gray-900 mb-2">{label}</h3>
          <p className="text-gray-400 italic">Not specified</p>
        </div>
      );
    }

    if (editingField === field) {
      return (
        <div className="mb-6">
          <h3 className="text-lg font-medium text-gray-900 mb-2">{label}</h3>
          {isList ? (
            <textarea
              value={tempContent}
              onChange={(e) => setTempContent(e.target.value)}
              rows={8}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter items, one per line"
            />
          ) : (
            <textarea
              value={tempContent}
              onChange={(e) => setTempContent(e.target.value)}
              rows={6}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          )}
          <div className="flex space-x-3 mt-3">
            <Button onClick={handleSaveEdit} disabled={saving}>
              {saving ? 'Saving...' : 'Save'}
            </Button>
            <Button variant="ghost" onClick={() => setEditingField(null)}>
              Cancel
            </Button>
          </div>
        </div>
      );
    }

    return (
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-medium text-gray-900">{label}</h3>
          <Button variant="ghost" size="sm" onClick={() => handleStartEdit(field)}>
            Edit
          </Button>
        </div>
        {isList ? (
          <ul className="list-disc list-inside text-gray-600 space-y-1">
            {(Array.isArray(content) ? content : content.split('\n')).map((item: string, idx: number) => (
              <li key={idx}>{item}</li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-600 whitespace-pre-line">{content as string}</p>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center space-x-2 text-sm text-gray-500 mb-4">
            <Link to="/" className="hover:text-blue-600">
              Workspaces
            </Link>
            <span>/</span>
            <Link to={`/requirement/${requirementId}`} className="hover:text-blue-600">
              Requirement
            </Link>
            <span>/</span>
            <span className="text-gray-900">PRD Editor</span>
          </div>
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">PRD Editor</h1>
              <p className="mt-1 text-sm text-gray-500">Edit the Product Requirements Document</p>
            </div>
            <div className="flex space-x-3">
              <Button variant="ghost" onClick={() => navigate(`/requirement/${requirementId}`)}>
                Back to Requirement
              </Button>
              <Button onClick={() => setIsGenerateModalOpen(true)}>
                Generate with AI
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {!currentPRD ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <h3 className="mt-2 text-lg font-medium text-gray-900">No PRD yet</h3>
            <p className="mt-1 text-gray-500 mb-4">
              Generate a PRD using AI or create one manually
            </p>
            <Button onClick={() => setIsGenerateModalOpen(true)}>
              Generate PRD with AI
            </Button>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            {renderField('Overview', 'overview')}
            {renderField('User Stories', 'user_stories', true)}
            {renderField('Acceptance Criteria', 'acceptance_criteria', true)}
            {renderField('Technical Notes', 'technical_notes')}
          </div>
        )}
      </div>

      {/* Generate PRD Modal */}
      <Modal
        isOpen={isGenerateModalOpen}
        onClose={() => setIsGenerateModalOpen(false)}
        title="Generate PRD with AI"
        footer={
          <>
            <Button variant="ghost" onClick={() => setIsGenerateModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleGeneratePRD} disabled={generating || !generatePrompt.trim()}>
              {generating ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  Generating...
                </>
              ) : (
                'Generate PRD'
              )}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Generation Prompt
            </label>
            <textarea
              value={generatePrompt}
              onChange={(e) => setGeneratePrompt(e.target.value)}
              placeholder="Describe what kind of PRD you want to generate. For example: 'Create a PRD for a user authentication feature with login, signup, and password reset'..."
              rows={6}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <p className="text-sm text-gray-500">
            AI will analyze the requirement and generate a comprehensive PRD based on your prompt.
          </p>
        </div>
      </Modal>
    </div>
  );
};
