import { configureStore } from '@reduxjs/toolkit';
import workspaceReducer from './workspaceSlice';
import requirementReducer from './requirementSlice';
import epicReducer from './epicSlice';
import conversationReducer from './conversationSlice';
import prdReducer from './prdSlice';
import taskReducer from './taskSlice';

export const store = configureStore({
  reducer: {
    workspaces: workspaceReducer,
    requirements: requirementReducer,
    epics: epicReducer,
    conversations: conversationReducer,
    prds: prdReducer,
    tasks: taskReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
