import { Routes, Route } from 'react-router-dom'
import Home from './components/ui/Home'
import Footer from './components/ui/Footer'

const App = () => {
  return (
    <div>
      
      <Routes>
        <Route path='/' element={<Home/>} />
      </Routes>
      
    </div>
  )
}

export default App