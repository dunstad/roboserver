## Roboserver

This is a web server which OpenComputers robots can read and execute commands from.  
To run: `npm start` or `npm run dev` from the root directory.

**/views/index.ejs**  
This is where commands are entered from.

**/js/interface.js**  
This is where commands which have been entered are POSTed to /commands.

**/routes/index.js**  
This defines which urls the webapp uses, and their behavior.

* **GET /**  
Shows you the command entry text field.

* **GET /commands**  
Shows you all commands which have been entered since this URL last received a GET request. Then, empties the list of commands.

* **POST /commands**  
Adds a command to the current list of commands.
