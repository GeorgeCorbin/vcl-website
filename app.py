from flask import Flask, render_template, request, jsonify

from scraper import *

app = Flask(__name__)

# Dummy data for votes
votes = {
    'game1': {'team1': 0, 'team2': 0},
    'game2': {'team3': 0, 'team4': 0}
}

@app.route('/games')
def games():
    html_content = fetch_table_data()
    table_data = parse_table(html_content)
    df = convert_to_dataframe(table_data)
    df.columns = ['Date', 'Time', 'Location', 'away_team_id', 'home_team_id']
    # Assuming df is your DataFrame and is already populated with data
    games_list = df.to_dict(orient='records')
    for game in games_list:
        game['game_id'] = f"{game.get('Date', '').replace('-', '')}{game.get('Time', '').replace(':', '')}{game.get('away_team_id', '').replace(' ', '')}{game.get('home_team_id', '').replace(' ', '')}"
    print(games_list)
    return render_template('games.html', games=games_list)


@app.route('/')
def home():
    html_content = fetch_table_data()
    table_data = parse_table(html_content)

    total_votes_game1 = sum(votes['game1'].values())
    total_votes_game2 = sum(votes['game2'].values())
    # Pass data to the frontend
    return render_template('index.html',
                           game1=votes['game1'],
                           game2=votes['game2'],
                           total1=total_votes_game1,
                           total2=total_votes_game2,
                           table_data=table_data)

@app.route('/vote', methods=['POST'])
def vote():
    data = request.json
    game_id = data['game_id']
    team_id = data['team_id']
    votes[game_id][team_id] += 1
    return jsonify(success=True, votes=votes)



if __name__ == '__main__':
    app.run(debug=True)
