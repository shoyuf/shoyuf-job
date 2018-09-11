<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="ie=edge">
  <title>Document</title>
</head>
<body>
  <form method="post">
    <input type="text" name="session" value="da228d4ea2f2a7ccff55feead7501171" required>
    <button type="submit" formaction="/zhipin/start" {{ "disabled" if executedFlag else "" }}>start</button>
    <button type="submit" formaction="/zhipin/stop" {{ "" if executedFlag else "disabled" }}>stop</button>
  </form>
  status: <code>{{executedFlag}}</code>
  
</body>
</html>