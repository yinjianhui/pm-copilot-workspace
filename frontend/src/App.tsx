import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store';
import { WorkspaceList } from './pages/WorkspaceList';
import { EpicDetail } from './pages/EpicDetail';
import { RequirementDetail } from './pages/RequirementDetail';
import { PRDEditor } from './pages/PRDEditor';
import { TaskManagement } from './pages/TaskManagement';
import { TaskDetail } from './pages/TaskDetail';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import './styles/globals.css';

const App: React.FC = () => {
  return (
    <Provider store={store}>
      <Router>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected routes */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <WorkspaceList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/workspace/:workspaceId"
            element={
              <ProtectedRoute>
                <WorkspaceList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/workspace/:workspaceId/tasks"
            element={
              <ProtectedRoute>
                <TaskManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/workspace/:workspaceId/task/:taskId"
            element={
              <ProtectedRoute>
                <TaskDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/epic/:epicId"
            element={
              <ProtectedRoute>
                <EpicDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/requirement/:requirementId"
            element={
              <ProtectedRoute>
                <RequirementDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/requirement/:requirementId/prd"
            element={
              <ProtectedRoute>
                <PRDEditor />
              </ProtectedRoute>
            }
          />

          {/* Catch all - redirect to login if not authenticated */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </Provider>
  );
};

export default App;
