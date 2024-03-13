function votes(gameId, teamId, element) {
    fetch('/vote', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ game_id: gameId, team_id: teamId })
    })
    .then(response => response.json())
    .then(data => {
        // Update the vote count on the page
        console.log('Vote counted', data);
    })
    .catch(error => {
        console.error('Error:', error);
    });
}
