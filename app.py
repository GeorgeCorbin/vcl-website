import copy
import time

from flask import Flask, render_template, request, jsonify, make_response
from datetime import datetime, timedelta
import locale

from scraper import *

app = Flask(__name__)

votes = {}
vote_percentages = {}

@app.route('/shop')
def shop():
    return render_template('shop.html')

# Set locale to English to ensure weekday and month abbreviations are correctly interpreted
locale.setlocale(locale.LC_ALL, 'en_US.UTF-8')

current_month = time.strftime("%m")
all_dataframes = []

def largeDataFrame(total_pages):
    all_dataframes.clear()  # Clear the list before appending new data frames.
    for page_number in range(1, total_pages + 1):  # Assuming the pages are numbered from 1 to 9
        html_content = fetch_table_data(month=current_month, page_number=page_number)
        table_data = parse_table(html_content)
        new_df = convert_to_dataframe(table_data)

        all_dataframes.append(new_df)
    return pd.concat(all_dataframes, ignore_index=True)


@app.route('/games')
def games():
    df = largeDataFrame(9)

    # Assuming df is your DataFrame and is already populated with data
    games_list = df.to_dict(orient='records')
    filtered_games_weekOnly = []
    current_date = datetime.now()
    updated_games_list = []

    for game in games_list:
        game[
            'game_id'] = f"{game.get('Date', '').replace('-', '')}{game.get('Time', '').replace(':', '')}{game.get('away_team_id', '').replace(' ', '')}{game.get('home_team_id', '').replace(' ', '')}"

        # Concatenate the current year with the game's date string
        game_date_str = str(current_date.year) + ' ' + game['Date']
        game_date = datetime.strptime(game_date_str, '%Y %a %b %d')
        # Calculate the difference in days and filter games within the next 7 days
        delta_days = (game_date - current_date).days
        # Weekday numbers in Python: Monday is 0, Tuesday is 1, ..., Sunday is 6.
        # Last Wednesday = -7 and this Wednesday = 2
        if -7 < delta_days < 2:
            filtered_games_weekOnly.append(game)

        game['game_id'] = game['game_id'].replace(' ', '_')  # Update game_id to be simple

        game_id = game['game_id']
        game_votes = votes.get(game_id,
                               {game['home_team_id']: 0,
                                game['away_team_id']: 0})  # votes should be your global dictionary tracking all votes

        game['away_team_percent'] = calculate_percentage(game_votes, game['away_team_id'])
        game['home_team_percent'] = calculate_percentage(game_votes, game['home_team_id'])

        updated_games_list.append(game)
    return render_template('games.html',
                           games=filtered_games_weekOnly)


def calculate_percentage(game_votes, team_id):
    # Assuming game_votes is a dictionary with team votes
    total_votes = sum(game_votes.values())
    team_votes = game_votes.get(team_id, 0)

    return (team_votes / total_votes * 100) if total_votes > 0 else 0


@app.route('/')
def home():
    # Pass data to the frontend
    return render_template('index.html')


@app.route('/vote', methods=['POST'])
def vote():
    data = request.json
    # print(f"Incoming data: {data}")  # Debug print

    game_id = data.get('game_id')
    homeId = data.get('homeId')
    awayId = data.get('awayId')
    theVote = data.get('theVote')

    # Ensure game_id and homeId are present
    if not game_id or not homeId:
        # print(f"Missing game_id or homeId. game_id: {game_id}, homeId: {homeId}")
        return jsonify(success=False, message="Missing data"), 400

    # Initialize the game in votes if it doesn't exist
    if game_id not in votes:
        # print(f"Missing game_id from votes: {game_id}, votes: {votes}")
        votes[game_id] = {homeId: 0, awayId: 0}
        # print(f"Initialize game_id in votes: {game_id}, votes: {votes}")

    # Check if the user has already voted
    if request.cookies.get(f'voted_{game_id}'):
        return jsonify(success=False, message="You have already voted."), 403

    # Increment the vote count for the selected team
    if theVote in votes[game_id]:
        votes[game_id][theVote] += 1
    else:
        # print(f"FAILED: Missing homeId in votes[game_id]: {homeId}, votes: {votes[game_id]}")
        return jsonify(success=False, message="Invalid team ID"), 400

    # Recalculate percentages after vote
    game_votes = votes[game_id]
    # print(game_votes)
    away_team_percent = calculate_percentage(game_votes, awayId)
    home_team_percent = calculate_percentage(game_votes, homeId)

    # Set a cookie indicating that this user has voted
    resp = make_response(jsonify(success=True, votes=votes[game_id], away_team_percent=away_team_percent,
                                 home_team_percent=home_team_percent))
    resp.set_cookie(f'voted_{game_id}', 'true', max_age=30 * 24 * 60 * 60)  # Expires in 30 days
    return resp
    # return jsonify(success=True, votes=votes[game_id], away_team_percent=away_team_percent, home_team_percent=home_team_percent)


if __name__ == '__main__':
    app.run(debug=True)
