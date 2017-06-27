### Server

Following these instructions will let you access the Roboserver directly from your web browser. If you want, you can even make it available over a network so your friends can too.

1. Install Node.js and Node Package Manager (npm).
2. Clone this repository.
3. Run ```npm install``` in the project directory.
4. Rename ```public/js/config.example.js``` to ```public/js/config.js``` and optionally change the settings inside.
5. Run ```npm run server``` in the project directory.

If you're running the Roboserver on the same network as any robots trying to connect to it, you may need to change the blacklist settings in your OpenComputers configuration file. For example, if you're running it on the same computer as the Minecraft world your robots are in, you'll need to remove "127.0.0.0/8" from the blacklist, otherwise your robot will be unable to connect.

Congratulations, you're halfway done! Now let's get a robot set up.

If you just want to try the program out without any fuss, I recommend using a Creative robot. Read how [here](creative-robot-install.md). If you want to use this in a survival world, you'll want to follow the steps [here](survival-robot-install.md).