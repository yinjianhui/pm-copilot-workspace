import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '../common/Card';
import { Button } from '../common/Button';
import type { Requirement } from '../../types/requirement';

interface RequirementCardProps {
  requirement: Requirement;
}

export const RequirementCard: React.FC<RequirementCardProps> = ({ requirement }) => {
  const navigate = useNavigate();

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

  return (
    <Card hover onClick={() => navigate(`/requirement/${requirement.id}`)}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle>{requirement.name}</CardTitle>
            <div className="flex items-center space-x-2 mt-2">
              <span
                className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(requirement.priority)}`}
              >
                {requirement.priority.toUpperCase()}
              </span>
              {requirement.has_conversations && (
                <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-blue-100 text-blue-700 rounded-full">
                  <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" />
                  </svg>
                  AI Chat
                </span>
              )}
              {requirement.has_prd && (
                <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-green-100 text-green-700 rounded-full">
                  PRD Ready
                </span>
              )}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {requirement.description && (
          <p className="text-gray-600 text-sm mb-4 line-clamp-3">
            {requirement.description}
          </p>
        )}
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="sm">
            View Details →
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
