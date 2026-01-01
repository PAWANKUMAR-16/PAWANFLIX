const API_KEY = "4e7f4191"; 
const movieGrid = document.getElementById('movie-grid');
const movieInput = document.getElementById('movie-input');
const themeToggle = document.getElementById('theme-toggle');
let moviesData = [];

// Mandatory Fetch Logic [cite: 43, 44]
async function fetchMovies(title) {
    if (!title.trim()) { alert("Please enter a title!"); return; }
    try {
        movieGrid.innerHTML = "<p>Scanning Database...</p>";
        const response = await fetch(`https://www.omdbapi.com/?s=${encodeURIComponent(title)}&apikey=${API_KEY}`);
        const data = await response.json();

        if (data.Response === "True") {
            // Mandatory: Fetching detailed info for Title, Poster, Year, Genre, Plot, Rating [cite: 45]
            const detailedRequests = data.Search.slice(0, 10).map(movie => 
                fetch(`https://www.omdbapi.com/?i=${movie.imdbID}&apikey=${API_KEY}`).then(res => res.json())
            );
            moviesData = await Promise.all(detailedRequests);
            displayMovies(moviesData);
        } else {
            // Mandatory Error Handling [cite: 48]
            movieGrid.innerHTML = `<p class="error-msg">No results found for "${title}".</p>`;
        }
    } catch (error) { movieGrid.innerHTML = `<p>Check connection or API Key activation.</p>`; }
}

function displayMovies(movies) {
    movieGrid.innerHTML = "";
    movies.forEach(movie => {
        const card = document.createElement('div');
        card.className = 'movie-card';
        // Displaying mandatory features [cite: 45]
        card.innerHTML = `
            <img src="${movie.Poster !== 'N/A' ? movie.Poster : 'https://via.placeholder.com/380x500'}" alt="Poster">
            <div class="info">
                <h3>${movie.Title}</h3>
                <span class="rating">⭐ IMDb: ${movie.imdbRating}</span>
                <p><strong>Year:</strong> ${movie.Year}</p>
                <p><strong>Genre:</strong> ${movie.Genre}</p>
                <p class="plot">${movie.Plot.substring(0, 90)}...</p>
            </div>
        `;
        movieGrid.appendChild(card);
    });
}

// Mandatory Sorting [cite: 53]
document.getElementById('sort-filter').addEventListener('change', (e) => {
    if (e.target.value === "year") moviesData.sort((a, b) => parseInt(b.Year) - parseInt(a.Year));
    if (e.target.value === "rating") moviesData.sort((a, b) => parseFloat(b.imdbRating) - parseFloat(a.imdbRating));
    displayMovies(moviesData);
});

// Advanced Features: Genre Recommendation & Top Rated
function recommendByGenre(genre) { movieInput.value = genre; fetchMovies(genre); }

async function fetchTopRated(type) {
    movieInput.value = `Best ${type}s`;
    await fetchMovies("Best"); // Fetch general results
    // Filter locally by type and rating for the "Recommendation" requirement [cite: 39]
    moviesData = moviesData.filter(m => m.Type === type);
    moviesData.sort((a, b) => parseFloat(b.imdbRating) - parseFloat(a.imdbRating));
    displayMovies(moviesData);
}

// Feature: Voice Search
const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
document.getElementById('voice-btn').onclick = () => { recognition.start(); document.getElementById('voice-btn').classList.add('listening'); };
recognition.onresult = (e) => { 
    document.getElementById('voice-btn').classList.remove('listening');
    movieInput.value = e.results[0][0].transcript; 
    fetchMovies(movieInput.value); 
};

// Feature: Theme Toggle
themeToggle.onclick = () => {
    document.body.classList.toggle('light-mode');
    const isLight = document.body.classList.contains('light-mode');
    themeToggle.innerHTML = isLight ? `<i class="fas fa-sun"></i>` : `<i class="fas fa-moon"></i>`;
};

document.getElementById('search-btn').onclick = () => fetchMovies(movieInput.value);