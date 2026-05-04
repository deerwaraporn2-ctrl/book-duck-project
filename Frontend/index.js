async function handleLogin() {
  const identifier = document.getElementById("login-username").value;
  const password = document.getElementById("login-password").value;

  try {
    const res = await axios.post("http://localhost:1337/api/auth/local", {
      identifier,
      password,
    });

    // Save token
    localStorage.setItem("token", res.data.jwt);

    // Redirect
    window.location.href = "home.html";

  } catch (err) {
    alert("Login failed");
    console.log(err.response?.data);
  }
}

async function handleRegister() {
  const username = document.getElementById("register-username").value;
  const email = document.getElementById("register-email").value;
  const password = document.getElementById("register-password").value;

  try {
    await axios.post("http://localhost:1337/api/auth/local/register", {
      username,
      email,
      password,
    });

    alert("User created! Now login.");

  } catch (err) {
    alert(err.response?.data?.error?.message || "Register failed");
  }
}
