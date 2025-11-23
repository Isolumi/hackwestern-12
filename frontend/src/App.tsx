import './App.css'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import LandingPage from './pages/LandingPage'
import ViewerPage from './pages/ViewerPage'
import ModelPage from './pages/ModelPage'
import GeneratePage from './pages/GeneratePage'

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/generate" element={<GeneratePage />} />
        <Route path="/viewer" element={<ViewerPage />} />
        <Route path="/world" element={<ModelPage />} />
      </Routes>
    </Router>
  )
}
