import { lazy } from 'react';
import { Navigate } from 'react-router-dom';

// 使用 default 导入组件以解决类型错误
const Home = lazy(() => import('../pages/Home'));
const Chat = lazy(() => import('../pages/Chat'));

const routes = [
  {
    path: '/home',
    element: <Home />
  },
  {
    path: '/chat',
    element: <Chat />
  },
  {
    path: '*',
    element: <Navigate to="/chat" replace />
  }
];

export default routes;