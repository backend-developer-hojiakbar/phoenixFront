// Script to add a default writer user for testing
// Run this in the browser console or as a temporary script

(function() {
  // Default writer user data
  const defaultWriter = {
    id: 999,
    phone: "998900000000",
    name: "Test",
    surname: "Writer",
    role: "writer",
    language: "uz"
  };

  // Default writer credentials
  const defaultPassword = "writer123";

  console.log("Adding default writer user for testing:");
  console.log("Phone:", defaultWriter.phone);
  console.log("Password:", defaultPassword);
  console.log("Role:", defaultWriter.role);

  // Save to localStorage (simulating what would happen after registration)
  localStorage.setItem('user', JSON.stringify(defaultWriter));
  
  console.log("Default writer user added to localStorage.");
  console.log("You can now log in with the credentials above.");
  console.log("Navigate to /login to test the writer functionality.");
})();