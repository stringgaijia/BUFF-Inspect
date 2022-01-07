# BUFF Inspect V1.0.2

BUFF Inspect is a chrome extension for CSGO traders that want to inspect a craft before purchasing it, or for the everyday player that just wants to look at the weapon to see if its worth buying. It allows you to generate a gen-code for any weapon and/or gloves currently on the Buff163 marketplace which allows you to go on servers such as Broskin and view the weapon in-game.

## Known Issues

## Planned Features
- Adding/Removing servers

## Features
- Generate gencodes for CSGO
- Inspecting a weapon with stickers
- Connect to servers to inspect weapons
- Instantly search for an item on FloatDB

## How does it work?
When the user generates a gen-code the extension send a request to our database (http://grioghyjtf.link/). The request includes the *name* of the weapon and if present, the *stickers* applied to the weapon. (The name of the item and stickers are encoded in base64)

![image](https://user-images.githubusercontent.com/97019006/148032998-40112dab-8371-4922-b53f-a4e864aa75a7.png)


The server responds with the items index and the stickers indexes in base64 which the extension then decodes and uses to make the gen-code. 

![image](https://user-images.githubusercontent.com/97019006/148033185-74ede557-f7cc-4bcb-9159-148a2da55352.png)


All the communication between the server and extension can be viewed in most modern webbrowsers such as Google Chrome by pressing F12 and navigating to Network. The messages sent between the server and client can then be decoded by you on a website like https://www.base64decode.org/ to make sure no confidential data is being sent. 

Nothing is stored in the database


## Installation
### Regular
```
https://chrome.google.com/webstore/detail/buff-inspect/lebfbmmlnogdmgpkeademimobdndhkgm
```

### China
```
Guide: https://gist.github.com/WillsJin/cf7a0904413c9823bd2e
https://chrome.google.com/webstore/detail/buff-inspect/lebfbmmlnogdmgpkeademimobdndhkgm
```
