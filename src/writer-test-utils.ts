// Utility functions for testing writer functionality

export interface WriterUser {
  id: number;
  phone: string;
  name: string;
  surname: string;
  role: 'writer';
  language: string;
}

// Create a test writer user
export function createTestWriter(): WriterUser {
  return {
    id: 999,
    phone: "998900000000",
    name: "Test",
    surname: "Writer",
    role: "writer",
    language: "uz"
  };
}

// Add test writer to localStorage
export function addTestWriterToStorage(): WriterUser {
  const testWriter = createTestWriter();
  localStorage.setItem('test-writer-user', JSON.stringify(testWriter));
  return testWriter;
}

// Login as test writer
export function loginAsTestWriter(): boolean {
  const testWriter = localStorage.getItem('test-writer-user');
  if (testWriter) {
    const userData = JSON.parse(testWriter);
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('accessToken', 'test-access-token');
    localStorage.setItem('refreshToken', 'test-refresh-token');
    return true;
  }
  return false;
}

// Logout
export function logoutTestWriter(): void {
  localStorage.removeItem('user');
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
}

// Check if logged in as writer
export function isLoggedInAsWriter(): boolean {
  const user = localStorage.getItem('user');
  if (user) {
    const userData = JSON.parse(user);
    return userData.role === 'writer';
  }
  return false;
}

// Get current writer user
export function getCurrentWriter(): WriterUser | null {
  const user = localStorage.getItem('user');
  if (user) {
    const userData = JSON.parse(user);
    if (userData.role === 'writer') {
      return userData;
    }
  }
  return null;
}

// Mock API functions for writer pages
export const mockWriterApi = {
  // Mock dashboard data
  getDashboardData: async () => {
    return {
      pending: 2,
      revision: 1,
      accepted: 3,
      totalArticles: 10
    };
  },
  
  // Mock articles data
  getArticles: async () => {
    return [
      {
        id: 1,
        title: "Ilmiy tadqiqot usullari",
        status: "accepted",
        submittedDate: "2023-10-15",
        journal: "Fizika va Astronomiya jurnali"
      },
      {
        id: 2,
        title: "Suniy intellekt texnologiyalari",
        status: "reviewing",
        submittedDate: "2023-10-20",
        journal: "Axborot texnologiyalari"
      }
    ];
  },
  
  // Mock drafts data
  getDrafts: async () => {
    return [
      {
        id: 1,
        title: "Yangi ilmiy tadqiqot usullari",
        lastModified: "2023-10-25T14:30:00",
        wordCount: 1250,
        status: "in_progress"
      }
    ];
  },
  
  // Mock submit article
  submitArticle: async (articleData: any) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    return { success: true, message: "Article submitted successfully" };
  },
  
  // Mock update profile
  updateProfile: async (profileData: any) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    return { success: true, message: "Profile updated successfully" };
  }
};

// Export all functions
export default {
  createTestWriter,
  addTestWriterToStorage,
  loginAsTestWriter,
  logoutTestWriter,
  isLoggedInAsWriter,
  getCurrentWriter,
  mockWriterApi
};