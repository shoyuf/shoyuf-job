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
        {# {{zhipin | dump |safe}} #}
        <legend>zhipin: 
        {% if zhipin.status %}
          已授权，正在执行中！
        {% else %}
          已停止
        {% endif %}
        </legend>
        <label for="keyword">
          keyword:
          <input type="text" id="keyword" name="keyword" value="{{zhipin.query.keyword}}" required>
        </label>
        <label for="mpt">
          mpt:
          <input type="text" id="mpt" name="mpt" value="{{zhipin.query.mpt}}" required>
        </label>
        <label for="wt">
          wt:
          <input type="text" id="wt" name="wt" value="{{zhipin.query.wt}}" required>
        </label>
        <label for="city">
          city:
          <select name="city" id="city" required>
            {% for item in zhipin.condition.hotCityList %}
              <option value="{{item.code}}" {{"selected" if zhipin.query.city == item.code else ""}}>{{item.name}}</option>
            {% endfor %}
          </select>
        </label>
        <br>
        {# <button type="submit" formaction="/zhipin/condition">Get Condition</button> #}
        <button type="submit" formaction="/zhipin/start" {{ "disabled" if zhipin.executed else "" }}>1. Start Get List</button>
        <button type="submit" formaction="/zhipin/items/start" {{ "disabled" if zhipin.executed else "" }}>2. Start Get Items</button>
        <button type="submit" formaction="/zhipin/items/update" {{ "disabled" if zhipin.executed else "" }}>3. Update Older Items Status</button>
        <button type="submit" formaction="/zhipin/stop" {{ "" if zhipin.executed else "disabled" }}>Stop</button>
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
      {% if zhipin.status %}
        setTimeout(() => {
          location.reload()
        }, 5000)
      {% elif lagouStatus %}
        setTimeout(() => {
          location.reload()
        }, 5000)
      {% endif %}
    </script>
  </body>
</html>