<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="ie=edge">
  <title>Monitor</title>
</head>
<body>
  <form method="post">
    <fieldset>
      <legend>zhipin: {{zhipinStatus}}</legend>
      <input type="text" name="session" value="" required>
      <button type="submit" formaction="/zhipin/start" {{ "disabled" if zhipinStatus else "" }}>start</button>
      <button type="submit" formaction="/zhipin/stop" {{ "" if zhipinStatus else "disabled" }}>stop</button>
    </fieldset>
    <fieldset>
      <legend>lagou: {{lagouStatus}}</legend>
      <button type="submit" formaction="/lagou/start" {{ "disabled" if lagouStatus else "" }}>start</button>
      <button type="submit" formaction="/lagou/stop" {{ "" if lagouStatus else "disabled" }}>stop</button>
    </fieldset>
  </form>
</body>
</html>