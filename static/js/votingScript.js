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
            // Add the 'selected' class to the clicked element
//            element.classList.add('selected');

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

function highlightBox(selectedElement, gameId, team) {
  // Query all boxes within the same game
  const gameBoxes = document.querySelectorAll(`.select[data-game-id='${gameId}']`);

  // Remove 'selected' class from all boxes within the same game
//  gameBoxes.forEach(box => {
//    box.classList.remove('selected');
//  });

  // Add the 'selected' class to the clicked element
    selectedElement.classList.add('selected');

  // Save the selected state to localStorage
  localStorage.setItem(`selected-${gameId}`, team);
}

// Function to restore highlighting from localStorage
function restoreHighlights() {
  const allGames = document.querySelectorAll('.selected');
//  console.log(document.querySelectorAll('.selected');)
  allGames.forEach(game => {
//    console.log(game.getAttribute('data-game-id'))
    const gameId = game.getAttribute('data-game-id');
    const selectedTeamId = localStorage.getItem(`selected-${gameId}`);
    if (selectedTeamId && game.dataset.teamId === selectedTeamId) {
      game.classList.add('selected');
    }
  });
}

// Call restoreHighlighting when the page loads
document.addEventListener('DOMContentLoaded', restoreHighlights);


