// ========  Imports  ============================================================= ////

// Import helper functions and Firebase services
import { getMovieGenreName } from "./genres.js"; // A custom helper to get genre names.
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-app.js"; // Firebase initialization.
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/11.2.0/firebase-auth.js"; // Firebase authentication services.
import {
  getFirestore,
  collection,
  doc,
  addDoc,
  getDocs,
  deleteDoc,
  query,
  where,
} from "https://www.gstatic.com/firebasejs/11.2.0/firebase-firestore.js"; // Firebase Firestore services.

// ======== Firebase setup  ============================================================= ////

// Firebase configuration object for initializing a Firebase app
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_WATCHERV1_API_KEY, // Secure API key from environment variables
  authDomain: "watcher-d12f5.firebaseapp.com", // Firebase Auth domain
  projectId: "watcher-d12f5", // Firebase project ID
  storageBucket: "watcher-d12f5.appspot.com", // Firebase storage bucket
};

// Initialize Firebase with the provided configuration
const app = initializeApp(firebaseConfig); // Initialize Firebase app
const auth = getAuth(app); // Get Firebase authentication service
const db = getFirestore(app); // Initialize Firestore database

// ======== API setup  ============================================================= ////

const baseUrl = "https://api.themoviedb.org/"; // Base URL for The Movie Database API (used for fetching movie data)

// ======== UI - Elements - LOGGED OUT VIEW (LOGIN)  ============================================================= ////

// UI elements for the login view (when the user is not logged in)
const viewLoggedOutLogin = document.getElementById("logged-out-view-login");
const userAuthContainer = document.getElementById("user-auth-container"); // Container for user authentication messages
const loginEmailInput = document.getElementById("login-email-input"); // Login email input field
const loginPasswordInput = document.getElementById("login-password-input"); // Login password input field
const loginShowPasswordBtn = document.getElementById("login-show-password-btn"); // Button to toggle password visibility
const loginBtn = document.getElementById("login-btn"); // Button to trigger login
const viewLoginAuthBtn = document.getElementById("view-login-auth-btn"); // Button to show registration form

// ======== UI - Elements - LOGGED OUT VIEW (REGISTER)  ============================================================= ////

// UI elements for the registration view (when the user is not logged in)
const viewLoggedOutRegister = document.getElementById(
  "logged-out-view-register"
);
const emailAuthContainer = document.getElementById("email-auth-container"); // Container for email authentication messages
const passwordAuthContainer = document.getElementById(
  "password-auth-container"
); // Container for password authentication messages
const registerEmailInput = document.getElementById("register-email-input"); // Register email input field
const registerPasswordInput = document.getElementById(
  "register-password-input"
); // Register password input field
const registerShowPasswordBtn = document.getElementById(
  "register-show-password-btn"
); // Button to toggle password visibility during registration
const signupBtn = document.getElementById("signup-btn"); // Button to trigger registration
const viewRegisterAuthBtn = document.getElementById("view-register-auth-btn"); // Button to view login form

// ======== UI - Elements - LOGGED IN VIEW (SEARCH)  ============================================================= ////

// UI elements for the logged-in view (search functionality and watchlist management)
const viewLoggedIn = document.getElementById("logged-in-view");
const watchlistCount = document.getElementById("watchlist-count"); // Display the count of movies in the watchlist
const viewWatchlistBtn = document.getElementById("view-watchlist-btn"); // Button to view the watchlist
const logoutBtn = document.getElementById("logout-btn"); // Button to trigger logout
const yarn = document.getElementById("search-bar"); // Search bar input field
const searchBtn = document.getElementById("search-btn"); // Button to trigger search
const searchResultsCount = document.getElementById("search-results-count"); // Display the number of search results
const searchResults = document.getElementById("search-results"); // Container for search results

// ======== UI - Elements - LOGGED IN VIEW (WATCHLIST - MODAL)  ============================================================= ////

// UI elements for the watchlist modal
let watchlistContainer = document.getElementById("watchlist-container"); // Container for the watchlist items
const modal = document.getElementById("modal"); // Modal for displaying watchlist
const closeModalBtn = document.getElementById("close-modal-btn"); // Button to close the modal
const emptyWatchlist = document.getElementById("empty-watchlist"); // Display message when the watchlist is empty

// ======== UI - Event listeners - LOGGED OUT VIEW (LOGIN)  ============================================================= ////

// Event listeners for the login view
loginBtn.addEventListener("click", authLogInWithEmail); // Trigger login function when login button is clicked
loginShowPasswordBtn.addEventListener("click", showLoginPassword); // Toggle password visibility when the button is clicked
viewRegisterAuthBtn.addEventListener("click", showRegistration); // Show registration view when the button is clicked

// ======== UI - Event listeners - LOGGED OUT VIEW (REGISTER)  ============================================================= ////

// Event listeners for the register view
signupBtn.addEventListener("click", authCreateAccWithEmail); // Trigger registration function when signup button is clicked
registerShowPasswordBtn.addEventListener("click", showRegisterPassword); // Toggle password visibility when the button is clicked
viewLoginAuthBtn.addEventListener("click", showLogin); // Show login view when the button is clicked

// ======== UI - Event listeners - LOGGED IN VIEW (SEARCH)  ============================================================= ////

// Event listeners for the logged-in view (search, logout, and watchlist management)
logoutBtn.addEventListener("click", authSignOut); // Trigger logout function when logout button is clicked
viewWatchlistBtn.addEventListener("click", showWatchlistModal); // Show the watchlist modal when the button is clicked
searchBtn.addEventListener("click", handleClickSearch); // Perform search when search button is clicked
searchResults.addEventListener("click", addMovieToWatchlist); // Add selected movie to the watchlist

// ======== UI - Event listeners - LOGGED IN VIEW (WATCHLIST - MODAL)  ============================================================= ////

// Event listeners for managing the watchlist in the modal
watchlistContainer.addEventListener("click", deleteMovieFromWatchlist); // Delete movie from watchlist when clicked
closeModalBtn.addEventListener("click", closeWatchlistModal); // Close the modal when the close button is clicked

// ======== Main ============================================================= ////

// Set up a listener for changes in the user's authentication state

onAuthStateChanged(auth, (user) => {
  // If a user is logged in
  if (user) {
    // Show a success message or view indicating that the account has been created (or user is logged in)
    showCreateAccountSuccess();

    // Get the user's unique identifier (UID)
    const uid = user.uid;

    // Create a Firestore query to retrieve the movies for this specific user
    const q = query(collection(db, "movies"), where("uid", "==", uid));

    // Delay the execution of showing the logged-in view for 2 seconds (simulating a loading period)
    setTimeout(showLoggedInView, 2000);

    try {
      // Fetch the documents (movies) from Firestore
      getDocs(q).then((querySnapshot) => {
        // Get the number of movies (size) in the user's watchlist
        const watchlistLength = querySnapshot.size;

        // Update the UI to show the number of movies in the watchlist
        watchlistCount.innerHTML = `${watchlistLength}`;

        // Loop through the query results (all movies in the user's watchlist)
        querySnapshot.forEach((doc) => {
          // Render each movie in the watchlist using the renderMoviesHtmlInWatchlist function
          renderMoviesHtmlInWatchlist(watchlistContainer, doc.data());
        });
      });
    } catch (error) {
      // Log any error that occurs during the query or rendering process (currently commented out)
      // console.log(error.message);
    }

    // Log the user's UID for debugging (indicating that the user is logged in)
    console.log(`User ${user.uid} is logged in!`);
  } else {
    // If no user is logged in, show the logged-out view after a short delay
    setTimeout(showLoggedOutView, 500);

    // Log a message indicating no user is currently signed in (currently commented out)
    // console.log("No user is currently signed in");
  }
});

// ======== Functions - Firebase  ============================================================= ////

// Function to log in a user with email and password using Firebase Authentication

function authLogInWithEmail() {
  // Get the email and password entered by the user for login
  const email = loginEmailInput.value;
  const password = loginPasswordInput.value;

  // Call Firebase's signInWithEmailAndPassword to authenticate the user
  signInWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      // If login is successful, reset any existing user messages
      resetUserMessage();

      // Clear the email and password input fields for security and UX
      clearLoginAuthFields();

      // Get the current authenticated user (optional use)
      const user = auth.currentUser;
    })
    .catch((error) => {
      // If login fails, display an error message to the user
      // console.error("Login failed:", error.message);  // Uncomment for debugging
      showUserError(); // Show a user-friendly error message
    });
}

// Function to create a new user account with email and password using Firebase Authentication

function authCreateAccWithEmail() {
  // Get the email and password entered by the user for account registration
  const email = registerEmailInput.value;
  const password = registerPasswordInput.value;

  // Call Firebase's createUserWithEmailAndPassword to create the account
  createUserWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      // If account creation is successful, show a success message to the user
      showCreateAccountSuccess();
    })
    .catch((error) => {
      // If account creation fails, show an error message to the user
      // console.error("Account creation failed:", error.message);  // Uncomment for debugging
      showCreateAccountError(); // Show a user-friendly error message
    });
}

// Function to log out the currently authenticated user using Firebase Authentication

function authSignOut() {
  // Call Firebase's signOut method to log out the user
  signOut(auth)
    .then(() => {
      // After logging out, clear any search results and reset account-related messages
      searchResults.innerHTML = "";
      resetCreateAcccountMessages(); // Reset any account creation/login messages
    })
    .catch((error) => {
      // If sign out fails, you can handle the error (optional)
      // console.error("Logout failed:", error.message);  // Uncomment for debugging
    });
}

// ======== Functions - UI  ============================================================= ////

// Function to show a view using flexbox layout
function showViewInFlex(view) {
  // Set the display property of the view to "flex"
  view.style.display = "flex";
}

// Function to show a view using grid layout
function showViewInGrid(view) {
  // Set the display property of the view to "grid"
  view.style.display = "grid";
}

// Function to hide a view
function hideView(view) {
  // Set the display property of the view to "none" (hide it)
  view.style.display = "none";
}

// Function to clear the value of an input field
function clearInputField(field) {
  // Set the value of the field to an empty string, effectively clearing it
  field.value = "";
}

// ======== Functions - UI - LOGGED OUT VIEW (LOGIN) ============================================================= ////

// Function to show the view when the user is logged out
function showLoggedOutView() {
  // Hide the logged-in view
  hideView(viewLoggedIn);

  // Show the login view in the grid layout for logged-out users
  showViewInGrid(viewLoggedOutLogin);
}

// Function to show the login view, reset messages, and clear fields
function showLogin() {
  // Reset any account creation messages
  resetCreateAcccountMessages();

  // Clear the login form fields
  clearLoginAuthFields();

  // Hide the registration view when showing the login view
  hideView(viewLoggedOutRegister);

  // Show the login view in the grid layout
  showViewInGrid(viewLoggedOutLogin);
}

// Function to reset user authentication messages (clear them)
function resetUserMessage() {
  // Clears the content inside the userAuthContainer
  userAuthContainer.innerHTML = "";
}

// Function to display an error message for invalid login credentials
function showUserError() {
  userAuthContainer.innerHTML = `
  <div class="user-error" id="user-error">
    <p class="user-auth-message error">
      Oops! Log-in credentials are invalid. Please try again.
    </p>
  </div>
  `;
}

// Function to clear the login input fields (email and password)
function clearLoginAuthFields() {
  clearInputField(loginEmailInput);
  clearInputField(loginPasswordInput);
}

// Function to toggle the visibility of the login password
function showLoginPassword() {
  // Check if the password input is currently of type "password"
  if (loginPasswordInput.type === "password") {
    // Change password field to show text (password visible)
    loginPasswordInput.type = "text";
    // Change button opacity to indicate password visibility
    loginShowPasswordBtn.style.opacity = 1;
  } else {
    // Change password field back to password (hidden)
    loginPasswordInput.type = "password";
    // Change button opacity to indicate password is hidden
    loginShowPasswordBtn.style.opacity = 0.5;
  }
}

// ======== Functions - UI - LOGGED OUT VIEW (REGISTER)  ============================================================= ////

// Function to show the registration form when the user is logged out
function showRegistration() {
  // Reset any previous user messages
  resetUserMessage();

  // Clear the registration fields
  clearRegisterAuthFields();

  // Hide the login view and display the registration view
  hideView(viewLoggedOutLogin);
  showViewInGrid(viewLoggedOutRegister);
}

// Function to reset any messages related to account creation (email & password errors/success)
function resetCreateAcccountMessages() {
  // Clear email and password containers
  emailAuthContainer.innerHTML = "";
  passwordAuthContainer.innerHTML = "";
}

// Function to display success messages for account creation (email and password)
function showCreateAccountSuccess() {
  // Success message for email creation
  emailAuthContainer.innerHTML = `
  <div class="email-success" id="email-success">
    <p class="email-auth-message success">
      Great! Your email address was successfully created.
    </p>
  </div>`;

  // Success message for password creation
  passwordAuthContainer.innerHTML = `
  <div class="password-success" id="password-success">
    <p class="password-auth-message success">
      Great! Your password was successfully created.
    </p>
  </div>`;
}

// Function to display error messages for account creation (email and password)
function showCreateAccountError() {
  // Error message for email creation
  emailAuthContainer.innerHTML = `
  <div class="email-error" id="email-error">
    <p class="email-auth-message error">
      Please enter a fake email address.
    </p>
  </div>`;

  // Error message for password creation
  passwordAuthContainer.innerHTML = `
  <div class="password-error" id="password-error">
    <p class="password-auth-message error">
      Password must contain 6 or more characters.
    </p>
  </div>`;
}

// Function to clear the registration input fields (email and password)
function clearRegisterAuthFields() {
  // Clear the email and password input fields
  clearInputField(registerEmailInput);
  clearInputField(registerPasswordInput);
}

// Allow the user to toggle the visibility of their password

function showRegisterPassword() {
  if (registerPasswordInput.type === "password") {
    registerPasswordInput.type = "text";
    registerShowPasswordBtn.style.opacity = 1;
  } else {
    registerPasswordInput.type = "password";
    registerShowPasswordBtn.style.opacity = 0.5;
  }
}

// ======== Functions - UI - LOGGED IN VIEW (SEARCH)  ============================================================= ////

// Function to show the view when the user is logged in
function showLoggedInView() {
  // Hide the login view when the user is logged in
  hideView(viewLoggedOutLogin);

  // Hide the registration view when the user is logged in
  hideView(viewLoggedOutRegister);

  // Show the logged-in view in the grid layout
  showViewInGrid(viewLoggedIn);
}

// Function to handle the search button click
function handleClickSearch(event) {
  // Prevent the default form submission behavior (to avoid page reload)
  event.preventDefault();

  // Uncomment to check when the search button is clicked
  // console.log("search button clicked!");

  // Call the function to fetch movies, passing the value from the search input
  fetchMovies(yarn.value);
}

// Function to fetch movie data based on input search query

function fetchMovies(inputValue) {
  // Retrieve the API key from the environment variables, using Vite's build system
  const apiKey = import.meta.env.VITE_WATCHER_API_KEY;

  // Construct the URL for the movie search API request, encoding the search query for safety
  const url = `${baseUrl}3/search/movie?query=${encodeURIComponent(
    inputValue
  )}&api_key=${
    apiKey // Vite only exposes environment variables prefixed with VITE_
  }`;

  // Initiate a fetch request to the constructed URL
  fetch(url)
    .then((res) => res.json()) // Parse the response JSON into a JavaScript object
    .then((data) => {
      // Filter the movies to ensure they have a poster, overview, and genre IDs (basic validation)
      const movies = (data.results || []).filter(
        (movie) => movie.poster_path && movie.overview && movie.genre_ids
      );

      // Check if there are valid movies in the result
      if (movies.length > 0) {
        // If movies exist, render them on the page
        renderFetchedMoviesHtml(movies);
        // Update the result count display
        searchResultsCount.innerText = `${movies.length} movies found`;
      } else {
        // If no movies found, display a friendly message and clear the result count
        searchResults.innerHTML = `<p class="search-message">No results found. Try another title.</p>`;
        searchResultsCount.innerText = "";
      }
    })
    .catch((err) => console.error("Error fetching movies:", err.message)); // Handle any errors that occur during the fetch operation
}

// Function to refresh and update the UI of the user's watchlist

async function refreshWatchlistUI() {
  // Retrieve the current user's UID (user identifier) from the authentication state
  const uid = auth.currentUser?.uid;

  // If no user is logged in, exit the function early
  if (!uid) return;

  // Create a query to fetch movies from the "movies" collection where the "uid" field matches the current user's UID
  const q = query(collection(db, "movies"), where("uid", "==", uid));

  // Fetch the documents matching the query from Firestore
  const snapshot = await getDocs(q);

  // Clear the existing watchlist UI by emptying the container
  watchlistContainer.innerHTML = "";

  // Update the display to show the total number of movies in the watchlist
  watchlistCount.innerHTML = `${snapshot.size}`;

  // Iterate through the fetched documents and render each movie in the UI
  snapshot.forEach((docSnap) => {
    // For each movie document, call the render function to add it to the watchlist container
    renderMoviesHtmlInWatchlist(watchlistContainer, docSnap.data());
  });
}

// Function to render the fetched movie data as HTML and display it on the page

function renderFetchedMoviesHtml(movies) {
  // Generate HTML for each movie in the array using map(), and join() to combine them into one string
  const html = movies
    .map(
      (movie) => `
    <div class="movie">
      <div class="movie-primary">
        <!-- Display movie poster image, with dynamic src based on poster path -->
        <img class="movie-poster" src="https://image.tmdb.org/t/p/original${
          movie.poster_path
        }" alt="${movie.title} poster">
      </div>
      <div class="movie-secondary">
        <!-- Movie title -->
        <h2>${movie.title}</h2>
        
        <!-- Display genres by calling the getMovieGenreName function to convert genre IDs to genre names -->
        <p class="movie-genres">GENRES: ${getMovieGenreName(
          movie.genre_ids
        ).join(", ")}</p>
        
        <!-- Movie overview -->
        <p class="movie-overview">OVERVIEW: ${movie.overview}</p>
        
        <!-- Button to add movie to watchlist, with movie data stored in data attributes -->
        <button class="add-to-watchlist-btn"
                data-id="${movie.id}"  
                data-poster="${movie.poster_path}" 
                data-title="${movie.title}"
                data-overview="${movie.overview}">
          Add To Watchlist
        </button>
      </div>
    </div>
    <hr>
  `
    )
    .join(""); // Combine the array of HTML strings into a single string

  // Insert the generated HTML into the search results container
  searchResults.innerHTML = html;

  // Clear the search input field after rendering results
  yarn.value = "";
}

// Async function to add a movie to the user's watchlist when the button is clicked

async function addMovieToWatchlist(event) {
  // Get the closest button element, ensuring it is the "add-to-watchlist-btn"
  const button = event.target.closest(".add-to-watchlist-btn");

  // If the button isn't found, exit the function
  if (!button) return;

  // Extract movie data (id, poster, title, and overview) from the button's data attributes
  const { id, poster, title, overview } = button.dataset;

  // Retrieve the current user's UID (user identifier) from the authentication state
  const uid = auth.currentUser?.uid;

  // If no movie ID or user UID is found, exit the function
  if (!id || !uid) return;

  try {
    // Check if the movie is already in the user's watchlist by querying the Firestore database
    const existing = await getDocs(
      query(
        collection(db, "movies"),
        where("uid", "==", uid),
        where("id", "==", id) // Check for the movie by its unique ID
      )
    );

    // If the movie is already in the watchlist, show an alert and stop further execution
    if (!existing.empty) {
      alert("Movie already in watchlist.");
      return;
    }

    // If the movie is not in the watchlist, add it to Firestore
    await addDoc(collection(db, "movies"), {
      id, // Movie ID
      poster, // Movie poster path
      title, // Movie title
      overview, // Movie overview
      uid, // Current user's UID
    });

    // Render the newly added movie to the watchlist UI
    renderMoviesHtmlInWatchlist(watchlistContainer, {
      id,
      poster,
      title,
      overview,
      uid,
    });

    // Refresh the watchlist UI to update the list of movies
    refreshWatchlistUI();

    // Display a success alert
    alert("Movie added to watchlist!");
  } catch (error) {
    // If an error occurs, log it to the console
    console.error("Error adding to watchlist:", error.message);
  }
}

// ======== Functions - UI - LOGGED IN VIEW (WATCHLIST)  ============================================================= ////

function showWatchlistModal() {
  showViewInFlex(modal);
  document.body.style.overflow = "hidden";
}

function closeWatchlistModal() {
  hideView(modal);
  document.body.style.overflow = "scroll";
}

// Function to render a movie's details in the user's watchlist

function renderMoviesHtmlInWatchlist(container, movieData) {
  // Clear the current content of the watchlist (assuming emptyWatchlist is a predefined element)
  emptyWatchlist.innerHTML = "";

  // Create a new list item element to hold the movie data
  const item = document.createElement("li");
  item.className = "watchlist-movie-container"; // Assign a CSS class to the list item

  // Set the inner HTML of the item with movie details
  item.innerHTML = `
    <div class="watchlist-movie"> 
      <div class="watchlist-movie-primary">
        <!-- Movie poster image with lazy loading -->
        <img class="watchlist-movie-poster" src="https://image.tmdb.org/t/p/original${movieData.poster}" alt="${movieData.title} poster" loading="lazy">
      </div>
      <div class="watchlist-movie-secondary">
        <!-- Movie title -->
        <h2>${movieData.title}</h2>
        
        <!-- Movie overview -->
        <p>${movieData.overview}</p>
        
        <!-- Button to delete the movie from the watchlist -->
        <button class="delete-from-watchlist-btn"
                data-id="${movieData.id}">
          Delete From Watchlist
        </button>
      </div>
    </div>
    <hr> <!-- Horizontal line to separate movies -->
  `;

  // Append the newly created list item to the provided container (the watchlist container)
  container.appendChild(item);
}

// Async function to handle deleting a movie from the user's watchlist

async function deleteMovieFromWatchlist(event) {
  // Get the delete button that triggered the event (ensure it's a delete button)
  const deleteBtn = event.target.closest(".delete-from-watchlist-btn");

  // If the clicked element is not the delete button, exit the function
  if (!deleteBtn) return;

  // Retrieve the movie ID from the button's data-id attribute
  const movieId = event.target.dataset.id;

  // Retrieve the current user's UID (user identifier) from the authentication state
  const uid = auth.currentUser?.uid;

  // If no movie ID or user UID is found, exit the function
  if (!movieId || !uid) return;

  try {
    // Create a query to find the movie document in Firestore based on user UID and movie ID
    const q = query(
      collection(db, "movies"),
      where("uid", "==", uid),
      where("id", "==", movieId) // Look for the specific movie using its ID
    );

    // Fetch the document(s) matching the query
    const snapshot = await getDocs(q);

    // For each document returned, delete it from Firestore
    snapshot.forEach((docSnap) => deleteDoc(doc(db, "movies", docSnap.id)));

    // Remove the movie's HTML element from the DOM (watchlist UI)
    const movieNode = event.target.closest("li");
    if (movieNode) movieNode.remove();

    // Refresh the watchlist UI to update the displayed list
    refreshWatchlistUI();

    // Display a success message
    alert("Movie deleted from watchlist.");
  } catch (error) {
    // Log any errors that occur during the delete operation
    console.error("Error deleting movie:", error.message);
  }
}
