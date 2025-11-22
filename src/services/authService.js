class AuthService {
  constructor() {
    this.currentUser = null;
    this.token = localStorage.getItem('lekhika_token');
    this.apiKey = localStorage.getItem('lekhika_api_key');
  }

  getCurrentUser() {
    if (!this.currentUser && this.token) {
      // Try to get user from token or localStorage
      const userData = localStorage.getItem('lekhika_user');
      if (userData) {
        this.currentUser = JSON.parse(userData);
      }
    }
    return this.currentUser;
  }

  setCurrentUser(user, token = null) {
    this.currentUser = user;
    if (token) {
      this.token = token;
      localStorage.setItem('lekhika_token', token);
    }
    localStorage.setItem('lekhika_user', JSON.stringify(user));
  }

  getToken() {
    return this.token;
  }

  getApiKey() {
    return this.apiKey;
  }

  setApiKey(apiKey) {
    this.apiKey = apiKey;
    localStorage.setItem('lekhika_api_key', apiKey);
  }

  logout() {
    this.currentUser = null;
    this.token = null;
    this.apiKey = null;
    localStorage.removeItem('lekhika_token');
    localStorage.removeItem('lekhika_user');
    localStorage.removeItem('lekhika_api_key');
  }

  // Mock login for demo - replace with real authentication
  async login(email, password) {
    // For demo purposes, create a mock user
    const mockUser = {
      id: 'user_' + Date.now(),
      email: email,
      name: email.split('@')[0],
      subscription: 'premium'
    };
    
    const mockToken = 'mock_token_' + Date.now();
    this.setCurrentUser(mockUser, mockToken);
    return { user: mockUser, token: mockToken };
  }

  isAuthenticated() {
    return !!this.token && !!this.currentUser;
  }
}

export default new AuthService();
