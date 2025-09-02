function showLoginForm(role) {
    document.getElementById("adminLogin").style.display = (role === "admin") ? "block" : "none";
    document.getElementById("studentLogin").style.display = (role === "student") ? "block" : "none";
  }
  
  // Dummy credentials (for testing)
  const adminCreds = { username: "admin", password: "admin123" };
  const studentCreds = { username: "student", password: "student123" };
  
  function login(role) {
    if (role === "admin") {
      let user = document.getElementById("adminUser").value;
      let pass = document.getElementById("adminPass").value;
      if (user === adminCreds.username && pass === adminCreds.password) {
        localStorage.setItem("role", "admin");
        window.location.href = "index.html"; // main library system
      } else {
        alert("Invalid Admin Credentials!");
      }
    } else {
      let user = document.getElementById("studentUser").value;
      let pass = document.getElementById("studentPass").value;
      if (user === studentCreds.username && pass === studentCreds.password) {
        localStorage.setItem("role", "student");
        window.location.href = "index.html";
      } else {
        alert("Invalid Student Credentials!");
      }
    }
  }
  
