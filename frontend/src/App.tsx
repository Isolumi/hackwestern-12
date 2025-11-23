import './App.css'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import LandingPage from './pages/LandingPage'
import ViewerPage from './pages/ViewerPage'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/viewer" element={<ViewerPage />} />
      </Routes>
    </Router>
  )
}

export default App
