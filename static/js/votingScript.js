function vote(gameId, teamId, opposingTeamId) {
    fetch('/vote', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ game_id: gameId, team_id: teamId, opposing_team_id: opposingTeamId })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok ' + response.statusText);
        }
        return response.json();
    })
    .then(data => {
        if(data.success) {
            // Handle success response
//            console.info()
//            refreshPage()
        } else {
            // Handle failure response
            console.error("Vote failed:", data.message);
        }
    })
    .catch(error => console.error('There has been a problem with your fetch operation:', error));
}
function fetchGames() {
    fetch('/games_content')
        .then(response => response.text())
        .then(html => {
            document.getElementById('gamesContainer').innerHTML = html;
        })
        .catch(error => console.error('Error loading the games:', error));
}

function refreshPage() {
    fetch('/games_content')
        .then(response => response.text())
        .then(newHtml => {
            console.log("Fetched new HTML: ", newHtml);  // Check the fetched HTML content
            const newDoc = new DOMParser().parseFromString(newHtml, 'text/html');
            document.replaceChild(newDoc.body, document.body);
        })
        .catch(error => console.error('Error refreshing the page:', error));
}
