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
  setDoc,
  getDocs,
  deleteDoc,
  query,
  where,
} from "https://www.gstatic.com/firebasejs/11.2.0/firebase-firestore.js";

// ======== Firebase setup  ============================================================= ////

const firebaseConfig = {
  apiKey: "AIzaSyD3oXhhIntMetNecqI5f5NwOIz5BKD7dOw",
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

searchResults.addEventListener("dblclick", addMovieToWatchlist);

// ======== UI - Event listeners - LOGGED IN VIEW (WATCHLIST - MODAL)  ============================================================= ////

watchlistContainer.addEventListener("dblclick", deleteMovieFromWatchlist);

closeModalBtn.addEventListener("click", closeWatchlistModal);

// ======== Main ============================================================= ////

// if the user is LOGGED IN - query the "movies" collection for the user's movies
// wait for the movies to be fetched
// log each movie title to the console
// render the movie data on the page
// after a 2-second delay, it displays the logged-in view
// if the user is LOGGED OUT - wait for 500ms and then show the logged-out view
// log to the console that no user is currently signed in

onAuthStateChanged(auth, (user) => {
  if (user) {
    showCreateAccountSuccess();

    const uid = user.uid;
    const q = query(collection(db, "movies"), where("uid", "==", uid));

    setTimeout(showLoggedInView, 2000);

    try {
      getDocs(q).then((querySnapshot) => {
        querySnapshot.forEach((doc) => {
          console.log(
            `User ${user.uid} currently has "${doc.data().title}" in watchlist`
          );
          renderMoviesHtmlInWatchlist(watchlistContainer, doc.data());
        });
      });
    } catch (error) {
      console.log(error.message);
    }
    console.log(`User ${user.uid} is logged in!`);
  } else {
    setTimeout(showLoggedOutView, 500);
    console.log("No user is currently signed in");
  }
});

// ======== Functions - Firebase  ============================================================= ////

// when the user is LOGGED IN reset the input fields
// clear messages to the user
// or if log in fails show user error messages

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
      console.error(error.message);
      showUserError();
    });
}

function authCreateAccWithEmail() {
  const email = registerEmailInput.value;
  const password = registerPasswordInput.value;

  createUserWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      showCreateAccountSuccess();
    })
    .catch((error) => {
      console.error(error.message);
      showCreateAccountError();
    });
}

function authSignOut() {
  signOut(auth)
    .then(() => {
      searchResults.innerHTML = "";
      location.reload(); // temporary solution to render watchlist changes
      resetCreateAcccountMessages();
    })
    .catch((error) => {
      console.error(error.message);
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

// send a request to the movie database API, passing the search query (inputValue) and API key
// once the data is fetched, filter out the movies that don’t have a poster, overview and genres
// render them on the page and updates the UI to display the number of movies found
// if no results are found, show a message to the user indicating that no movies were found and ask them to try again

function fetchMovies(inputValue) {
  fetch(
    `${baseUrl}3/search/movie?query=${inputValue}&api_key=${
      import.meta.env.VITE_WATCHER_API_KEY // Vite only exposes environment variables prefixed with VITE_
    }`
  )
    .then((response) => response.json())
    .then((data) => {
      const fetchedMovies = data.results;
      const filteredFetchedMovies = fetchedMovies.filter(
        (movie) => movie.poster_path && movie.overview && movie.genre_ids
      );
      // console.log(filteredFetchedMovies);
      if (data.total_results > 0) {
        renderFetchedMoviesHtml(filteredFetchedMovies);
        // console.log(filteredFetchedMovies.length);
        searchResultsCount.innerHTML = `${filteredFetchedMovies.length} movies found (DOUBLE CLICK to add/delete movies from watchlist!)`;
      } else {
        // console.log("Zero results found");
        searchResults.innerHTML = `
        <p id="search-message" class="search-message">Unable to find what you are looking for. Please try again!</p>
        `;
        searchResultsCount.innerHTML = ``;
      }
    });
}

// render fetched movies and their details in search results container
// add information (datasets) and an ID to each "Add To Watchlist" button

function renderFetchedMoviesHtml(searchResultsArr) {
  let html = "";

  for (let movie of searchResultsArr) {
    html += `
  <div class="movie" id="movie">
    <div class="movie-primary">
      <img 
        class="movie-poster"
        src="https://image.tmdb.org/t/p/original${movie.poster_path}" 
        alt="${movie.title} poster"
        >
    </div>
    <div class="movie-secondary">
      <h2 class="movie-heading">${movie.title}</h2>
      <p class="movie-genres">GENRES : ${getMovieGenreName(
        movie.genre_ids
      ).join(", ")}
      </p>
      <p class="movie-overview">OVERVIEW : ${movie.overview}</p>
      <div class="movie-btn-container">
        <button class="add-to-watchlist-btn"
          data-id="${movie.id}"  
          data-poster="${movie.poster_path}" 
          data-title="${movie.title}"
          data-overview="${movie.overview}"
          aria-label="Add movie to watchlist"
          >  
          Add To Watchlist
        </button>
        
      </div>
    </div>
  </div>
  <hr>
      `;
  }

  searchResults.innerHTML = html;
  yarn.value = "";
  // console.log(movie);
}

// when user doubleclicks on "Add To Watchlist" button in search results -
// check if the target element has a data-id attribute
// if its true, create an object of the movie's details with UID
// add the movie object to the database (if it does not already exists)
// reload page to render changes in the database
// if an error occurs at any point, log an error message

async function addMovieToWatchlist(event) {
  if (event.target.dataset.id) {
    let dataAttribute = event.target.dataset;
    const user = auth.currentUser;

    try {
      const docRef = await setDoc(doc(db, "movies", dataAttribute.id), {
        poster: dataAttribute.poster,
        title: dataAttribute.title,
        overview: dataAttribute.overview,
        id: dataAttribute.id,
        uid: user.uid,
      });
      console.log(`Movie written with ID: ${dataAttribute.id} `);
      alert("Movie added to watchlist");
      location.reload(); // temporary solution to render watchlist changes
    } catch (error) {
      console.error("Error adding movie: ", error.message);
    }
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

// render movies in the watchlist with dataset attributes

function renderMoviesHtmlInWatchlist(watchlistContainer, movieData) {
  emptyWatchlist.innerHTML = "";

  watchlistContainer.innerHTML += `
  <li class="watchlist-movie-container" id="watchlist-movie-container">
      <div class="watchlist-movie" id="watchlist-movie"> 
        <div class="watchlist-movie-primary">
          <img 
          class="watchlist-movie-poster"
          src="https://image.tmdb.org/t/p/original${movieData.poster}"
          alt="${movieData.title} poster"
          loading="lazy"
          >
        </div>
        <div class="watchlist-movie-secondary">
          <h2 class="watchlist-movie-heading">${movieData.title}</h2>
          <p class="watchlist-overview">OVERVIEW : ${movieData.overview}</p>
          <div class="watchlist-btn-container">
            <button class="delete-from-watchlist-btn"
              data-uid="${movieData.uid}" 
              data-id="${movieData.id}"
              data-poster="${movieData.poster}" 
              data-title="${movieData.title}"
              data-overview="${movieData.overview}"
              aria-label="Delete movie from watchlist">
              Delete From Watchlist
            </button>
          </div>
        </div>
      </div>
    </li>
  <hr> 
      `;
}

// when user doubleclicks on "Delete From Watchlist" button in watchlist -
// check if the target element has a data-id attribute
// if its true, remove the movie object from the database
// reload page to render changes in the database
// if an error occurs at any point, log an error message

async function deleteMovieFromWatchlist(event) {
  if (event.target.dataset.id) {
    let dataAttribute = event.target.dataset;
    const user = auth.currentUser;

    try {
      const docRef = await deleteDoc(doc(db, "movies", dataAttribute.id), {
        poster: dataAttribute.poster,
        title: dataAttribute.title,
        overview: dataAttribute.overview,
        id: dataAttribute.id,
        uid: user.uid,
      });
      console.log(`Delete movie written with ID: ${dataAttribute.id} `);
      alert("Movie deleted from watchlist");
      location.reload(); // temporary solution to render watchlist changes
    } catch (error) {
      console.error("Error deleting movie: ", error.message);
    }
  }
}
