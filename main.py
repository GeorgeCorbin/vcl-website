from flask import Flask, render_template_string

app = Flask(__name__)

HTML_TEMPLATE = '''
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Select a Box</title>
  <style>
    body, html {
      height: 100%;
      margin: 0;
      display: flex;
      justify-content: center;
      align-items: center;
    }
    .container {
      text-align: center;
    }
    .box {
      width: 100px;
      height: 100px;
      margin: 10px;
      display: inline-block;
      background-color: #f0f0f0;
      text-align: center;
      vertical-align: middle;
      line-height: 100px;
      cursor: pointer;
    }
    .selected {
      background-color: #add8e6;
    }
  </style>
  <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
</head>
<body>
  <div class="container">
    <div id="box1" class="box">Box 1</div>
    <div id="box2" class="box">Box 2</div>
    <p id="selection">No box selected</p>
  </div>

  <script>
    $(document).ready(function(){
      $('.box').click(function(){
        $('.box').removeClass('selected');
        $(this).addClass('selected');
        $('#selection').text($(this).text() + ' selected');
      });
    });
  </script>
</body>
</html>
'''

@app.route('/')
def home():
    return render_template_string(HTML_TEMPLATE)

if __name__ == '__main__':
    app.run(debug=True)
