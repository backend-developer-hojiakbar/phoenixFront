// Test script to add writer functionality to the app
// This script will be imported in the main application

export function setupWriterTest() {
  // Function to add a test writer user
  function addTestWriter() {
    const testWriter = {
      id: 999,
      phone: "998900000000",
      name: "Test",
      surname: "Writer",
      role: "writer",
      language: "uz"
    };
    
    // Save to localStorage
    localStorage.setItem('test-writer-user', JSON.stringify(testWriter));
    console.log("Test writer user added to localStorage");
    return testWriter;
  }
  
  // Function to login as test writer
  function loginAsTestWriter() {
    const testWriter = JSON.parse(localStorage.getItem('test-writer-user') || '{}');
    if (Object.keys(testWriter).length > 0) {
      localStorage.setItem('user', JSON.stringify(testWriter));
      localStorage.setItem('accessToken', 'test-access-token');
      localStorage.setItem('refreshToken', 'test-refresh-token');
      console.log("Logged in as test writer");
      return true;
    }
    console.log("No test writer user found");
    return false;
  }
  
  // Add test functions to window for easy access
  window.addTestWriter = addTestWriter;
  window.loginAsTestWriter = loginAsTestWriter;
  
  console.log("Writer test functions available:");
  console.log("- addTestWriter(): Add test writer to localStorage");
  console.log("- loginAsTestWriter(): Login as test writer");
  
  // Add the test writer user
  addTestWriter();
}