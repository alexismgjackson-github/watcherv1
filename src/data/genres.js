// Function to map genre IDs to their corresponding genre names

function getMovieGenreName(array) {
  // Use the map function to iterate over the genre IDs in the provided array
  return array.map(function (id) {
    // Switch statement to match each genre ID to its corresponding genre name
    switch (id) {
      case 28:
        return "Action";
      case 12:
        return "Adventure";
      case 16:
        return "Animation";
      case 35:
        return "Comedy";
      case 80:
        return "Crime";
      case 99:
        return "Documentary";
      case 18:
        return "Drama";
      case 10751:
        return "Family";
      case 14:
        return "Fantasy";
      case 36:
        return "History";
      case 27:
        return "Horror";
      case 10402:
        return "Music";
      case 9648:
        return "Mystery";
      case 10749:
        return "Romance";
      case 878:
        return "Science Fiction";
      case 10770:
        return "TV Movie";
      case 53:
        return "Thriller";
      case 10752:
        return "War";
      case 37:
        return "Western";
      default:
        // Return "Unknown Genre" if the genre ID doesn't match any of the cases
        return "Unknown Genre";
    }
  });
}

// Export the function so it can be used in other parts of the application
export { getMovieGenreName };
