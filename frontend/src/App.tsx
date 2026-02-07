import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store';
import { WorkspaceList } from './pages/WorkspaceList';
import { EpicDetail } from './pages/EpicDetail';
import { RequirementDetail } from './pages/RequirementDetail';
import { PRDEditor } from './pages/PRDEditor';
import './styles/globals.css';

const App: React.FC = () => {
  return (
    <Provider store={store}>
      <Router>
        <Routes>
          <Route path="/" element={<WorkspaceList />} />
          <Route path="/workspace/:workspaceId" element={<WorkspaceList />} />
          <Route path="/epic/:epicId" element={<EpicDetail />} />
          <Route path="/requirement/:requirementId" element={<RequirementDetail />} />
          <Route path="/requirement/:requirementId/prd" element={<PRDEditor />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </Provider>
  );
};

export default App;
