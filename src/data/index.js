// ========  Imports  ============================================================= ////

import { getMovieGenreName } from "./genres.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-app.js";

import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/11.2.0/firebase-auth.js";

import {
  getFirestore,
  collection,
  doc,
  addDoc,
  getDocs,
  deleteDoc,
  query,
  where,
} from "https://www.gstatic.com/firebasejs/11.2.0/firebase-firestore.js";

// ======== Firebase setup  ============================================================= ////

// firebase configuration object for initializing a firebase app

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_WATCHERV1_API_KEY,
  authDomain: "watcher-d12f5.firebaseapp.com",
  projectId: "watcher-d12f5",
  storageBucket: "watcher-d12f5.appspot.com",
};

const app = initializeApp(firebaseConfig); // initialize firebase
const auth = getAuth(app); // get a reference to the authentication service
const db = getFirestore(app); // initialize cloud firestore and get a reference to the service

// console.log(firebaseConfig.databaseURL);
// console.log(getFirestore(app));

// ======== API setup  ============================================================= ////

const baseUrl = "https://api.themoviedb.org/";

// ======== UI - Elements - LOGGED OUT VIEW (LOGIN)  ============================================================= ////

const viewLoggedOutLogin = document.getElementById("logged-out-view-login");
const userAuthContainer = document.getElementById("user-auth-container");
const loginEmailInput = document.getElementById("login-email-input");
const loginPasswordInput = document.getElementById("login-password-input");
const loginShowPasswordBtn = document.getElementById("login-show-password-btn");
const loginBtn = document.getElementById("login-btn");
const viewLoginAuthBtn = document.getElementById("view-login-auth-btn");

// ======== UI - Elements - LOGGED OUT VIEW (REGISTER)  ============================================================= ////

const viewLoggedOutRegister = document.getElementById(
  "logged-out-view-register"
);
const emailAuthContainer = document.getElementById("email-auth-container");
const passwordAuthContainer = document.getElementById(
  "password-auth-container"
);
const registerEmailInput = document.getElementById("register-email-input");
const registerPasswordInput = document.getElementById(
  "register-password-input"
);
const registerShowPasswordBtn = document.getElementById(
  "register-show-password-btn"
);
const signupBtn = document.getElementById("signup-btn");
const viewRegisterAuthBtn = document.getElementById("view-register-auth-btn");

// ======== UI - Elements - LOGGED IN VIEW (SEARCH)  ============================================================= ////

const viewLoggedIn = document.getElementById("logged-in-view");
const watchlistCount = document.getElementById("watchlist-count");
const viewWatchlistBtn = document.getElementById("view-watchlist-btn");
const logoutBtn = document.getElementById("logout-btn");
const yarn = document.getElementById("search-bar");
const searchBtn = document.getElementById("search-btn");
const searchResultsCount = document.getElementById("search-results-count");
const searchResults = document.getElementById("search-results");

// ======== UI - Elements - LOGGED IN VIEW (WATCHLIST - MODAL)  ============================================================= ////

let watchlistContainer = document.getElementById("watchlist-container");
const modal = document.getElementById("modal");
const closeModalBtn = document.getElementById("close-modal-btn");
const emptyWatchlist = document.getElementById("empty-watchlist");

// ======== UI - Event listeners - LOGGED OUT VIEW (LOGIN)  ============================================================= ////

loginBtn.addEventListener("click", authLogInWithEmail);

loginShowPasswordBtn.addEventListener("click", showLoginPassword);

viewRegisterAuthBtn.addEventListener("click", showRegistration);

// ======== UI - Event listeners - LOGGED OUT VIEW (REGISTER)  ============================================================= ////

signupBtn.addEventListener("click", authCreateAccWithEmail);

registerShowPasswordBtn.addEventListener("click", showRegisterPassword);

viewLoginAuthBtn.addEventListener("click", showLogin);

// ======== UI - Event listeners - LOGGED IN VIEW (SEARCH)  ============================================================= ////

logoutBtn.addEventListener("click", authSignOut);

viewWatchlistBtn.addEventListener("click", showWatchlistModal);

searchBtn.addEventListener("click", handleClickSearch);

searchResults.addEventListener("click", addMovieToWatchlist);

// ======== UI - Event listeners - LOGGED IN VIEW (WATCHLIST - MODAL)  ============================================================= ////

watchlistContainer.addEventListener("click", deleteMovieFromWatchlist);

closeModalBtn.addEventListener("click", closeWatchlistModal);

// ======== Main ============================================================= ////

onAuthStateChanged(auth, (user) => {
  // if the user is LOGGED IN
  // show a success message
  // wait 2 seconds, then shows the logged-in UI

  if (user) {
    showCreateAccountSuccess();

    // preparing a query to fetch all movies in Firestore that belong to the current user, based on the user's unique ID
    const uid = user.uid;
    const q = query(collection(db, "movies"), where("uid", "==", uid));

    setTimeout(showLoggedInView, 2000);

    // query firestore for the user's movie watchlist
    // display the number of movies and renders each one in the UI
    // log relevant info

    try {
      getDocs(q).then((querySnapshot) => {
        const watchlistLength = querySnapshot.size;
        watchlistCount.innerHTML = `${watchlistLength}`;
        querySnapshot.forEach((doc) => {
          {
            /*console.log(
            `User ${user.uid} currently has "${doc.data().title}" in watchlist`
          );*/
          }
          renderMoviesHtmlInWatchlist(watchlistContainer, doc.data());
        });
      });
    } catch (error) {
      // console.log(error.message);
    }
    console.log(`User ${user.uid} is logged in!`);
  } else {
    // if the user is not LOGGED IN
    // if the user is LOGGED OUT - wait for 500ms and then show the logged-out view
    // log to the console that no user is currently signed in

    setTimeout(showLoggedOutView, 500);
    // console.log("No user is currently signed in");
  }
});

// ======== Functions - Firebase  ============================================================= ////

// logging in a user with email and password using firebase authentication

function authLogInWithEmail() {
  const email = loginEmailInput.value;
  const password = loginPasswordInput.value;

  signInWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      resetUserMessage();
      clearLoginAuthFields();
      const user = auth.currentUser;
    })
    .catch((error) => {
      // console.error("Login failed:", error.message);
      showUserError();
    });
}

//  creating a new user account with an email and password using firebase authentication

function authCreateAccWithEmail() {
  const email = registerEmailInput.value;
  const password = registerPasswordInput.value;

  createUserWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      showCreateAccountSuccess();
    })
    .catch((error) => {
      // console.error("Login failed:", error.message);
      showCreateAccountError();
    });
}

// logging out the currently authenticated user with firebase

function authSignOut() {
  signOut(auth)
    .then(() => {
      searchResults.innerHTML = "";
      resetCreateAcccountMessages();
    })
    .catch((error) => {
      // console.error("Login failed:", error.message);
    });
}

// ======== Functions - UI  ============================================================= ////

function showViewInFlex(view) {
  view.style.display = "flex";
}

function showViewInGrid(view) {
  view.style.display = "grid";
}

function hideView(view) {
  view.style.display = "none";
}

function clearInputField(field) {
  field.value = "";
}

// ======== Functions - UI - LOGGED OUT VIEW (LOGIN) ============================================================= ////

function showLoggedOutView() {
  hideView(viewLoggedIn);
  showViewInGrid(viewLoggedOutLogin);
}

function showLogin() {
  resetCreateAcccountMessages();
  clearLoginAuthFields();
  hideView(viewLoggedOutRegister);
  showViewInGrid(viewLoggedOutLogin);
}

function resetUserMessage() {
  userAuthContainer.innerHTML = "";
}

function showUserError() {
  userAuthContainer.innerHTML = `
  <div class="user-error" id="user-error">
    <p class="user-auth-message error">
      Oops! Log-in credentials are invalid. Please try again.
    </p>
  </div>
  `;
}

function clearLoginAuthFields() {
  clearInputField(loginEmailInput);
  clearInputField(loginPasswordInput);
}

function showLoginPassword() {
  if (loginPasswordInput.type === "password") {
    loginPasswordInput.type = "text";
    loginShowPasswordBtn.style.opacity = 1;
  } else {
    loginPasswordInput.type = "password";
    loginShowPasswordBtn.style.opacity = 0.5;
  }
}

// ======== Functions - UI - LOGGED OUT VIEW (REGISTER)  ============================================================= ////

function showRegistration() {
  resetUserMessage();
  clearRegisterAuthFields();
  hideView(viewLoggedOutLogin);
  showViewInGrid(viewLoggedOutRegister);
}

function resetCreateAcccountMessages() {
  emailAuthContainer.innerHTML = "";
  passwordAuthContainer.innerHTML = "";
}

function showCreateAccountSuccess() {
  emailAuthContainer.innerHTML = `
  <div class="email-success" id="email-success">
    <p class="email-auth-message success">
      Great! Your email address was successfully created.
    </p>
  </div>`;

  passwordAuthContainer.innerHTML = `
  <div class="password-success" id="password-success">
    <p class="password-auth-message success">
      Great! Your password was successfully created.
    </p>
  </div>`;
}

function showCreateAccountError() {
  emailAuthContainer.innerHTML = `
  <div class="email-error" id="email-error">
    <p class="email-auth-message error">
    Please enter a fake email address.
    </p>
  </div>`;

  passwordAuthContainer.innerHTML = `
  <div class="password-error" id="password-error">
    <p class="password-auth-message error">
      Password must contain 6 or more characters.
    </p>
  </div>`;
}

function clearRegisterAuthFields() {
  clearInputField(registerEmailInput);
  clearInputField(registerPasswordInput);
}

// allows user to toggle the visibility of their password

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

function showLoggedInView() {
  hideView(viewLoggedOutLogin);
  hideView(viewLoggedOutRegister);
  showViewInGrid(viewLoggedIn);
}

function handleClickSearch(event) {
  event.preventDefault();
  // console.log("search button clicked!");
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
