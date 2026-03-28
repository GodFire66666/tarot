import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Reading from './pages/Reading';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/reading" element={<Reading />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
