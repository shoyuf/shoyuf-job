<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title>List</title>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/ant-design-vue@1.3.7/dist/antd.min.css">
    <style>
      .position-desc {
        width: 400px;
        white-space: pre-wrap;
      }
    </style>
  </head>
  <body>
    <div id="app">
      {# <Layout> #}
      {# <Header>header</Header> #}
      {# <Layout> #}
      {# <Content> #}
      <a-table 
            :columns="columns"
            :bordered="true"
            :loading="loading"
            :row-key="record => record._id"
            :data-source="data"
            :pagination="false"
          >
        <template slot="zwmchms" slot-scope="text, record">
          <a-popover :title="record.positionName">
            <template slot="content">
              <div v-html="record.jobDesc" class="position-desc"></div>
            </template>
            <a-button ghost type="primary" v-text="record.jobName"></a-button>
          </a-popover>
        </template>
      </a-table>
      {# @change="handleTableChange" #}
      {# </Content> #}
      {# </Layout> #}
      {# <Footer>footer</Footer> #}
      {# </Layout> #}
    </div>
    <script src="https://cdn.jsdelivr.net/npm/moment@2.24.0/moment.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/axios@0.18.0/dist/axios.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/vue@2/dist/vue.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/ant-design-vue@1.3.7/dist/antd.min.js"></script>
    <script src="/public/js/admin-list.js"></script>
  </body>
</html>