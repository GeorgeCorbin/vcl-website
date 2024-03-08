from flask import Flask, render_template_string

app = Flask(__name__)

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
    }
    .team-logo {
      margin-right: 10px;
    }
    .vote-percent {
      margin-left: auto;
    }
    .vote-button {
      margin-left: 10px;
      -webkit-appearance: none;
      background-color: #f0f0f0;
      border-radius: 50%;
      border: none;
      width: 20px;
      height: 20px;
      cursor: pointer;
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
      <div class="team-logo"><img src="/Users/georgecorbin/PycharmProjects/polling/gtlogo.png"></div>
      <div>Team 1</div>
      <div class="vote-percent">49%</div>
      <input type="radio" name="team1vote" class="vote-button">
    </div>
    <div class="team">
      <div class="team-logo">[Team 2 Logo]</div>
      <div>Team 2</div>
      <div class="vote-percent">51%</div>
      <input type="radio" name="team1vote" class="vote-button">
    </div>
  </div>
  <div class="matchup">
    <div class="timer">Closes in 18 hrs</div>
    <div class="team">
      <div class="team-logo">[Team 3 Logo]</div>
      <div>Team 3</div>
      <input type="radio" name="team2vote" class="vote-button">
    </div>
    <div class="team">
      <div class="team-logo">[Team 4 Logo]</div>
      <div>Team 4</div>
      <input type="radio" name="team2vote" class="vote-button">
    </div>
  </div>
</body>
</html>
'''

@app.route('/')
def home():
    return render_template_string(HTML_TEMPLATE)

if __name__ == '__main__':
    app.run(debug=True)
