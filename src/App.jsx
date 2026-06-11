import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './hooks/useAuth.jsx';
import Landing  from './pages/Landing.jsx';
import Login    from './pages/Login.jsx';
import Register from './pages/Register.jsx';
export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/"         element={<Landing />}  />
        <Route path="/login"    element={<Login />}    />
        <Route path="/register" element={<Register />} />
      </Routes>
    </AuthProvider>
  );
}