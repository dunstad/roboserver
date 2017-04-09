cd /home/lib
wget -f https://raw.githubusercontent.com/dunstad/roboserver/master/lua/downloadCode.lua
lua "require('downloadCode').downloadAll();"
mv /home/lib/autorun.sh /