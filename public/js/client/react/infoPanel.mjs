<div class='panel panel-default inline-block'>
  <div class='panel-body information-panel'>

    <div id='versionNumberDisplay'>
      Version: 
      <span id='versionNumber'></span>
    </div>

    <div id='usernameDisplay'>
      User: 
      <%= user.username %>
    </div>

    <div id='cursorPositionDisplay'>
      Position: 
      <span id='hoverGuideCoordinates'></span>
    </div>

    <div id='powerLevelDisplay' class='hidden'>
      Power: 
      <span id='powerLevel'></span>
    </div>

  </div>
</div>

class InfoPanel extends 