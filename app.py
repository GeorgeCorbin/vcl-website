import copy
import time

from flask import Flask, render_template, request, jsonify
from datetime import datetime, timedelta
import locale

from scraper import *

app = Flask(__name__)

# Dummy data for votes
# votes = {
#     'game1': {'team1': 0, 'team2': 0},
#     'game2': {'team3': 0, 'team4': 0}
# }

votes = {}
vote_percentages = {}

# Set locale to English to ensure weekday and month abbreviations are correctly interpreted
locale.setlocale(locale.LC_ALL, 'en_US.UTF-8')

current_month = time.strftime("%m")
all_dataframes = []


def largeDataFrame(total_pages):
    for page_number in range(1, total_pages + 1):  # Assuming the pages are numbered from 1 to 9
        html_content = fetch_table_data(month=current_month, page_number=page_number)
        table_data = parse_table(html_content)
        new_df = convert_to_dataframe(table_data)
        # print(new_df)
        all_dataframes.append(new_df)
    return pd.concat(all_dataframes, ignore_index=True)


@app.route('/games')
def games():
    df = largeDataFrame(5)

    # Assuming df is your DataFrame and is already populated with data
    games_list = df.to_dict(orient='records')
    filtered_games = []
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
        if 0 <= delta_days <= 7:
            filtered_games.append(game)

        game_id = game['game_id']
        game_votes = votes.get(game_id,
                               {game['home_team_id']: 0, game['away_team_id']: 0})  # votes should be your global dictionary tracking all votes

        game['away_team_percent'] = calculate_percentage(game_votes, game['away_team_id'])
        game['home_team_percent'] = calculate_percentage(game_votes, game['home_team_id'])

        updated_games_list.append(game)

    return render_template('games_content.html',
                           games=filtered_games)


def calculate_percentage(game_votes, team_id):
    # Assuming game_votes is a dictionary with team votes
    total_votes = sum(game_votes.values())
    team_votes = game_votes.get(team_id, 0)

    return (team_votes / total_votes * 100) if total_votes > 0 else 0

# @app.route('/games')
# def games_content():
#     return render_template('games_content.html')


@app.route('/')
def home():
    # Pass data to the frontend
    return render_template('index.html')


@app.route('/vote', methods=['POST'])
def vote():
    data = request.json
    # print(f"Incoming data: {data}")  # Debug print

    game_id = data.get('game_id')
    team_id = data.get('team_id')
    opposing_team_id = data.get('opposing_team_id')
    # print(opposing_team_id)

    # Ensure game_id and team_id are present
    if not game_id or not team_id:
        # print(f"Missing game_id or team_id. game_id: {game_id}, team_id: {team_id}")
        return jsonify(success=False, message="Missing data"), 400

    # Initialize the game in votes if it doesn't exist
    if game_id not in votes:
        # print(f"Missing game_id from votes: {game_id}, votes: {votes}")
        votes[game_id] = {team_id: 0, opposing_team_id: 0}
        # print(f"Initialize game_id in votes: {game_id}, votes: {votes}")

    # Increment the vote count for the selected team
    if team_id in votes[game_id]:
        votes[game_id][team_id] += 1
        # print(votes[game_id][team_id])
    else:
        # print(f"FAILED: Missing team_id in votes[game_id]: {team_id}, votes: {votes[game_id]}")
        return jsonify(success=False, message="Invalid team ID"), 400
    return jsonify(success=True, votes=votes[game_id])

    # print(f"Received vote for game_id: {game_id}, team_id: {team_id}")
    # vote_percentage = copy.deepcopy(votes)
    # print(f"Updated votes: {votes}")
    # for game_id, vote_counts in votes.items():
    #     # Assuming vote_counts is structured like: {'team1_id': vote_count, 'team2_id': vote_count}
    #     print(vote_counts.items())
    #
    #     # Calculate the percentages
    #     for team_id, count in vote_counts.items():
    #         percentage = calculate_percentage(vote_counts, team_id)
    #         print(f"Game ID: {game_id}, Team ID: {team_id}, Vote Percentage: {percentage}")
    #
    #         # Update the dictionary or handle the calculated percentage as needed
    #         # For example, if you want to store the percentages back in votes:
    #         vote_percentage[game_id][f"{team_id}"] = percentage
    #         print(vote_counts.items())
    #         print(vote_percentage)

if __name__ == '__main__':
    app.run(debug=True)
