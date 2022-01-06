var servers = {
	"Broskin": "51.75.73.121:27015",
	"ohnePixel Nuke": "23.88.121.140:27015",
	"ohnePixel Siege": "23.88.37.66:27015"
}

var select = document.getElementById("server-select");

for (const [name, ip] of Object.entries(servers))
{
	var option = document.createElement("option");
	option.text = name;
	option.value = ip;
	select.add(option, null);
}

function setServer(serverIp)
{
	var ipText = document.getElementById("ip-text");
	ipText.innerHTML = serverIp;
}

function connect()
{
	var sid = 0;
	chrome.storage.sync.get("serverIndex", function(serverIndex)
	{
		if(serverIndex.serverIndex)
		{
			sid = serverIndex.serverIndex;
		}
		var values = Object.keys(servers).map(function(key){return servers[key];});
		chrome.tabs.query({}, (tabs) => tabs.forEach( tab => chrome.tabs.sendMessage(tab.id, "connectToServerBuffInspect_steam://connect/" + values[sid])));
	});

}

chrome.storage.sync.get("serverIndex", function(serverIndex)
{
	var sid = 0;
	if(serverIndex.serverIndex)
	{
		sid = serverIndex.serverIndex;
	}
	select.selectedIndex = sid;
	var values = Object.keys(servers).map(function(key){return servers[key];});
	setServer(values[sid]);
});

function updateServer()
{
	chrome.storage.sync.set({"serverIndex": select.selectedIndex});
	var values = Object.keys(servers).map(function(key){return servers[key];});
	setServer(values[select.selectedIndex]);
}

select.addEventListener('change', updateServer, false);
document.getElementById("connect-button").addEventListener("click", connect);
