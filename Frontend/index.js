// ================= LOGIN =================
async function handleLogin() {
  const identifier = document.getElementById("login-username").value;
  const password = document.getElementById("login-password").value;

  try {
    const res = await axios.post("http://localhost:1337/api/auth/local", {
      identifier,
      password,
    });

    localStorage.setItem("token", res.data.jwt);

    // Reload page to update UI
    window.location.href = "profile.html";

  } catch (err) {
    alert("Login failed");
    console.log(err.response?.data);
  }
}

// ================= REGISTER =================
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

    document.getElementById("register-username").value = "";
    document.getElementById("register-email").value = "";
    document.getElementById("register-password").value = "";

  } catch (err) {
    alert(err.response?.data?.error?.message || "Register failed");
  }
}

// ===== SHOW / HIDE LOGIN + REGISTER =====

function showLogin() {
  document.getElementById("auth-container").style.display = "flex";
}

function showRegister() {
  document.getElementById("auth-container").style.display = "flex";
}

// ================= CHECK USER =================
async function checkUser() {
  const token = localStorage.getItem("token");

  // No token = not logged in
  if (!token) {
    return;
  }

  try {
    await axios.get("http://localhost:1337/api/users/me", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

  } catch (err) {
    // Token invalid or expired
    localStorage.removeItem("token");
  }
}

// ================= Load Profile =================
async function loadProfile() {
  const token = localStorage.getItem("token");

  // Not logged in
  if (!token) {
    window.location.href = "login.html";
    return;
  }

  try {
    const res = await axios.get("http://localhost:1337/api/users/me", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const welcomeText = document.getElementById("welcome-user");

    if (welcomeText) {
      welcomeText.innerText =
        "Welcome " + res.data.username;
    }

  } catch (err) {
    localStorage.removeItem("token");
    window.location.href = "login.html";
  }
}

// ================= Log out =================
function logout() {
  localStorage.removeItem("token");

  window.location.href = "login.html";
}


// ================= LOAD BOOKS =================
async function loadBooks() {
  try {
    const res = await axios.get("http://localhost:1337/api/books?populate=*");

    const books = res.data.data;
    const container = document.getElementById("books-container");

    container.innerHTML = "";

    books.forEach((book) => {
      const b = book;

      const imageUrl = b.cover?.[0]?.url
        ? "http://localhost:1337" + b.cover[0].url
        : "";

      container.innerHTML += `
        <div class="book-card" onclick='openModal(${JSON.stringify(b)})'>
          <img src="${imageUrl}" alt="${b.title}" />
          <h3>${b.title}</h3>
          <p>${b.author}</p>
          <p>${b.pages ?? "No page info"} pages</p>
        </div>
      `;
    });
  } catch (err) {
    console.error("Error loading books", err);
  }
}

// ================= OPEN MODAL =================
function openModal(book) {
  const modal = document.getElementById("book-modal");

  const imageUrl = book.cover?.[0]?.url
    ? "http://localhost:1337" + book.cover[0].url
    : "";

  document.getElementById("modal-image").src = imageUrl;
  document.getElementById("modal-title").innerText = book.title;
  document.getElementById("modal-author").innerText = book.author;
  document.getElementById("modal-pages").innerText =
    (book.pages ?? "No page info") + " pages";

  modal.classList.remove("hidden");
}

// ================= CLOSE MODAL =================
document.addEventListener("DOMContentLoaded", () => {

  // Only run modal code if modal exists
  const closeBtn = document.getElementById("close-modal");

  if (closeBtn) {
    closeBtn.addEventListener("click", () => {
      document.getElementById("book-modal").classList.add("hidden");
    });
  }

  // Homepage only
  if (document.getElementById("books-container")) {
    checkUser();
    loadBooks();
  }

  // Profile page only
  if (document.getElementById("welcome-user")) {
    loadProfile();
  }

});