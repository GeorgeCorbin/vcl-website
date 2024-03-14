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
        } else {
            // Handle failure response
        }
    })
    .catch(error => console.error('There has been a problem with your fetch operation:', error));
}
