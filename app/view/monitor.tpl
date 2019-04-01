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
      <legend>zhipin: 
        {% if zhipinStatus %}
          已授权，正在执行中！
        {% else %}
          已停止
        {% endif %}
      </legend>
      <input type="text" name="session" value="">
      <button type="submit" formaction="/zhipin/start" {{ "disabled" if zhipinStatus else "" }}>1. Start Get List</button>
      <button type="submit" formaction="/zhipin/items/start" {{ "disabled" if zhipinStatus else "" }}>2. Start Get Items</button>
      <button type="submit" formaction="/zhipin/items/update" {{ "disabled" if zhipinStatus else "" }}>3. Update Older Items Status</button>
      <button type="submit" formaction="/zhipin/stop" {{ "" if zhipinStatus else "disabled" }}>Stop</button>
    </fieldset>
  </form>
  <form method="post">
    <fieldset>
      <legend>lagou:
      {% if lagouStatus %}
          已授权，正在执行中！
        {% else %}
          已停止
        {% endif %}
      </legend>
      <button type="submit" formaction="/lagou/start" {{ "disabled" if lagouStatus else "" }}>Start Get List</button>
      <button type="submit" formaction="/lagou/items/start" {{ "disabled" if lagouStatus else "" }}>Start Get Items</button>
      <button type="submit" formaction="/lagou/items/update" {{ "disabled" if lagouStatus else "" }}>Update Older Items Status</button>
      <button type="submit" formaction="/lagou/stop" {{ "" if lagouStatus else "disabled" }}>Stop</button>
    </fieldset>
  </form>
  <script>
  {% if zhipinStatus %}
    setTimeout(()=>{
      location.reload()
    },5000)
  {% elif lagouStatus %}
    setTimeout(()=>{
      location.reload()
    },5000)
  {% endif %}
  </script>
</body>
</html>