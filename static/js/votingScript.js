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

//function highlightBox(element) {
//  // Remove the 'selected' class from any previously clicked select-box elements
//  document.querySelectorAll('.select-box.selected').forEach((box) => {
//    box.classList.remove('selected');
//  });
//
//  // Add the 'selected' class to the clicked element
//  element.classList.add('selected');
//}
function highlightBox(selectedElement, gameId, team) {
  // Query all boxes within the same game
  const gameBoxes = document.querySelectorAll(`.select-box[data-game-id='${gameId}']`);

  // Remove 'selected' class from all boxes within the same game
  gameBoxes.forEach(box => {
    box.classList.remove('selected');
  });

  // Add the 'selected' class to the clicked element
  selectedElement.classList.add('selected');

  // Save the selected state to localStorage
  localStorage.setItem(`selected-${gameId}`, team);

  document.addEventListener('DOMContentLoaded', () => {
  // Query all select-box elements
  const selectBoxes = document.querySelectorAll('.select-box');
  selectBoxes.forEach(box => {
    const gameId = box.dataset.gameId;
    const votedTeam = localStorage.getItem(`selected-${gameId}`);
    if (votedTeam && box.dataset.team === votedTeam) {
      box.classList.add('selected');
    }
  });
});
}

// Restore selections when the page loads
//document.addEventListener('DOMContentLoaded', () => {
//  const games = document.querySelectorAll('.select-box[data-game-id]');
//  games.forEach(box => {
//    const gameId = box.dataset.gameId;
//    const selectedTeam = localStorage.getItem(`selected-${gameId}`);
//
//    // Check if the current box corresponds to the selected team
//    if (box.dataset.team === selectedTeam) {
//      box.classList.add('selected');
//    }
//  });
//});


