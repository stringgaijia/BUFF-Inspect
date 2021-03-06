var servers = {
	"Broskin": "51.75.73.121:27015",
	"ohnePixel Nuke": "168.119.91.32:27017",
	"ohnePixel Lake": "168.119.91.32:27016",
	"ohnePixel Siege": "168.119.91.32:27015"
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
	document.getElementById("connect-button").href = "steam://connect/" + serverIp;
}

chrome.storage.local.get("serverIndex", function(serverIndex)
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
	chrome.storage.local.set({"serverIndex": select.selectedIndex});
	var values = Object.keys(servers).map(function(key){return servers[key];});
	setServer(values[select.selectedIndex]);
}

select.addEventListener('change', updateServer, false);
