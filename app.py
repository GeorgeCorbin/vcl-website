from flask import Flask, render_template, request, jsonify

app = Flask(__name__)

# Dummy data for votes
votes = {
    'game1': {'team1': 0, 'team2': 0},
    'game2': {'team3': 0, 'team4': 0}
}

@app.route('/')
def home():
    total_votes_game1 = sum(votes['game1'].values())
    total_votes_game2 = sum(votes['game2'].values())
    # Pass data to the frontend
    return render_template('index.html',
                           game1=votes['game1'],
                           game2=votes['game2'],
                           total1=total_votes_game1,
                           total2=total_votes_game2)

@app.route('/vote', methods=['POST'])
def vote():
    data = request.json
    game_id = data['game_id']
    team_id = data['team_id']
    votes[game_id][team_id] += 1
    return jsonify(success=True, votes=votes)

if __name__ == '__main__':
    app.run(debug=True)
