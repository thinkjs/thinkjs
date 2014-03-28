#!/bin/sh
#STC_PATH="/home/q/php/STC"
STC_PATH="/Users/welefen/Develop/git/stc/src"
path=`dirname $0`;
first=${path:0:1};
if [[ $first != '/' ]];then
    path=$(pwd);
fi

if [ -d ${path}"/output" ];then
	rm -rf ${path}"/output";
fi
mkdir ${path}"/output";
if [ ! -f ${path}"/config.php" ];then
	cp $STC_PATH/config/config.php ${path};
fi
#path=$(pwd);
/usr/local/bin/php $STC_PATH/index.php ${path} test $1;
if [ -f ${path}"/stc.error.log" ]; then
    rm -rf ${path}"/stc.error.log";
    exit 1;
fi
#cp -r www/index.js output/www/;
mkdir output/App/Common;
mkdir output/App/Conf;
mkdir output/App/Lib;
cp -r App/Common/* output/App/Common/;
cp -r App/Conf/* output/App/Conf/;
#mv output/App/Conf/config.js output/App/Conf/config.js.bak
cp -r App/Lib/* output/App/Lib/;
cp ctrl.sh output/
#cp www/index.js output/www;
cd output;
tar zcvf ../output.tar.gz *;
cd ..
scp -r output.tar.gz welefen@www.ueapp.com:~;
ssh welefen@www.ueapp.com "tar zxvf ~/output.tar.gz -C /home/welefen/www/www.thinkjs.org/;rm -rf ~/output.tar.gz";
