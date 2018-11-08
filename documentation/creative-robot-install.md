#### Creative

Set down the Creatix robot, run ```install```, select OpenOS, and reboot it when the install completes. Make sure to put a Geolyzer in its upgrade slot (not its tool slot!).

Now that your robot is running and OpenOS is installed, just paste this into it:

```
mkdir /home/lib;
set ROBOSERVER_CODE=https://raw.githubusercontent.com/dunstad/roboserver/master/public/lua/oc;
wget $ROBOSERVER_CODE/setup.lua /home/lib/setup.lua;
lua /home/lib/setup.lua;
```

After answering a few questions about your robot, it will connect to the server you started in the previous step. Congratulations, you're done! Next check out [these tips](tips.md) on how to use the Roboserver.