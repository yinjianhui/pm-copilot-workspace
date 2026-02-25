import React, { useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAppSelector } from '../hooks/useAppSelector';
import { useAppDispatch } from '../hooks/useAppDispatch';
import { setCurrentEpic } from '../store/epicSlice';
import { fetchRequirements } from '../store/requirementSlice';
import { RequirementCard } from '../components/requirement/RequirementCard';
import { Button } from '../components/common/Button';
import { LoadingSpinner } from '../components/common/LoadingSpinner';

export const EpicDetail: React.FC = () => {
  const { epicId } = useParams<{ epicId: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const { epics, currentEpic, loading } = useAppSelector((state) => state.epics);
  const { requirements } = useAppSelector((state) => state.requirements);

  const epic = currentEpic || epics.find((e) => e.id === epicId);

  useEffect(() => {
    if (epicId) {
      // Fetch epic details and requirements
      dispatch(fetchRequirements(epicId));
    }

    return () => {
      dispatch(setCurrentEpic(null));
    };
  }, [epicId, dispatch]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  if (!epic) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Epic Not Found</h2>
          <Button onClick={() => navigate('/')}>Back to Workspaces</Button>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'backlog':
        return 'bg-gray-100 text-gray-700';
      case 'in_progress':
        return 'bg-blue-100 text-blue-700';
      case 'done':
        return 'bg-green-100 text-green-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

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
            <span className="text-gray-900">{epic.name}</span>
          </div>
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{epic.name}</h1>
              <span
                className={`inline-block mt-2 px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(epic.status)}`}
              >
                {epic.status.replace('_', ' ').toUpperCase()}
              </span>
            </div>
            <div className="flex space-x-3">
              <Button variant="ghost">Edit Epic</Button>
              <Button>+ Add Requirement</Button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Description */}
        {epic.description && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Description</h2>
            <p className="text-gray-600 whitespace-pre-line">{epic.description}</p>
          </div>
        )}

        {/* Requirements */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Requirements ({requirements.length})
          </h2>
          {requirements.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
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
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No requirements yet</h3>
              <p className="mt-1 text-sm text-gray-500">
                Add requirements to break down this epic into manageable tasks
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {requirements.map((req) => (
                <RequirementCard key={req.id} requirement={req} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
