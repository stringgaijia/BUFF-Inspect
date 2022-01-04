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

chrome.storage.sync.get("serverIndex", function(serverIndex)
{
	if(serverIndex.serverIndex)
	{
		select.selectedIndex = serverIndex.serverIndex;
	}
});

function updateServer()
{
	chrome.storage.sync.set({"serverIndex": select.selectedIndex});
}

select.addEventListener('change', updateServer, false);