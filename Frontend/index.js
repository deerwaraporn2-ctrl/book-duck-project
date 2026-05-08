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

    localStorage.setItem("user", JSON.stringify(res.data.user));

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
      welcomeText.innerText = "Welcome " + res.data.username;
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

    const booksContainer = document.getElementById("books-container");

    booksContainer.innerHTML = "";

    books.forEach((book) => {
      console.log(book);
      const data = book;

      const image = data.cover?.[0]?.url
        ? `http://localhost:1337${data.cover[0].url}`
        : "https://placehold.co/300x400?text=No+Image";

      const title = data.title || "No title";
      const author = data.author || "Unknown author";
      const pages = data.pages || "-";
      const published = data.publishedDate || "-";

      const bookCard = `
        <div class="book-card">

          <img 
            src="${image}" 
            alt="${title}"
            class="book-image"
          />

          <div class="book-info">

            <h3>${title}</h3>

            <p>
              <strong>Author:</strong>
              ${author}
            </p>

            <p>
              <strong>Pages:</strong>
              ${pages || "-"}
            </p>

            <p>
              <strong>Published:</strong>
              ${published}
            </p>

            <button 
              class="view-btn"
              data-id="${book.id}"
            >
              View
            </button>

          </div>

        </div>
      `;

      booksContainer.innerHTML += bookCard;
      const viewButtons = document.querySelectorAll(".view-btn");

      viewButtons.forEach((button) => {
        button.addEventListener("click", () => {
          const token = localStorage.getItem("token");

          if (!token) {
            alert("Please login to view book details.");
            return;
          }

          const bookId = button.dataset.id;

          const selectedBook = books.find((book) => book.id == bookId);

          openModal(selectedBook);
        });
      });
    });
  } catch (err) {
    console.log(err);
  }
}

// ================= OPEN MODAL =================
function openModal(book) {

  const modal = document.getElementById("book-modal");

  const imageUrl = book.cover?.[0]?.url
    ? "http://localhost:1337" + book.cover[0].url
    : "";

  document.getElementById("modal-image").src = imageUrl;

  document.getElementById("modal-title").innerText =
    book.title;

  document.getElementById("modal-author").innerText =
    "Author: " + book.author;

  document.getElementById("modal-pages").innerText =
    "Pages: " + (book.pages || "-");

  document.getElementById("modal-date").innerText =
    "Published: " + book.publishedDate;

  document.getElementById("modal-description").innerText =
    book.description || "No description available.";

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

// ================= AUTH UI =================

const token = localStorage.getItem("token");

const loginLink = document.getElementById("login-link");
const registerLink = document.getElementById("register-link");

const profileLink = document.getElementById("profile-link");
const logoutBtn = document.getElementById("logout-btn");

if (token) {

  loginLink.classList.add("hidden");
  registerLink.classList.add("hidden");

  profileLink.classList.remove("hidden");
  logoutBtn.classList.remove("hidden");

}



// ================= LOGOUT =================

logoutBtn.addEventListener("click", () => {

  localStorage.removeItem("token");
  localStorage.removeItem("user");

  window.location.href = "index.html";

});