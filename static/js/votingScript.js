function vote(gameId, homeId, awayId, theVote) {
    // Replace spaces with underscores to match the HTML IDs
    const newGameId = gameId.replace(/\s+/g, '_');
    const safeGameId = newGameId.replace('&', '\\&');

    fetch('/vote', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ game_id: gameId, homeId: homeId, awayId: awayId, theVote: theVote })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok ' + response.statusText);
        }
        return response.json();
    })
    .then(data => {
        if(data.success) {
            let awayPercentRounded = Number(data.away_team_percent.toFixed(1));
            let homePercentRounded = Number(data.home_team_percent.toFixed(1));

            document.querySelector(`#awayPercent-${safeGameId}`).innerText = `${awayPercentRounded}%`;
            document.querySelector(`#homePercent-${safeGameId}`).innerText = `${homePercentRounded}%`;

        } else {
            console.error("Vote failed:", data.message);
        }
    })
    .catch(error => console.error('There has been a problem with your fetch operation:', error));
}


