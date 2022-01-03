let cached_stickers = {};
let cached_weapon_index = {};
let sticker_order = {4: [3,0,1,2], 16: [3,0,1,2], 39: [0,1,3,2], 60: [0,2,1,3]};
let weird_orders = [4, 16, 39, 60];
var all_btns = [];
var disable_move_btn = {};


function get_class_from_id(id)
{
	return all_btns[id];
}

function make_request(url) {
    return new Promise(function (resolve, reject) {
        let xhr = new XMLHttpRequest();
        xhr.open("GET", url);
        xhr.onload = function () {
            if (this.status >= 200 && this.status < 300) {
                resolve(xhr.response);
            } else {
                reject({
                    status: this.status,
                    statusText: xhr.statusText
                });
            }
        };
        xhr.onerror = function () {
            reject({
                status: this.status,
                statusText: xhr.statusText
            });
        };
        xhr.send();
    });
}

function get_http(url)
{
	var xmlHttp = new XMLHttpRequest();
	xmlHttp.open("GET", url, false);
    xmlHttp.send(null);
    return xmlHttp.responseText;
}

async function http_get(classid, instanceid, sell_order_id, assetid)
{
    var url = "https://buff.163.com/market/item_detail?appid=730&game=csgo&origin=selling-list&contextid=2&&classid=" + classid + "&instanceid=" + instanceid + "&sell_order_id=" + sell_order_id + "&assetid=" + assetid;
    return await make_request(url);
}

async function get_gen_code(data, has_stickers, sticker_slots, already_named, sticker_wear_value_gen)
{
	if(data.split(" ")[0] != "!gen")
	{
		var gen = "!gen ";
		var name = data.split('<div class="blank20"></div> <h3>')[1].split('</h3>')[0];
		
		if(name.includes('|'))
		{
			var item_name = name.split(" | ")[0].replace("★ ", "").replace("StatTrak™ ", "").replace("Souvenir ", "");
			if(cached_weapon_index.hasOwnProperty(item_name))
			{
				var skin_index = cached_weapon_index[item_name];
			}
			else
			{
				var skin_index = await make_request("https://grioghyjtf.link/request.php?item_name=" + btoa(name.split(" | ")[0].replace("★ ", "").replace("StatTrak™ ", "").replace("Souvenir ", "")));
				cached_weapon_index[item_name] = skin_index;
			}
		}
		else
		{
			var item_name = name.replace("★ ", "");
			if(cached_weapon_index.hasOwnProperty(item_name))
			{
				var skin_index = cached_weapon_index[item_name];
			}
			else
			{
				var skin_index = await make_request("https://grioghyjtf.link/request.php?item_name=" + btoa(name.replace("★ ", "")));
				cached_weapon_index[item_name] = skin_index;
			}
		}
		if(skin_index > 4000)
		{
			var gen = "!gengl " + skin_index;
		}
		else
		{
			var gen = "!gen " + skin_index;
		}
		gen += " " + data.split("Paint index: ")[1].split(" ")[0];
		gen += " " + data.split("Paint seed: ")[1].split(" ")[0];
		gen += " " + data.split("Float: ")[1].split('</p> <div class="wear-pointer">')[0];
	}
	else
	{
		var gen = data;
		var skin_index = parseInt(data.split(" ")[1]);
	}

	if(has_stickers)
	{
		for(var i = 3; i >= 0; i--)
		{
			var index = i;
			if(weird_orders.includes(skin_index))
			{
				index = sticker_order[skin_index][i];
			}
			if(sticker_slots[index] == null || sticker_slots[index] == "undefined")
			{
				gen += " 0 0";
				continue;
			}

			if(!already_named)
			{
				var sticker = document.getElementById(sticker_slots[index]);
				var sticker_id = cached_stickers[sticker.getElementsByTagName("p")[0].innerHTML];
				if(sticker_id == null)
				{
					sticker_id = 0;
				}
				gen += " " + sticker_id + " " + (100 - parseInt(sticker.getElementsByTagName("h4")[0].innerHTML.split("%")[0])) / 100;
			}
			else
			{
				var sticker_id = cached_stickers[sticker_slots[index]];
				if(sticker_id == null)
				{
					sticker_id = 0;
				}
				gen += " " + sticker_id + " 0" + (100 - parseInt(sticker_wear_value_gen[index]) / 100);
			}
		}
	}

	return gen;
}

function disable_all_move_stickers(state)
{
	var move_stickers = document.getElementsByClassName("move_sticker_button");
	var sticker_wrapper = document.getElementsByClassName("sticker_wrapped");
	for(var i = 0; i < move_stickers.length; i++)
	{
		if(!state)
		{
			move_stickers[i].classList.add("disabledBtn");
			move_stickers[i].style.pointerEvents = "none";
			sticker_wrapper[i].style.display = "none";
		}
		else if(move_stickers[i].classList.contains("disabledBtn"))
		{
			for(var key in disable_move_btn)
			{
				if(disable_move_btn[key] == 1)
				{
					return;
				}
			}
			move_stickers[i].classList.remove("disabledBtn");
			move_stickers[i].style.pointerEvents = "auto";
		}
	}
}


class GenCode
{
	constructor(id, sells)
	{
		this.id = id;
		this.add_input_btn(sells);
		this.sticker_slots = {
			0: null, 1: null, 2: null, 3:null,
			4: null, 5: null, 6: null, 7:null
		};
		this.sticker_slot_position = {
			0: [-135, 6], 1: [-45, 6], 2: [45, 6], 3: [135, 6],
			4: [-135, 100], 5:[-45, 100], 6: [45, 100], 7: [135, 100]
		};
		this.sticker_div_center_pos = [140, 10];
	}

	add_input_btn(sells)
	{
		var order = sells[this.id].getElementsByClassName("pic-cont item-detail-img");
		var input = document.createElement("input");
		input.type = "submit";
		input.value = "!gen";
		input.classList.add("pointer");
		input.setAttribute("data-index", this.id-1);
		input.id = "input-gen-" + this.id;
		input.classList.add("gen_button");
		this.input_main = input;
		input.onclick = async function(){
			disable_move_btn[this.getAttribute("data-index")] = 1;
			disable_all_move_stickers(false);
			var parent = this.parentElement;
			var loader = document.createElement("div");
			loader.classList.add("loader");
			this.remove();
			parent.appendChild(loader);
			var gen_code_class = get_class_from_id(this.getAttribute("data-index"));
			await gen_code_class.load_gen(gen_code_class.input_main, gen_code_class);
			var loaders = parent.getElementsByClassName("loader");
			while(loaders.length != 0)
			{
				loaders[0].remove();
			}
			await gen_code_class.loadDrags(this.id, gen_code_class);
			disable_move_btn[this.getAttribute("data-index")] = 0;
			disable_all_move_stickers(true);
		};

		sells[this.id].getElementsByClassName("t_Left")[0].getElementsByClassName("csgo_value")[0].appendChild(input);
		sells[this.id].getElementsByClassName("t_Left")[0].style.height = "auto";
		sells[this.id].getElementsByClassName("t_Left")[0].style.textAlign = "center";
	}

	async load_gen(input, gen_code_class)
	{
		var sells = document.getElementsByClassName("selling");
		var i = input.id.split("-")[2];
		var order = sells[i].getElementsByClassName("pic-cont item-detail-img")[0];
		var data = await http_get(order.getAttribute("data-classid"), order.getAttribute("data-instanceid"), order.getAttribute("data-orderid"), order.getAttribute("data-assetid"));
		var gen_data = await gen_code_class.get_data(data, sells[i].getElementsByClassName("t_Left")[0].getElementsByClassName("csgo_value")[0], gen_code_class);
		var has_stickers = gen_data[1];
		input.setAttribute("all-data", data);
		gen_data = gen_data[0];

		input.type = "text";
		input.value = gen_data;
		input.classList.add("gen_input");
		input.classList.remove("gen_button");
		input.readOnly = true;
		input.id = "input-gen-" + i;
		input.setAttribute("onclick","this.select();");
		sells[i].getElementsByClassName("t_Left")[0].getElementsByClassName("csgo_value")[0].appendChild(document.createElement("br"))
		sells[i].getElementsByClassName("t_Left")[0].getElementsByClassName("csgo_value")[0].appendChild(input);
		sells[i].getElementsByClassName("t_Left")[0].style.height = "auto";

		var input = document.createElement("input");
		input.type = "submit";
		input.value = "Connect";
		input.id = "input-gen-" + i;
		input.classList.add("connect_button");
		input.classList.add("pointer");
		input.onclick = function(){window.location.href='steam://connect/51.75.73.121:27015'};
		sells[i].getElementsByClassName("t_Left")[0].getElementsByClassName("csgo_value")[0].appendChild(input);

		sells[i].getElementsByClassName("t_Left")[0].getElementsByClassName("csgo_value")[0].appendChild(document.createElement("br"));

		if(has_stickers)
		{
			input.parentElement.getElementsByClassName("sticker_wrapped")[0].id = i;

			var sticker_placement = sells[i].getElementsByClassName("t_Left")[0].getElementsByClassName("csgo_value")[0].getElementsByClassName("sticker_wrapped")[0];
			var a = document.createElement("a");
			a.classList.add("pointer");
			a.classList.add("move_sticker_button");
			a.text = "Move Stickers";
			a.setAttribute("title", "Stickers may appear out of order.\nPress \"Move Stickers\" and place them in the order you want them to appear ingame.");
			document.addEventListener("click", (evt) => {
				try
				{
					let target_element = evt.target;
					if(target_element == a)
					{
						return;
					}
					if(target_element != sticker_placement && target_element.parentElement != sticker_placement && target_element.parentElement.parentElement != sticker_placement)
					{
						sticker_placement.style.display = "none";
					}
				}
				catch(crash_reason){}
			});
			a.onclick = function(){
				if(sticker_placement.style.display == "none")
				{
					sticker_placement.style.display = "inline-block";
				}
				else
				{
					sticker_placement.style.display = "none";
				}
			};

			var move_sticker_wrapper = document.createElement("div");
			move_sticker_wrapper.classList.add("move_sticker_button_wrapper");
			sells[i].getElementsByClassName("t_Left")[0].getElementsByClassName("csgo_sticker")[0].style.width = "164px";
			sells[i].getElementsByClassName("t_Left")[0].getElementsByClassName("csgo_sticker")[0].appendChild(move_sticker_wrapper);
			move_sticker_wrapper.appendChild(a);
		}

		disable_all_move_stickers(false);
		disable_all_move_stickers(true);
	}

	async get_data(data, csgo_value, gen_code_class)
	{
		var has_stickers = false;
		var sticker_data = data.split('sticker-wrapper');
		var sticker_placement = '<div class="sticker_wrapped" style="display:none;"><div id="selected_background"></div>';
		var sticker_ids = "";
		var sticker_names = [];
		for(var i = sticker_data.length - 1; i > 0; i--)
		{
			has_stickers = true;
			var sticker_url = sticker_data[i].split('<img src="')[1].split('" ')[0];
			sticker_names.push(sticker_data[i].split('<div class=\"sticker-name\"> <div> <div> ')[1].split(' <br> <span>')[0].replace("&#39;", "'") + ";");
			sticker_ids += sticker_data[i].split('<div class=\"sticker-name\"> <div> <div> ')[1].split(' <br> <span>')[0].replace("&#39;", "'") + ";";
			var sticker_wear = sticker_data[i].split("<span>Sticker wear: ")[1].split("%")[0];

			var sticker_name_full = sticker_data[i].split('<div class=\"sticker-name\"> <div> <div> ')[1].split(' <br> <span>')[0].replace("&#39;", "'");
			sticker_placement += '<div id="sticker' + gen_code_class.id * 4 + i + '" class="sticker"><img title="' + sticker_name_full + ' (' + sticker_wear.split(".")[0] + '%)" src="' + sticker_url + '"><h4>' + sticker_wear.split(".")[0] + '%</h4><p>' + sticker_name_full + '</p></div>';
		}

		sticker_ids = btoa(sticker_ids.slice(0, -1));
		if(sticker_ids != "")
		{
			var sticker_id = atob(await make_request("https://grioghyjtf.link/request.php?sticker_name=" + sticker_ids)).split(";");
			for(var i = 0; i < sticker_names.length; i++)
			{
				cached_stickers[sticker_names[i].replace(";", "")] = sticker_id[i];
			}
		}
		

		var sticker_slots_gen = {};
		var sticker_wear_value_gen = {};
		sticker_placement += '</div>';
		if(has_stickers)
		{
			csgo_value.innerHTML += sticker_placement;
			var sticker_data = data.split('sticker-wrapper');

			var c = 0;
			for(var i = 1; i < sticker_data.length; i++)
			{
				var sticker = sticker_data[i].split('<div class=\"sticker-name\"> <div> <div> ')[1].split(' <br> <span>')[0];
				var sticker_wear = sticker_data[i].split("<span>Sticker wear: ")[1].split("%")[0];
				sticker_slots_gen[c] = sticker;
				sticker_wear_value_gen[c] = sticker_wear;
				c += 1;
			}
		}
		
		return [await get_gen_code(data, has_stickers, sticker_slots_gen, true, sticker_wear_value_gen), has_stickers];
	}


	async loadDrags(id, gen_code_class)
	{
		var stickers = document.getElementById(id).parentElement.getElementsByClassName("sticker_wrapped")[0];
		if(stickers != null)
		{
			stickers = stickers.getElementsByTagName("div");
			for(var i = 0; i < stickers.length; i++)
			{
				if(stickers[i].id != "selected_background")
				{
					await gen_code_class.dragElement(stickers[i], gen_code_class);
				}
			}
		}
	}

	async dragElement(elmnt, gen_code_class) 
	{
	  	var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;

	  	if (document.getElementById(elmnt.id)) 
	  	{
	  		document.getElementById(elmnt.id).onmousedown = dragMouseDown;
	  		await gen_code_class.closeDragElement(elmnt, true, gen_code_class);
	  	} 
	  	else
	  	{
	    	elmnt.onmousedown = dragMouseDown;
	  	}

	  	function dragMouseDown(e)
	  	{
	    	e = e || window.event;
	    	e.preventDefault();
	    	pos3 = e.clientX;
	    	pos4 = e.clientY;
	    	elmnt.style.zIndex = "12";
	    	document.onmouseup = async function(){await gen_code_class.closeDragElement(elmnt, false, gen_code_class)};
	    	document.onmousemove = elementDrag;
	  	}

	  	function elementDrag(e)
	  	{
	    	e = e || window.event;
	    	e.preventDefault();
		    pos1 = pos3 - e.clientX;
		    pos2 = pos4 - e.clientY;
		    pos3 = e.clientX;
		    pos4 = e.clientY;
		    elmnt.style.top = (elmnt.offsetTop - pos2) + "px";
		    elmnt.style.left = (elmnt.offsetLeft - pos1) + "px";
		    elmnt.style.zIndex = "12";
	  	}
	}

  	async closeDragElement(elmnt, initial, gen_code_class)
  	{
  		function calc_distance(x_pos, y_pos, image_pos_x, image_pos_y)
	  	{
	  		x_pos = parseInt(x_pos.replace("px", ""));
	  		y_pos = parseInt(y_pos.replace("px", ""));
	  		return (x_pos - image_pos_x)*(x_pos - image_pos_x) + (y_pos - image_pos_y)*(y_pos - image_pos_y);
	  	}

	  	function get_sticker_pos(sticker, gen_code_class)
	  	{
	  		for(var i = 0; i < 8; i++)
	  		{
	  			if(gen_code_class.sticker_slots[i] == sticker)
	  			{
	  				return i;
	  			}
	  		}
	  		return -1;
	  	}

	  	if(elmnt.style.left == "")
	  	{
	  		elmnt.style.left = 1 + "px";
	  	}
	  	if(elmnt.style.top == "")
	  	{
	  		elmnt.style.top = 1 + "px";
	  	}

    	var minimal_dist = 999999999999999999;
    	var num = 0;
    	var weapon_idx = cached_weapon_index[Object.keys(cached_weapon_index)[0]];
	    var max_dist = initial ? 4 : 8;
	    for(var x = 0; x < max_dist; x++)
	    {
	    	if(initial)
	    	{
	    		if(gen_code_class.sticker_slots[x] == null && !weird_orders.includes(parseInt(weapon_idx)))
		    	{
		    		var distance = calc_distance(elmnt.style.left, elmnt.style.top, gen_code_class.sticker_slot_position[x][0] + gen_code_class.sticker_div_center_pos[0], gen_code_class.sticker_div_center_pos[1] + gen_code_class.sticker_slot_position[x][1]);
		    		if(distance < minimal_dist)
		    		{
		    			num = x;
		    			minimal_dist = distance;
		    		}
		    	}
	    		else if(weird_orders.includes(parseInt(weapon_idx)))
		    	{
		    		if(gen_code_class.sticker_slots[sticker_order[parseInt(weapon_idx)][x]] == null)
		    		{
		    			var distance = calc_distance(elmnt.style.left, elmnt.style.top, gen_code_class.sticker_slot_position[x][0] + gen_code_class.sticker_div_center_pos[0], gen_code_class.sticker_div_center_pos[1] + gen_code_class.sticker_slot_position[x][1]);
			    		if(distance < minimal_dist)
			    		{
			    			num = x;
			    			if(weird_orders.includes(parseInt(weapon_idx)))
			    			{
			    				num = sticker_order[parseInt(weapon_idx)][x];
			    			}
			    			minimal_dist = distance;
			    		}
		    		}
		    	}
	    	}
	    	else
	    	{
	    		var distance = calc_distance(elmnt.style.left, elmnt.style.top, gen_code_class.sticker_slot_position[x][0] + gen_code_class.sticker_div_center_pos[0], gen_code_class.sticker_div_center_pos[1] + gen_code_class.sticker_slot_position[x][1]);
		    	if(distance < minimal_dist)
		    	{
		    		num = x;
		    		minimal_dist = distance;
		    	}
	    	}
    	}

    	var old_pos = get_sticker_pos(elmnt.id, gen_code_class);
    	var tmp_elmnt = gen_code_class.sticker_slots[num];
	    gen_code_class.sticker_slots[num] = elmnt.id;
	    gen_code_class.sticker_slots[old_pos] = tmp_elmnt;

	    if(tmp_elmnt != null && gen_code_class.sticker_slot_position[old_pos] != null)
	    {
	    	var old_pos_elmnt = document.getElementById(gen_code_class.sticker_slots[old_pos]);
	    	old_pos_elmnt.style.left = gen_code_class.sticker_slot_position[old_pos][0] + gen_code_class.sticker_div_center_pos[0] + 1 + "px";
			old_pos_elmnt.style.top = gen_code_class.sticker_slot_position[old_pos][1] + "px";
			old_pos_elmnt.style.zIndex = "10";
	    }
    	elmnt.style.left = gen_code_class.sticker_slot_position[num][0] + gen_code_class.sticker_div_center_pos[0] + 1 + "px";
    	elmnt.style.top = gen_code_class.sticker_slot_position[num][1] + "px";
    	elmnt.style.zIndex = "10";

	    
	    document.onmouseup = null;
	    document.onmousemove = null;

	    var data = document.getElementsByClassName("csgo_value")[parseInt(elmnt.parentElement.id) - 1].getElementsByTagName("input")[0].value;
	    document.getElementsByClassName("csgo_value")[parseInt(elmnt.parentElement.id) - 1].getElementsByTagName("input")[0].value = await get_gen_code(data.split(" ").slice(0, 5).join(" "), true, gen_code_class.sticker_slots, false, null);
  	}
}

function loadButtons()
{
	if(document.getElementsByClassName("gen_button").length == 0)
	{
		var sells = document.getElementsByClassName("selling");
		for(var i = 1; i < sells.length; i++)
		{
			if(document.getElementsByClassName("wear-value").length > 0)
			{
				var gen = new GenCode(i, sells);
				all_btns.push(gen);
			}
		}

		if(sells.length == 1)
		{
			setTimeout(loadButtons, 100);
		}
	}
}


function load_extension()
{
	loadButtons();
	chrome.runtime.onMessage.addListener(
	  	function(request, sender, sendResponse) {
	    	if (request.message === 'urlChange') 
	    	{
	      		loadButtons();
	    	}
		}
	);
}

load_extension();