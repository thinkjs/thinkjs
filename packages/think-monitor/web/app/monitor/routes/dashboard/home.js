import React from 'react';
import './style.scss';
import reqwest from 'reqwest';
import { Row, Col, DatePicker, Button } from 'antd';
import moment from 'moment';
import {quickSelects, intervals} from './config';
const { RangePicker } = DatePicker;
const ReactHighcharts = require('react-highcharts');
const Highcharts = ReactHighcharts.Highcharts;
import RBRadioGroup from 'rb-component/lib/rb-radio-group';
Highcharts.setOptions({
  global: {
    useUTC: false
  }
});

const createConfig = (title, unit, series, chartLoaded)=>({
  chart: {
    type: 'spline',
    animation: Highcharts.svg, // don't animate in old IE
    marginRight: 10,
    events: {
      load: function() {
        chartLoaded(this);
      }
    }
  },
  title: {
    text: title
  },
  xAxis: {
    type: 'datetime',
    tickPixelInterval: 100
  },
  credits: {
    enabled: false
  },
  yAxis: {
    lineWidth: 1,
    gridLineDashStyle: 'dot',
    title: {
      align: 'high',
      text: '单位：' + unit,
      offset: -20,
      rotation: 0,
      y: -20
    },
    plotLines: [{
      value: 0,
      width: 1,
      color: '#808080'
    }]
  },
  plotOptions: {
    series: {
      lineWidth: 1,
      marker: {radius: 3}
    }
  },
  tooltip: {
    formatter: function() {
      return '<b>' + this.series.name + '</b><br/>' +
        Highcharts.dateFormat('%Y-%m-%d %H:%M:%S', this.x) + '<br/>' +
        Highcharts.numberFormat(this.y, 2);
    }
  },
  legend: {
    enabled: true
  },
  exporting: {
    enabled: false
  },
  series
})

export default class extends React.Component {
  state = {
    interval: intervals[0],
    dynamic: false
  }

  componentWillMount() {
    this.handleClickQuickSelect(900000); // 15分钟
  }

  indexOf = (columns, name)=>{
    for(var i in columns) {
      if(columns[i] === name) {
        return i;
      }
    }
  }

  getSeriesName = series=>{
    var isMasterIndex = this.indexOf(series.columns, 'is_master');
    var isMaster = (series.values[0] || {})[isMasterIndex];
    return series.tags.pid + (isMaster ? ' (master)' : '');
  }

  loadData = ()=>{
    if(!this.state.range) return;
    var [start, end] = this.state.range;
    this.requestProcess({
      startTime: start.valueOf(),
      endTime: end.valueOf(),
      interval: this.state.interval[0]
    })
    .then(this.extractSeries)
    .then(({cpuSeries, memSeries})=>{
      var cpuConfig = createConfig('进程 cpu 使用率', '%', cpuSeries, cpuChart=>this.cpuChart = cpuChart);
      var memConfig = createConfig('进程内存使用', 'MB', memSeries, memChart=>this.memChart = memChart);
      this.setState({cpuConfig, memConfig}, this.dynamicLoad);
    });
  }

  extractSeries = (resp)=> {
    var series = resp.results[0].series;
    if(!Array.isArray(series)) return {};

    var memSeries = series.map(s=>{
      var heapUsedIndex = this.indexOf(s.columns, 'heap_used');
      return {
        name: this.getSeriesName(s),
        data: s.values.map(v=>([v[0], v[heapUsedIndex]/(1024*1024)]))
      }
    });
    var cpuSeries = series.map(s=>{
      var cpuUserIndex = this.indexOf(s.columns, 'cpu_user');
      var timeDiffIndex = this.indexOf(s.columns, 'time_diff');
      return {
        name: this.getSeriesName(s),
        data: s.values.map(v=>([v[0], Math.round(v[cpuUserIndex] / (v[timeDiffIndex] * 10))/100]))
      }
    });
    return {memSeries, cpuSeries};
  }

  dynamicLoad = ()=>{
    if(this.cancelDynamicLoad) {
      clearInterval(this.cancelDynamicLoad);
    }
    var lastPointX = this.getLastPointX();
    if(!this.state.dynamic || !lastPointX) return;

    this.cancelDynamicLoad = setInterval(()=>{
      this.requestProcess({
        startTime: lastPointX,
        endTime: Date.now(),
        interval: this.state.interval[0]
      }).then(this.extractSeries).then(({cpuSeries, memSeries})=>{

        if(memSeries && this.memChart.series) {
          memSeries = memSeries.reduce((obj, item)=>{
            obj[item.name] = item;
            return obj;
          }, {});
          this.memChart.series.forEach(s=>{
            let series = memSeries[s.name];
            if(series) {
              series.data.forEach(point=>s.addPoint(point));
              delete memSeries[s.name];
            }
          });
          for(var name in memSeries) {
            this.memChart.addSeries(memSeries[name]);
          }
        }

        if(cpuSeries && this.cpuChart.series) {
          cpuSeries = cpuSeries.reduce((obj, item)=>{
            obj[item.name] = item;
            return obj;
          }, {});

          this.cpuChart.series.forEach(s=>{
            let series = cpuSeries[s.name];
            if(series) {
              series.data.forEach(point=>s.addPoint(point));
              delete cpuSeries[s.name];
            }
          });
          for(var name in cpuSeries) {
            this.cpuChart.addSeries(cpuSeries[name]);
          }
        }
      });
    }, this.state.interval[2]);
  }

  requestProcess = (data)=>{
    return reqwest({
      url: '/process',
      method: 'get',
      crossOrigin: true,
      data
    })
  }

  getLastPointX = ()=> {
    var series = this.memChart.series;
    if(series.length === 0) return null;
    var xData = series[series.length - 1].xData;
    if(xData.length) {
      return xData[xData.length - 1];
    }
  }

  onChange = range=>{
    this.setState({range});
  }

  handleClickQuickSelect = value=>{
    var range = [moment(Date.now() - value), moment()];
    this.setState({range}, this.loadData);
  }

  render() {
    return (
      <div className="dashboard-page">
        <div className="dashboard-page__criteria">
          <label>时间范围：</label>
          <RangePicker
              showTime
              format="YYYY-MM-DD HH:mm:ss"
              placeholder={['Start Time', 'End Time']}
              onChange={this.onChange}
              value={this.state.range}
          />
          <Button.Group>
            {quickSelects.map((item, i)=>
              <Button key={i} onClick={()=>this.handleClickQuickSelect(item[0])}>{item[1]}</Button>
            )}
          </Button.Group>
        </div>
        <div className="dashboard-page__criteria">
          <RBRadioGroup label="时间间隔："
              items={intervals} itemLabel="1"
              checkedValue={this.state.interval}
              onChange={interval=>this.setState({interval}, this.loadData)}
          />
        </div>
        <div className="dashboard-page__criteria">
          <RBRadioGroup label="动态加载："
              items={[[false, '禁用'], [true, '启用']]} itemValue="0" itemLabel="1"
              checkedValue={this.state.dynamic}
              onChange={dynamic=>this.setState({dynamic}, this.loadData)}
          />
        </div>
        <div>
          <Row>
            <Col span={12}>{this.state.cpuConfig && <ReactHighcharts isPureConfig config={this.state.cpuConfig}/>}</Col>
            <Col span={12}>{this.state.memConfig && <ReactHighcharts isPureConfig config={this.state.memConfig}/>}</Col>
          </Row>
        </div>
      </div>
    );
  }
}