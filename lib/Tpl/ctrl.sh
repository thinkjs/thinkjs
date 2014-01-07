#!/bin/sh
DIR=`pwd`
NODE=`which node`
# get action
ACTION=$1

PID_FILE='./App/Runtime/Data/app.pid';

# help
usage() {
  echo "Usage: ./ctrl.sh {start|stop|restart}"
  exit 1;
}

get_pid() {
  if [ -f $PID_FILE ]; then
    echo `cat $PID_FILE`
  fi
}

# start app
start() {
  pid=`get_pid`

  if [ ! -z $pid ]; then
    echo 'server is already running'
  else
    nohup $NODE www/index.js 2>&1 &
    echo 'server is running'
  fi
}

# stop app
stop() {
  pid=`get_pid`
  if [ -z $pid ]; then
    echo 'server not running'
  else
    echo "server is stopping ..."
    kill -15 $pid
    rm -rf $PID_FILE;
    echo "server stopped !"
  fi
}

restart() {
  stop
  sleep 0.5
  echo =====
  start
}

case "$ACTION" in
  start)
    start
  ;;
  stop)
    stop
  ;;
  restart)
    restart
  ;;
  *)
    usage
  ;;
esac