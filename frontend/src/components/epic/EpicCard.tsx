import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '../common/Card';
import { Button } from '../common/Button';
import type { Epic } from '../../types/epic';

interface EpicCardProps {
  epic: Epic;
}

export const EpicCard: React.FC<EpicCardProps> = ({ epic }) => {
  const navigate = useNavigate();

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
    <Card hover onClick={() => navigate(`/epic/${epic.id}`)}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle>{epic.name}</CardTitle>
            <span
              className={`inline-block mt-2 px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(epic.status)}`}
            >
              {epic.status.replace('_', ' ').toUpperCase()}
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {epic.description && (
          <p className="text-gray-600 text-sm mb-4 line-clamp-3">
            {epic.description}
          </p>
        )}
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-500">
            <span className="font-medium text-gray-700">
              {epic.requirement_count || 0}
            </span>{' '}
            Requirements
          </div>
          <Button variant="ghost" size="sm">
            View →
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
