function vote(gameId, homeId, awayId) {
    // Replace spaces with underscores to match the HTML IDs
    const safeGameId = gameId.replace(/\s+/g, '_');

    fetch('/vote', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ game_id: gameId, homeId: homeId, awayId: awayId })
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
//    .then(data => {
//        if(data.success) {
//            // Handle success response
////            console.info()
////            reloadPage()
////            fetchGames()
////            refreshPage()
//            updateValue()
//        } else {
//            // Handle failure response
//            console.error("Vote failed:", data.message);
//        }
//    })
    .catch(error => console.error('There has been a problem with your fetch operation:', error));
}
function fetchGames() {
    fetch('/games')
        .then(response => response.text())
        .then(html => {
            document.getElementById('gamesContainer').innerHTML = html;
        })
        .catch(error => console.error('Error loading the games:', error));
}
// TODO: Current Error with refreshPage Method
function refreshPage() {
    fetch('/games')
        .then(response => response.text())
        .then(newHtml => {
            console.log("Fetched new HTML: ", newHtml);  // Check the fetched HTML content
            const newDoc = new DOMParser().parseFromString(newHtml, 'text/html');
            document.replaceChild(newDoc.body, document.body);
        })
        .catch(error => console.error('Error refreshing the page:', error));
}

function reloadPage() {
    window.location.reload(true);
}

function updateValue() {
    fetch('/games')
        .then(response => response.json())  // Assuming the server response is JSON
        .then(data => {
            document.getElementById('dynamicValue').innerText = data.newValue;
        })
        .catch(error => console.error('Error fetching new value:', error));
}


