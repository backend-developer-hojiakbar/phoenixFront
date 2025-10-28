// Test script to simulate writer login
// This script can be run in the browser console for testing

(function() {
  // Function to simulate writer login
  function loginAsWriter() {
    // Create a mock writer user
    const writerUser = {
      id: 999,
      phone: "998900000000",
      name: "Test",
      surname: "Writer",
      role: "writer",
      language: "uz"
    };
    
    // Save to localStorage (simulating successful login)
    localStorage.setItem('user', JSON.stringify(writerUser));
    localStorage.setItem('accessToken', 'mock-access-token');
    localStorage.setItem('refreshToken', 'mock-refresh-token');
    
    console.log("Successfully logged in as writer!");
    console.log("User data:", writerUser);
    console.log("Redirecting to writer dashboard...");
    
    // Redirect to writer dashboard
    window.location.href = '#/writer/dashboard';
  }
  
  // Function to check if user is logged in as writer
  function checkWriterLogin() {
    const user = localStorage.getItem('user');
    if (user) {
      const userData = JSON.parse(user);
      if (userData.role === 'writer') {
        console.log("Currently logged in as writer:", userData);
        return true;
      }
    }
    console.log("Not logged in as writer");
    return false;
  }
  
  // Function to logout
  function logout() {
    localStorage.removeItem('user');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    console.log("Logged out successfully");
    window.location.href = '#/login';
  }
  
  // Expose functions to global scope for testing
  window.testWriterLogin = loginAsWriter;
  window.checkWriterLogin = checkWriterLogin;
  window.testWriterLogout = logout;
  
  console.log("Writer test functions loaded:");
  console.log("- testWriterLogin(): Login as test writer");
  console.log("- checkWriterLogin(): Check if logged in as writer");
  console.log("- testWriterLogout(): Logout");
  
  // Auto-login if not already logged in
  if (!checkWriterLogin()) {
    console.log("Auto-logging in as writer for testing...");
    loginAsWriter();
  }
})();