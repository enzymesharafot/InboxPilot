// API utility for OAuth and backend integration
const API_BASE_URL = 'http://127.0.0.1:8000/api';

// Get JWT token from localStorage
const getAuthToken = () => {
  return localStorage.getItem('access_token');
};

// Gmail OAuth Functions
export const gmailAuth = {
  // Step 1: Get Gmail authorization URL
  async getAuthUrl() {
    const token = getAuthToken();
    if (!token) {
      throw new Error('Please login first');
    }

    const response = await fetch(`${API_BASE_URL}/oauth/gmail/authorize/`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to get Gmail authorization URL');
    }

    return await response.json();
  },

  // Step 2: Exchange authorization code for tokens
  async callback(code) {
    const token = getAuthToken();
    if (!token) {
      throw new Error('Please login first');
    }

    const response = await fetch(`${API_BASE_URL}/oauth/gmail/callback/`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ code }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to connect Gmail account');
    }

    return await response.json();
  },
};

// Outlook OAuth Functions
export const outlookAuth = {
  // Step 1: Get Outlook authorization URL
  async getAuthUrl() {
    const token = getAuthToken();
    if (!token) {
      throw new Error('Please login first');
    }

    const response = await fetch(`${API_BASE_URL}/oauth/outlook/authorize/`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to get Outlook authorization URL');
    }

    return await response.json();
  },

  // Step 2: Exchange authorization code for tokens
  async callback(code) {
    const token = getAuthToken();
    if (!token) {
      throw new Error('Please login first');
    }

    const response = await fetch(`${API_BASE_URL}/oauth/outlook/callback/`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ code }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to connect Outlook account');
    }

    return await response.json();
  },
};

// Email Account Management
export const emailAccounts = {
  // Get all connected accounts
  async getAccounts() {
    const token = getAuthToken();
    if (!token) {
      throw new Error('Please login first');
    }

    const response = await fetch(`${API_BASE_URL}/accounts/`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch email accounts');
    }

    return await response.json();
  },

  // Sync emails from an account
  async syncAccount(accountId) {
    const token = getAuthToken();
    if (!token) {
      throw new Error('Please login first');
    }

    const response = await fetch(`${API_BASE_URL}/oauth/sync/${accountId}/`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to sync emails');
    }

    return await response.json();
  },

  // Disconnect an account
  async disconnectAccount(accountId) {
    const token = getAuthToken();
    if (!token) {
      throw new Error('Please login first');
    }

    const response = await fetch(`${API_BASE_URL}/oauth/disconnect/${accountId}/`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to disconnect account');
    }

    return await response.json();
  },
};

// Get Current User
export const currentUser = {
  async get() {
    const token = getAuthToken();
    if (!token) {
      throw new Error('Please login first');
    }

    const response = await fetch(`${API_BASE_URL}/auth/me/`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch user information');
    }

    return await response.json();
  },

  async update(data) {
    const token = getAuthToken();
    if (!token) {
      throw new Error('Please login first');
    }

    const response = await fetch(`${API_BASE_URL}/auth/me/`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to update user information');
    }

    return await response.json();
  },

  async updateProfilePicture(base64Image) {
    const token = getAuthToken();
    if (!token) {
      throw new Error('Please login first');
    }

    const response = await fetch(`${API_BASE_URL}/auth/profile-picture/`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ profile_picture: base64Image }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update profile picture');
    }

    return await response.json();
  },

  async removeProfilePicture() {
    const token = getAuthToken();
    if (!token) {
      throw new Error('Please login first');
    }

    const response = await fetch(`${API_BASE_URL}/auth/profile-picture/`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to remove profile picture');
    }

    return await response.json();
  },
};

// Get Emails
export const emails = {
  async getAll(filters = {}) {
    const token = getAuthToken();
    if (!token) {
      throw new Error('Please login first');
    }

    const queryParams = new URLSearchParams(filters).toString();
    const url = queryParams 
      ? `${API_BASE_URL}/emails/?${queryParams}`
      : `${API_BASE_URL}/emails/`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch emails');
    }

    return await response.json();
  },

  async update(emailId, updateData) {
    const token = getAuthToken();
    if (!token) {
      throw new Error('Please login first');
    }

    const response = await fetch(`${API_BASE_URL}/emails/${emailId}/`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updateData),
    });

    if (!response.ok) {
      throw new Error('Failed to update email');
    }

    return await response.json();
  },

  async markAsRead(emailId) {
    return this.update(emailId, { is_read: true });
  },

  async markAsUnread(emailId) {
    return this.update(emailId, { is_read: false });
  },

  async toggleStar(emailId, isStarred) {
    return this.update(emailId, { is_starred: isStarred });
  },

  async send(emailData) {
    const token = getAuthToken();
    if (!token) {
      throw new Error('Please login first');
    }

    const response = await fetch(`${API_BASE_URL}/emails/send/`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(emailData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to send email');
    }

    return await response.json();
  },
};

// User Preferences API
export const preferences = {
  async get() {
    const token = getAuthToken();
    if (!token) {
      throw new Error('Please login first');
    }

    const response = await fetch(`${API_BASE_URL}/preferences/my_preferences/`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch preferences');
    }

    return await response.json();
  },

  async update(data) {
    const token = getAuthToken();
    if (!token) {
      throw new Error('Please login first');
    }

    const response = await fetch(`${API_BASE_URL}/preferences/update_preferences/`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to update preferences');
    }

    return await response.json();
  },
};

// AI Functions
export const aiService = {
  // Detect email priority using AI
  async detectPriority(emailData) {
    const token = getAuthToken();
    if (!token) {
      throw new Error('Please login first');
    }

    const response = await fetch(`${API_BASE_URL}/ai/detect-priority/`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(emailData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to detect email priority');
    }

    return await response.json();
  },

  // Generate AI summary of email
  async summarizeEmail(emailData) {
    const token = getAuthToken();
    if (!token) {
      throw new Error('Please login first');
    }

    const response = await fetch(`${API_BASE_URL}/ai/summarize/`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(emailData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to summarize email');
    }

    return await response.json();
  },

  // Generate AI reply to email
  async generateReply(emailData) {
    const token = getAuthToken();
    if (!token) {
      throw new Error('Please login first');
    }

    const response = await fetch(`${API_BASE_URL}/ai/generate-reply/`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(emailData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to generate reply');
    }

    return await response.json();
  },

  // Batch analyze email priorities
  async batchAnalyzePriorities(emails) {
    const token = getAuthToken();
    if (!token) {
      throw new Error('Please login first');
    }

    const response = await fetch(`${API_BASE_URL}/ai/batch-analyze/`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ emails }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to analyze email priorities');
    }

    return await response.json();
  },
};
