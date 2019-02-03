# WizardClock
A wizarding clock Lovelace component for Home Assistant


## About

I was suprised when I couldn't find something like this that somebody else had already made, so decided to give it a go myself! It took a few months due to not having much spare time, and javascript not being my first language, but I eventually got it working quite nicely for my purposes. 

I decided to release it so that other (more skillful) people could make use of it and undoubtably tweak it to improve it - if you do use it and make any improvements please let me know so that I can incorporate them into my code!


## Features

* Shows the current Zone that an entity is located in (only tested using the owntracks platform)
* If an entity isn't in a Zone then it marks that entity as "Lost"
* If an entity has a velocity of greater than 15 then it marks that entity as "Travelling" (again, only tested using owntracks - and GPS must be turned on on your phone for velocity to be reported)
* Locations are added dynamically as needed, however you can configure permanently shown locations by adding them to the "locations" list in the config
* For family members without a phone (or those that don't want to be tracked with owntracks!) it can use the google calendar platform - simply create a calendar with the expected locations of that person as the name of appointments at the appropriate times
* Font face can be customised (I use "Blackadder" for a suitably wizardy look)


## Installation

1. Copy weasley-card.js to www/custom-lovelace/ in your home assistant folder, along with any particular font you want to use.
2. Open the lovelace raw config editor and add the code below

  ```
  resources:
    - type: js
      url: /local/custom-lovelace/weasley-card.js?v=1
  ```
    
3. Hit save and close the raw config editor, then hit the plus button to add a new card
4. Click "Skip" in the card selection screen
5. Add your config, see the following example

```
type: 'custom:weasley-card'
locations:
  - Home
  - Work
  - School
wizards:
  - entity: device_tracker.harrys_phone
    name: Harry
  - entity: device_tracker.hermiones_phone
    name: Hermione
  - entity: calendar.ron
    name: Ron
  - entity: calendar.ginny
    name: Ginny
fontface: >-
  font-family: itcblkad_font;    src: local(itcblkad_font),
  url('/local/custom-lovelace/ITCBLKAD.TTF') format('opentype');
```
