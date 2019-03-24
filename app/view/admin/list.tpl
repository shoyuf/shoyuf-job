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
    <script>
      function initRender(text, record) {
        if (text) 
          return text;
        return '-'
      }
      new Vue({
        el: '#app',
        components: {
          Layout: antd.Layout,
          'a-table': antd.Table,
          'a-popover': antd.Popover,
          'a-button': antd.Button
        },
        data() {
          const h = this.$createElement;
          const self = this
          return {
            loading: true,
            data: [],
            columns: [
              // {dataIndex: 'positionId',title: '职位ID',},
              {
                dataIndex: 'companyFullName',
                title: '公司名称',
                customRender(t, r) {
                  return h('div', {}, [
                    h('span', {}, `${r.companyFullName || '-'}（${r.companyShortName || '-'}）`),
                    h('a', {
                      attrs: {
                        title: r.address
                      },
                      on: {
                        click: self
                          .openMap
                          .bind(self, r)
                      }
                    }, '地图位置')
                  ])
                }
              }, {
                dataIndex: 'companySize',
                title: '公司规模',
                filters: [],
                onFilter(value, record) {
                  return record.companySize === value
                }
              }, {
                dataIndex: 'positionName',
                title: '职位名称',
                scopedSlots: {
                  customRender: 'zwmchms'
                }
              }, {
                dataIndex: 'jobFrom',
                title: '职位来源',
                customRender(text, record, index) {
                  switch (text) {
                    case 'lagou':
                      return h('a', {
                        attrs: {
                          href: record.url,
                          target: '_blank'
                        }
                      }, 'L')
                      break;
                    case 'zhipin':
                      return h('a', {
                        attrs: {
                          href: `https://www.zhipin.com/job_detail/${record.jobId}.html`,
                          target: '_blank'
                        }
                      }, 'Z')
                      break;
                    default:
                      return '?'
                      break;
                  }
                },
                width: '62px'
              }, {
                dataIndex: 'salary_min',
                title: '最低薪资',
                width: '62px'
              }, {
                dataIndex: 'salary_max',
                title: '最高薪资',
                width: '62px'
              }, {
                dataIndex: 'jobExperience',
                title: '工作年限',
                filters: [],
                onFilter(value, record) {
                  return record.jobExperience === value
                }
              }, {
                dataIndex: 'stationname',
                title: '地铁站名',
                width: '62px',
                customRender: initRender
              }, {
                dataIndex: 'district',
                title: '所属区县',
                width: '62px',
                customRender: initRender
              }, {
                dataIndex: 'subwayline',
                title: '地铁线路',
                width: '62px',
                customRender: initRender
              }, {
                dataIndex: 'create_time',
                title: '创建时间',
                customRender(text) {
                  if (text) 
                    return moment(text).format('YYYY-MM-DD HH:mm');
                  return '-';
                }
              }, {
                dataIndex: 'update_time',
                title: '更新时间',
                customRender(text) {
                  if (text) 
                    return moment(text).format('YYYY-MM-DD HH:mm');
                  return '-';
                }
              }
            ]
          }
        },
        mounted() {
          this.fetch()
        },
        methods: {
          openMap(r) {
            // https://restapi.amap.com/v3/staticmap?size=652*174&markers=mid,0xFF0000,A:104.0737,30.68916&key=21b56a6cc83fad7668dbb0e9564759a7
            const url = `//uri.amap.com/marker?position=${r
              .longitude},${r
              .latitude}&name=${r
              .companyFullName}&coordinate=gaode`
              window
              .open(url, 'map', `width=600,height=500,centerscreen=yes`)
          },
          async fetch() {
            const res = await axios.get('/resources')
            this.loading = false
            this.data = res.data.list;
            for (let filter in res.data.filters) {
              const newArr = res
                .data
                .filters[filter]
                .map(e => {
                  if (e['_id']) {
                    return {text: e['_id'], value: e['_id']};
                  } else {
                    return {text: '-', value: '-'};
                  }
                })
              console.dir(newArr)
              this
                .columns
                .find(e => e.dataIndex === filter)
                .filters = newArr
            }
          }
        }
      })
    </script>
  </body>
</html>