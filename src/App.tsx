import { useRoutes } from 'react-router-dom';
import routes from './router';
import './App.scss'

function App() {
  return useRoutes(routes)
}

export default App;