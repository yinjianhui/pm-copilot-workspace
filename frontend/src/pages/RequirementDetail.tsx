import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../hooks/useAppSelector';
import { useAppDispatch as useTypedDispatch } from '../hooks/useAppDispatch';
import { fetchRequirements } from '../store/requirementSlice';
import { fetchConversations, createConversation } from '../store/conversationSlice';
import { fetchPRD } from '../store/prdSlice';
import { ConversationView } from '../components/requirement/ConversationView';
import { Button } from '../components/common/Button';
import { LoadingSpinner } from '../components/common/LoadingSpinner';

export const RequirementDetail: React.FC = () => {
  const { requirementId } = useParams<{ requirementId: string }>();
  const navigate = useNavigate();
  const dispatch = useTypedDispatch();

  const { requirements, loading } = useAppSelector((state) => state.requirements);
  const { conversations } = useAppSelector((state) => state.conversations);
  const { currentPRD } = useAppSelector((state) => state.prds);

  const [activeTab, setActiveTab] = useState<'details' | 'conversation' | 'prd'>('details');

  const requirement = requirements.find((r) => r.id === requirementId);
  const activeConversation = conversations[0]; // Use the first conversation for now

  useEffect(() => {
    if (requirementId) {
      dispatch(fetchRequirements(requirementId));
      dispatch(fetchConversations(requirementId));
      dispatch(fetchPRD(requirementId));
    }
  }, [requirementId, dispatch]);

  const handleStartConversation = async () => {
    if (!requirementId) return;
    try {
      await dispatch(createConversation({ requirementId })).unwrap();
    } catch (err) {
      console.error('Failed to create conversation:', err);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'low':
        return 'bg-gray-100 text-gray-700';
      case 'medium':
        return 'bg-yellow-100 text-yellow-700';
      case 'high':
        return 'bg-orange-100 text-orange-700';
      case 'critical':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  if (!requirement) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Requirement Not Found</h2>
          <Button onClick={() => navigate('/')}>Back to Workspaces</Button>
        </div>
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
            <span className="text-gray-900">{requirement.name}</span>
          </div>
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{requirement.name}</h1>
              <div className="flex items-center space-x-2 mt-2">
                <span
                  className={`inline-block px-3 py-1 text-sm font-medium rounded-full ${getPriorityColor(requirement.priority)}`}
                >
                  {requirement.priority.toUpperCase()} Priority
                </span>
              </div>
            </div>
            <div className="flex space-x-3">
              <Button variant="ghost">Edit</Button>
              <Button>Generate PRD</Button>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            <button
              onClick={() => setActiveTab('details')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'details'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Details
            </button>
            <button
              onClick={() => setActiveTab('conversation')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'conversation'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              AI Conversation
            </button>
            <button
              onClick={() => setActiveTab('prd')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'prd'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              PRD
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'details' && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Description</h2>
            <p className="text-gray-600 whitespace-pre-line">{requirement.description}</p>

            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-700">Created:</span>{' '}
                  <span className="text-gray-600">
                    {new Date(requirement.created_at).toLocaleDateString()}
                  </span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Updated:</span>{' '}
                  <span className="text-gray-600">
                    {new Date(requirement.updated_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'conversation' && (
          <div>
            {!activeConversation ? (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
                <svg
                  className="mx-auto h-12 w-12 text-gray-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" />
                </svg>
                <h3 className="mt-2 text-lg font-medium text-gray-900">Start a conversation</h3>
                <p className="mt-1 text-gray-500 mb-4">
                  Chat with AI to refine and elaborate on this requirement
                </p>
                <Button onClick={handleStartConversation}>Start AI Chat</Button>
              </div>
            ) : (
              <ConversationView conversationId={activeConversation.id} requirementId={requirementId} />
            )}
          </div>
        )}

        {activeTab === 'prd' && (
          <div>
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
                  Generate a Product Requirements Document from this requirement
                </p>
                <Button>Generate PRD</Button>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">Product Requirements Document</h2>
                  <Button variant="ghost">Edit PRD</Button>
                </div>
                <div className="prose max-w-none">
                  <div className="mb-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Overview</h3>
                    <p className="text-gray-600">{currentPRD.overview || 'N/A'}</p>
                  </div>
                  <div className="mb-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-2">User Stories</h3>
                    <ul className="list-disc list-inside text-gray-600">
                      {currentPRD.user_stories?.map((story, idx) => (
                        <li key={idx}>{story}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="mb-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Acceptance Criteria</h3>
                    <ul className="list-disc list-inside text-gray-600">
                      {currentPRD.acceptance_criteria?.map((criteria, idx) => (
                        <li key={idx}>{criteria}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Technical Notes</h3>
                    <p className="text-gray-600">{currentPRD.technical_notes || 'N/A'}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
