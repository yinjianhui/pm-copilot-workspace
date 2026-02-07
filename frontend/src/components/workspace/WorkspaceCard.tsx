import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '../common/Card';
import { Button } from '../common/Button';
import type { Workspace } from '../../types/workspace';

interface WorkspaceCardProps {
  workspace: Workspace;
}

export const WorkspaceCard: React.FC<WorkspaceCardProps> = ({ workspace }) => {
  const navigate = useNavigate();

  return (
    <Card hover onClick={() => navigate(`/workspace/${workspace.id}`)}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <span className="text-blue-600 font-semibold text-lg">
                {workspace.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <CardTitle>{workspace.name}</CardTitle>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {workspace.description && (
          <p className="text-gray-600 text-sm mb-4 line-clamp-2">
            {workspace.description}
          </p>
        )}
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-500">
            <span className="font-medium text-gray-700">
              {workspace.epic_count || 0}
            </span>{' '}
            {workspace.epic_count === 1 ? 'Epic' : 'Epics'}
          </div>
          <Button variant="ghost" size="sm">
            View →
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
