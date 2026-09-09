// Javascript bridge to communicate with Android WebView (RoomDB)
// Fallbacks to localStorage if running in a standard web browser

function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

export const roomdbAuth = {
  async signup(email, password) {
    if (window.AndroidAuth && window.AndroidAuth.signup) {
      // Expecting a JSON string with user data or throwing an error
      const resultStr = window.AndroidAuth.signup(email, password);
      const data = JSON.parse(resultStr);
      if (data.error) throw new Error(data.error);
      return data;
    } else {
      // Fallback: LocalStorage Mock
      const users = JSON.parse(localStorage.getItem('mock_users') || '[]');
      if (users.find(u => u.email === email)) {
        throw new Error('Email already in use');
      }
      const newUser = { uid: generateUUID(), email, password };
      users.push(newUser);
      localStorage.setItem('mock_users', JSON.stringify(users));
      
      // Auto-login after signup
      localStorage.setItem('mock_session', JSON.stringify(newUser));
      return { user: { uid: newUser.uid, email: newUser.email } };
    }
  },

  async login(email, password) {
    if (window.AndroidAuth && window.AndroidAuth.login) {
      const resultStr = window.AndroidAuth.login(email, password);
      const data = JSON.parse(resultStr);
      if (data.error) throw new Error(data.error);
      return data;
    } else {
      // Fallback: LocalStorage Mock
      const users = JSON.parse(localStorage.getItem('mock_users') || '[]');
      const user = users.find(u => u.email === email && u.password === password);
      if (!user) {
        throw new Error('Invalid email or password');
      }
      localStorage.setItem('mock_session', JSON.stringify(user));
      return { user: { uid: user.uid, email: user.email } };
    }
  },

  async logout() {
    if (window.AndroidAuth && window.AndroidAuth.logout) {
      window.AndroidAuth.logout();
    } else {
      // Fallback: LocalStorage Mock
      localStorage.removeItem('mock_session');
    }
  },

  async getSession() {
    if (window.AndroidAuth && window.AndroidAuth.getSession) {
      const sessionStr = window.AndroidAuth.getSession();
      return sessionStr ? JSON.parse(sessionStr) : null;
    } else {
      // Fallback: LocalStorage Mock
      const session = localStorage.getItem('mock_session');
      return session ? { user: JSON.parse(session) } : null;
    }
  },
  
  // Custom auth listener mock to mimic Firebase's onAuthStateChanged
  onAuthStateChanged(callback) {
    // Check initial state
    this.getSession().then(session => {
      callback(session ? session.user : null);
    });
    
    // Listen for storage events (if testing in multiple browser tabs)
    const handleStorageChange = (e) => {
      if (e.key === 'mock_session') {
        const user = e.newValue ? JSON.parse(e.newValue) : null;
        callback(user);
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    // We poll briefly here just to mimic the Android callbacks if they don't trigger events
    // In a real android app, you'd trigger a JS event from Android on login/logout
    const interval = setInterval(async () => {
        const session = await this.getSession();
        // Since we don't know the last state easily without storing it, we only poll in fallback
        // but let's keep it simple: rely on manual calls to getSession updating context.
    }, 2000);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }
};
