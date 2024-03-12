from flask import Flask, render_template_string

app = Flask(__name__)

# Dummy data for votes - in a real app, this would come from a database
votes = {
    'team1': 49,
    'team2': 51,
    'team3': 75,
    'team4': 25,
}
total_votes_game1 = votes['team1'] + votes['team2']
total_votes_game2 = votes['team3'] + votes['team4']

HTML_TEMPLATE = '''
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>VCL Pick'Em</title>
  <style>
    body, html {
      height: 100%;
      margin: 0;
      color: white;
      background-color: #121212;
      font-family: Arial, sans-serif;
    }
    .header {
      background-color: #1e1e1e;
      padding: 10px;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .logo {
      font-size: 1.5em;
      font-weight: bold;
    }
    .score-box {
      background-color: #333;
      padding: 5px 10px;
      border-radius: 5px;
    }
    .matchup {
      background-color: #252526;
      margin: 20px;
      padding: 10px;
      border-radius: 5px;
    }
    .team {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 10px;
    }
    .team-logo {
      margin-right: 10px;
    }
    .vote-percent {
      margin-left: auto;
    }
    .select-box {
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      width: 100px;
      height: 100px;
      border: 1px solid #f0f0f0;
      margin-right: 10px;
    }
    .select-box img {
      max-width: 80%;
      max-height: 80%;
    }
    .timer {
      font-size: 0.8em;
      color: #999;
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="logo">VCL</div>
    <div class="score-box">Season 0/0</div>
    <div class="score-box">This Week 0/5</div>
  </div>
  <div class="matchup">
    <div class="timer">Closes in 18 hrs</div>
    <div class="team">
      <label class="select-box">
        <input type="radio" name="game1vote" style="display:none" onclick="alert('You voted for Team 1!')" />
        <img src="/Users/georgecorbin/PycharmProjects/polling/Georgia Tech.png" alt="Team 1 Logo">
      </label>
      <div class="vote-percent">{{ team1_percent }}%</div>
    </div>
    <div class="team">
      <label class="select-box">
        <input type="radio" name="game1vote" style="display:none" onclick="alert('You voted for Team 2!')" />
        <img src="path_to_team2_logo.png" alt="Team 2 Logo">
      </label>
      <div class="vote-percent">{{ team2_percent }}%</div>
    </div>
  </div>
  <div class="matchup">
    <div class="timer">Closes in 18 hrs</div>
    <div class="team">
      <label class="select-box">
        <input type="radio" name="game2vote" style="display:none" onclick="alert('You voted for Team 3!')" />
        <img src="path_to_team3_logo.png" alt="Team 3 Logo">
      </label>
      <div class="vote-percent">{{ team3_percent }}%</div>
    </div>
    <div class="team">
      <label class="select-box">
        <input type="radio" name="game2vote" style="display:none" onclick="alert('You voted for Team 4!')" />
        <img src="path_to_team4_logo.png" alt="Team 4 Logo">
      </label>
      <div class="vote-percent">{{ team4_percent }}%</div>
    </div>
  </div>
</body>
</html>
'''


@app.route('/')
def home():
    # Calculate the vote percentages
    team1_percent = round((votes['team1'] / total_votes_game1) * 100, 1)
    team2_percent = round((votes['team2'] / total_votes_game1) * 100, 1)
    team3_percent = round((votes['team3'] / total_votes_game2) * 100, 1)
    team4_percent = round((votes['team4'] / total_votes_game2) * 100, 1)

    return render_template_string(HTML_TEMPLATE,
                                  team1_percent=team1_percent,
                                  team2_percent=team2_percent,
                                  team3_percent=team3_percent,
                                  team4_percent=team4_percent)


if __name__ == '__main__':
    app.run(debug=True)
