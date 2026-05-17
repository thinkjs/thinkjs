# think-monitor
thinkjs 3.0 server monitor, alive, cpu, memory

监控 thinkjs 3.0 服务器健康状态的服务。

- 个人倾向不用插入代码 ？使用 agent 收集，thinkjs 标记一下进程。
- 只针对 cpu，内存，磁盘，存活等基本通用指标。
- 支持单服务，多机器节点。
- 支持 master 进程和 worker 进程横比。也支持多机器横比。
- 支持心跳监控可用度。

## 数据采集方式思考

var cluster = require('cluster');
cluster.fork();
cluster.fork();
cluster.fork();
process.title = 'tj3-' + (cluster.isMaster ? 'master' : 'worker');
function doSomething() {
  setTimeout(doSomething, 1000);
}
doSomething();


//  ps -o %cpu,%mem -p $(pgrep tj3-*)


## 数据展现和目的思考


cpu，内存和磁盘，在 master 和 多个 worker 进程的横向对比。 预警内存泄漏，负载是否均衡，是否遭到攻击等。

实例的进出带宽。

存活监控，通过定时往端口发送心跳，监控可用度。


## 是否收集日志已获得更多业务层面的数据

目前觉得没有必要都做在一起，可以实现业务自己记录 log 数据，然后用 kafka 手机数据记录到专门的监控程序实现。

## 通常监控流程

数据收集 -> 进入总线队列 -> 数据消费 -> （生成分析数据）-> 入库 -> 展示
