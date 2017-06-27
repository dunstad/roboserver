#### Why did you pick such weird colors for the map? Purple water? 

The geolyzer can only tell us the estimated hardness of blocks when scanning from a distance, not exactly what they are. Because of this, water and lava look exactly the same to the robot. There are a few ways to address this problem. I decided to make the colors of blocks halfway between the common things they could possibly be in most cases, which is why the water is purple (a mix of red for lava and blue for water).

Alternatively, I could have picked the most common block at each level of hardness and used that color, but then you have situations like a desert with lava pools that's colored just like a field with ponds. That being said, I'm not against this approach if the current one turns out to be too hard to get used to.

Here are all the colors in use currently, and the hardness they represent:

* Bedrock: Hardness = -1, Color = Pure Black (#000000)
* Leaves: Hardness = 0.2, Color = Green (#00CC00)
* Glowstone: Hardness = 0.3, Color = Yellow (#FFCC00)
* Netherrack: Hardness = 0.4, Color = Maroon (#800000)
* Dirt or Sand: Hardness = 0.5, Color = Tan (#ffc140)
* Grass Block: Hardness = 0.6, Color = Yellow Green (#ddc100)
* Sandstone: Hardness = 0.8, Color = Cream (#ffff99)
* Pumpkins or Melons: Hardness = 1.0, Color = Orange (#fdca00)
* Smooth Stone: Hardness = 1.5, Color = Light Gray (#cfcfcf)
* Cobblestone: Hardness = 2.0, Color = Dark Gray (#959595)
* Ores: Hardness = 3.0, Color = Light Blue (#66ffff)
* Cobwebs: Hardness = 4.0, Color = Off White (#f5f5f5)
* Ore Blocks: Hardness = 5.0, Color = Red (#c60000)
* Obsidian: Hardness = 50, Color = Black (#1f1f1f)
* Water or Lava: Hardness = 100, Color = Purple (#9900cc)