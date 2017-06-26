### Server

Following these instructions will let you access the Roboserver directly from your web browser. If you want, you can even make it available over a network so your friends can too.

1. Install Node.js and npm.
2. Clone this repository.
3. Run ```npm install``` in the project directory.
4. Rename ```public/js/config.example.js``` to ```public/js/config.js``` and optionally change the settings inside.
5. Run ```npm run server``` in the project directory.

If you're running the Roboserver on the same network as any robots trying to connect to it, you may need to change the blacklist settings in your OpenComputers configuration file.

Congratulations, you're halfway done! Next check out the [Robot](#robot) section.

### Robot

If you just want to try the program out without any fuss, head to the [Creative](#creative) section. If you want to use this in an existing survival world, you'll want to follow the steps [here](#survival).