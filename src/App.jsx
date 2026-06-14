// // src/App.jsx
// import { Routes, Route, Navigate } from 'react-router-dom';
// import { AuthProvider, useAuth }   from './hooks/useAuth.jsx';
// import Landing   from './pages/Landing.jsx';
// import Login     from './pages/Login.jsx';
// import Register  from './pages/Register.jsx';
// import Dashboard from './pages/Dashboard.jsx';
// import Pricing from './pages/Pricing.jsx';
// // inside <Routes>:
// <Route path="/pricing" element={<Pricing />} />

// function PrivateRoute({ children }) {
//   const { user } = useAuth();
//   return user ? children : <Navigate to="/login" replace />;
// }

// function AppRoutes() {
//   return (
//     <Routes>
//       <Route path="/"          element={<Landing />} />
//       <Route path="/login"     element={<Login />} />
//       <Route path="/register"  element={<Register />} />
//       <Route path="/dashboard" element={
//         <PrivateRoute><Dashboard /></PrivateRoute>
//       } />
//     </Routes>
//   );
// }

// export default function App() {
//   return (
//     <AuthProvider>
//       <AppRoutes />
//     </AuthProvider>
//   );
// }

import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth }   from './hooks/useAuth.jsx';
import Landing   from './pages/Landing.jsx';
import Login     from './pages/Login.jsx';
import Register  from './pages/Register.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Editor    from './pages/Editor.jsx';
import Pricing   from './pages/Pricing.jsx';
import AISidebar from './components/AISidebar.jsx';
import { useState, useEffect } from 'react';
import Presence from './components/Presence.jsx';

function PrivateRoute({ children }) {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" replace />;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/"         element={<Landing />}  />
      <Route path="/login"    element={<Login />}    />
      <Route path="/register" element={<Register />} />
      <Route path="/pricing"  element={<Pricing />}  />
      <Route path="/dashboard" element={
        <PrivateRoute><Dashboard /></PrivateRoute>
      } />
      <Route path="/editor/:docId" element={
        <PrivateRoute><Editor /></PrivateRoute>
      } />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}



// Add a test route:
<Route path="/test-ai" element={
  <div style={{ height: '100vh', width: '320px', margin: '0 auto' }}>
    <AISidebar
      messages={[
        { id: 1, role: 'user', content: 'Find bugs in this file', username: 'punyashree', timestamp: new Date().toISOString() },
        { id: 2, role: 'assistant', content: 'I found one issue on line 34:\n\n```js\nconst user = validateToken(req.headers.token);\n```\n\nThe `validateToken` function now expects a string, not a headers object. Change it to:\n\n```js\nconst user = validateToken(req.headers.authorization?.split(\' \')[1]);\n```', streaming: false, timestamp: new Date().toISOString() },
      ]}
      loading={false}
      onSend={(q) => console.log('Send:', q)}
      onClear={() => console.log('Clear')}
      contextNote="Watching you and Alice"
      currentUser={{ username: 'punyashree' }}
    />
  </div>
} />


function StreamTest() {
  const [messages, setMessages] = useState([
    { id: 1, role: 'user', content: 'Show me a fixed validateToken function', username: 'punyashree', timestamp: new Date().toISOString() },
  ]);

  useEffect(() => {
    const full = "Here's the fix:\n\n```js\nfunction validateToken(token) {\n  return jwt.verify(token, process.env.JWT_SECRET);\n}\n```\n\nThis now expects a raw string.";
    const id = 2;
    setMessages(m => [...m, { id, role: 'assistant', content: '', streaming: true, timestamp: new Date().toISOString() }]);

    let i = 0;
    const interval = setInterval(() => {
      i += 3;
      setMessages(m => m.map(msg =>
        msg.id === id ? { ...msg, content: full.slice(0, i), streaming: i < full.length } : msg
      ));
      if (i >= full.length) clearInterval(interval);
    }, 40);

    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ height: '100vh', width: '320px', margin: '0 auto' }}>
      <AISidebar messages={messages} loading={false} onSend={() => {}} onClear={() => {}} contextNote="Watching your edits" />
    </div>
  );
}

function PresenceTest() {
  return (
    <div style={{ padding: 40, background: '#080B14', height: '100vh' }}>
      <Presence
        currentUser={{ username: 'punyashree' }}
        peers={[
          { userId: '1', name: 'Alice', active: true },
          { userId: '2', name: 'Bob' },
          { userId: '3', name: 'Charlie' },
          { userId: '4', name: 'Diana' },
          { userId: '5', name: 'Evan' },
        ]}
        maxVisible={4}
      />
    </div>
  );
}
