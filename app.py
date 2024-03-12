import time

from flask import Flask, render_template, request, jsonify
from datetime import datetime, timedelta
import locale

from scraper import *


app = Flask(__name__)

# Dummy data for votes
votes = {
    'game1': {'team1': 0, 'team2': 0},
    'game2': {'team3': 0, 'team4': 0}
}

# Set locale to English to ensure weekday and month abbreviations are correctly interpreted
locale.setlocale(locale.LC_ALL, 'en_US.UTF-8')

current_month = time.strftime("%m")
all_dataframes = []

@app.route('/games')
def games():
    for page_number in range(1, 10):  # Assuming the pages are numbered from 1 to 9
        html_content = fetch_table_data(month=current_month, page_number=page_number)
        table_data = parse_table(html_content)
        new_df = convert_to_dataframe(table_data)
        # print(new_df)
        all_dataframes.append(new_df)
    df = pd.concat(all_dataframes, ignore_index=True)

    # Assuming df is your DataFrame and is already populated with data
    games_list = df.to_dict(orient='records')
    filtered_games = []
    current_date = datetime.now()
    for game in games_list:
        game['game_id'] = f"{game.get('Date', '').replace('-', '')}{game.get('Time', '').replace(':', '')}{game.get('away_team_id', '').replace(' ', '')}{game.get('home_team_id', '').replace(' ', '')}"
        # Concatenate the current year with the game's date string
        game_date_str = str(current_date.year) + ' ' + game['Date']
        game_date = datetime.strptime(game_date_str, '%Y %a %b %d')

        # Calculate the difference in days and filter games within the next 7 days
        delta_days = (game_date - current_date).days
        if 0 <= delta_days <= 7:
            filtered_games.append(game)
    # print(games_list)

    return render_template('games.html', games=filtered_games)


@app.route('/')
def home():
    # html_content = fetch_table_data()
    # table_data = parse_table(html_content)

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
