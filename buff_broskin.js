let cached_stickers = {};
let cached_weapon_index = {};
let sticker_order = {4: [3,0,1,2], 16: [3,0,1,2], 39: [0,1,3,2], 60: [0,2,1,3]};
let weird_orders = [4, 16, 39, 60];
var all_btns = [];
var disable_move_btn = {};
let local_storage_stickers = {};


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

	if(has_stickers || true)
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
				gen += " " + sticker_id + " " + (100 - parseInt(sticker.getElementsByTagName("input")[0].value)) / 100;
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
		this.skip_replace = false;
		this.id = id;
		this.add_input_btn(sells);
		this.orig_stickers = {
			0: null, 1: null, 2: null, 3:null,
			4: null, 5: null, 6: null, 7:null
		};
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
			gen_code_class.skip_replace = false;
			await gen_code_class.loadDrags(this.id, gen_code_class);
			disable_move_btn[this.getAttribute("data-index")] = 0;
			disable_all_move_stickers(true);
		};

		sells[this.id].getElementsByClassName("t_Left")[0].getElementsByClassName("csgo_value")[0].appendChild(input);
		sells[this.id].getElementsByClassName("t_Left")[0].style.height = "auto";
		sells[this.id].getElementsByClassName("t_Left")[0].style.textAlign = "center";
	}

	generate_sticker(elmnt, imageSrc, name, sticker_index, gen_code_class, wear_value)
	{
		var sticker_div = document.createElement("div");
		sticker_div.id = "sticker" + sticker_index;
		sticker_div.classList.add("sticker");
		var img = document.createElement("img");
		img.title = name + " (100%)";
		img.src = imageSrc;
		var header = document.createElement("input");
		header.type = "number";
		header.max = "100";
		header.min = "0";
		header.classList.add("wear-value-sticker");
		var pct = document.createElement("span");
		pct.appendChild(header);
		pct.innerHTML += "%";
		var p = document.createElement("p");
		p.innerHTML = name;
		var exit = document.createElement("a");
		exit.innerHTML = "✖";
		exit.style.top = "-2px";
		exit.style.right = "0";
		exit.style.position = "absolute";
		exit.style.cursor = "pointer";
		exit.style.zIndex = "11";
		exit.style.padding = "0";

		exit.onclick = function() {
			var values = Object.keys(gen_code_class.sticker_slots).map(function(key){return gen_code_class.sticker_slots[key];});
			gen_code_class.sticker_slots[values.indexOf(this.parentElement.id)] = null;
			var csgo_value_id = this.parentElement.parentElement.id;
			this.parentElement.remove();

			var data = document.getElementsByClassName("csgo_value")[parseInt(csgo_value_id) - 1].getElementsByTagName("input");
			data = data[data.length - 2];
	    	var promise = get_gen_code(data.value.split(" ").slice(0, 5).join(" "), true, gen_code_class.sticker_slots, false, null);
	    	promise.then(function(gen_code) 
			{
				data.value = gen_code;
			});
		}

		sticker_div.appendChild(img);
		sticker_div.appendChild(exit);
		sticker_div.appendChild(pct);
		sticker_div.appendChild(p);

		sticker_div.getElementsByTagName("span")[0].getElementsByTagName("input")[0].value = wear_value.toString();
		sticker_div.getElementsByTagName("span")[0].getElementsByTagName("input")[0].onkeypress = function() {
			return (event.charCode == 8 || event.charCode == 0 || event.charCode == 13) ? null : event.charCode >= 48 && event.charCode <= 57
		};
		sticker_div.getElementsByTagName("span")[0].getElementsByTagName("input")[0].onkeyup = function() {
			var csgo_value_id = this.parentElement.parentElement.parentElement.id;
			var data = document.getElementsByClassName("csgo_value")[parseInt(csgo_value_id) - 1].getElementsByTagName("input");
	    	var promise = get_gen_code(data[data.length - 2].value.split(" ").slice(0, 5).join(" "), true, gen_code_class.sticker_slots, false, null);
	    	promise.then(function(gen_code)
			{
				data[data.length - 2].value = gen_code;
			});
		}

		return sticker_div;
	}

	add_sticker(gen_code_class, name, id, elmnt, stickerImages)
	{
		var values = Object.keys(gen_code_class.sticker_slots).map(function(key){return gen_code_class.sticker_slots[key];});

		var apply = false;
		var sticker_index_ = 0;
		for(var c = 1; c < 9; c++)
		{
			var index = gen_code_class.id * 8 + c;
			if(values.indexOf("sticker" + index) == -1)
			{
				sticker_index_ = index;
				apply = true;
				break;
			}
		}
		if(!apply)
		{
			return;
		}

		var sticker_div = gen_code_class.generate_sticker(elmnt, stickerImages[id], name, sticker_index_, gen_code_class, "100");

		apply = false;
		var i = 0
		for(; i < 8; i++)
		{
			if(gen_code_class.sticker_slots[i] == null)
			{
				apply = true;
				gen_code_class.sticker_slots[i] = "sticker" + sticker_index_;
				break;
			}
		}

		var sticker_wrapper = elmnt.getElementsByClassName("t_Left")[0].getElementsByClassName("csgo_value")[0].getElementsByClassName("sticker_wrapped")[0];
		sticker_wrapper.appendChild(sticker_div);

		elmnt = document.getElementById("sticker" + sticker_index_);
		elmnt.style.left = gen_code_class.sticker_slot_position[i][0] + gen_code_class.sticker_div_center_pos[0] + 1 + "px";
    	elmnt.style.top = gen_code_class.sticker_slot_position[i][1] + "px";
    	elmnt.style.zIndex = "10";

    	gen_code_class.skip_replace = true;
    	gen_code_class.loadDrags(gen_code_class.id, gen_code_class);

		cached_stickers[name] = id;
	}

	async load_gen(input, gen_code_class)
	{
		var sells = document.getElementsByClassName("selling");
		var i = input.id.split("-")[2];
		var order = sells[i].getElementsByClassName("pic-cont item-detail-img")[0];
		var data = await http_get(order.getAttribute("data-classid"), order.getAttribute("data-instanceid"), order.getAttribute("data-orderid"), order.getAttribute("data-assetid"));
		var gen_data = await gen_code_class.get_data(data, sells[i].getElementsByClassName("t_Left")[0].getElementsByClassName("csgo_value")[0], gen_code_class);
		var change_stickers = sells[i].getElementsByClassName("t_Left")[0].getElementsByClassName("csgo_value")[0].getElementsByClassName("sticker_wrapped")[0].getElementsByTagName("div")[0];

		change_stickers.innerHTML += '<button style="width:100%">Reset Stickers</button><input type="text" autocomplete="off" placeholder="Search..." id="dropdown-stickers-input"><div id="dropdown-stickers" class="dropdown-content"></div>';

		change_stickers.getElementsByTagName("input")[0].onkeyup = function() 
		{
			var input_, filter, ul, li, a, i, div;
			input_ = change_stickers.getElementsByTagName("input")[0];
			filter = input_.value.toUpperCase();
			div = change_stickers.getElementsByTagName("div")[0];
			a = div.getElementsByTagName("a");
			for (i = 0; i < a.length; i++) {
			    var txtValue = a[i].textContent || a[i].innerText;
			    if (txtValue.toUpperCase().indexOf(filter) > -1) {
			      	a[i].style.display = "";
			    } else {
			      	a[i].style.display = "none";
			    }
			}
		}

		var dropdown_sticker_container = change_stickers.getElementsByTagName("div")[0];
		var dropdown_sticker_reset = change_stickers.getElementsByTagName("button")[0];
		dropdown_sticker_reset.onclick = function() {
			gen_code_class.sticker_slots = {
				0: null, 1: null, 2: null, 3:null,
				4: null, 5: null, 6: null, 7:null
			};

			var sticker_drag = sells[i].getElementsByClassName("sticker");
			for(var y = sticker_drag.length-1; y >= 0; y--)
			{
				sticker_drag[y].remove();
			}

			chrome.storage.local.get("stickerData", function(stickerData)
			{
				let sticker_names_indexes = stickerData["stickerData"];
				chrome.storage.local.get("stickerImages", function(stickerImages)
				{
					var keys = Object.keys(gen_code_class.orig_stickers);
					for(var y = 0; y < keys.length; y++)
					{
						if(gen_code_class.orig_stickers[y] != null)
						{
							gen_code_class.add_sticker(gen_code_class, gen_code_class.orig_stickers[y], sticker_names_indexes[gen_code_class.orig_stickers[y]], sells[i], stickerImages['stickerImages']);
						}
					}
				});
			});
			var csgo_value_id = this.parentElement.parentElement.id;
			var data = document.getElementsByClassName("csgo_value")[parseInt(csgo_value_id) - 1].getElementsByTagName("input");
			data = data[data.length - 2];
	    	var promise = get_gen_code(data.value.split(" ").slice(0, 5).join(" "), true, gen_code_class.sticker_slots, false, null);
	    	promise.then(function(gen_code) 
			{
				data.value = gen_code;
			});
		}

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

		var floatDB = document.createElement("input");
		floatDB.type = "submit";
		floatDB.value = "FloatDB Search"
		floatDB.classList.add("connect_button");
		floatDB.classList.add("pointer");
		floatDB.classList.add("float_search_button");
		var gen_data_array = gen_data.split(" ");
		floatDB.onclick = function() {window.open("https://csgofloat.com/db?&defIndex=" + gen_data_array[1] + "&paintIndex=" + gen_data_array[2] + "&paintSeed=" + gen_data_array[3] + "&min=" + gen_data_array[4] + "&max=" + gen_data_array[4], "_blank")};
		sells[i].getElementsByClassName("t_Left")[0].getElementsByClassName("csgo_value")[0].appendChild(floatDB);


		sells[i].getElementsByClassName("t_Left")[0].getElementsByClassName("csgo_value")[0].appendChild(document.createElement("br"));

		if(gen_data_array[1] < 500)
		{
			input.parentElement.getElementsByClassName("sticker_wrapped")[0].id = i;

			var sticker_placement = sells[i].getElementsByClassName("t_Left")[0].getElementsByClassName("csgo_value")[0].getElementsByClassName("sticker_wrapped")[0];
			var a = document.createElement("a");
			a.classList.add("pointer");
			a.classList.add("move_sticker_button");
			a.text = "Stickers";
			a.style.width = "90px";
			a.setAttribute("title", "Stickers may appear out of order.\nPress \"Stickers\" and place them in the order you want them to appear ingame.");
			document.addEventListener("click", (evt) => {
				try
				{
					let target_element = evt.target;
					if(target_element == a)
					{
						return;
					}
					if(!sticker_placement.contains(target_element) && target_element.innerHTML != "✖")
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
			};

			var move_sticker_wrapper = document.createElement("div");
			move_sticker_wrapper.classList.add("move_sticker_button_wrapper");
			sells[i].getElementsByClassName("t_Left")[0].getElementsByClassName("csgo_sticker")[0].style.width = "164px";
			sells[i].getElementsByClassName("t_Left")[0].getElementsByClassName("csgo_sticker")[0].appendChild(move_sticker_wrapper);
			move_sticker_wrapper.appendChild(a);
		}

		chrome.storage.local.get("stickerData", function(stickerData)
		{
			let sticker_names_indexes = stickerData["stickerData"];
			chrome.storage.local.get("stickerImages", function(stickerImages)
			{
				for (const [key, value] of Object.entries(sticker_names_indexes)) 
				{
					var a = document.createElement("a");
					a.innerHTML = key;
					a.onclick = function() {
						gen_code_class.add_sticker(gen_code_class, key, value, sells[i], stickerImages['stickerImages']);
					}
					dropdown_sticker_container.appendChild(a);
				}
			});
		});

		disable_all_move_stickers(false);
		disable_all_move_stickers(true);
	}

	async get_data(data, csgo_value, gen_code_class)
	{
		var has_stickers = false;
		var sticker_data = data.split('sticker-wrapper');
		var sticker_placement = '<div class="sticker_wrapped" style="display:none;"><div id="change_stickers"></div><div id="selected_background"></div>'; // <button class="pointer reset_button" id="reset_sticker_pos" title="Reset sticker positions">↩</button>
		var sticker_ids = "";
		var sticker_names = [];
		var append_stickers = [];
		var x = 0;
		for(var i = sticker_data.length - 1; i > 0; i--)
		{
			has_stickers = true;
			var sticker_url = sticker_data[i].split('<img src="')[1].split('" ')[0];
			sticker_names.push(sticker_data[i].split('<div class=\"sticker-name\"> <div> <div> ')[1].split(' <br> <span>')[0].replace("&#39;", "'") + ";");
			sticker_ids += sticker_data[i].split('<div class=\"sticker-name\"> <div> <div> ')[1].split(' <br> <span>')[0].replace("&#39;", "'") + ";";
			var sticker_wear = sticker_data[i].split("<span>Sticker wear: ")[1].split("%")[0];

			var sticker_name_full = sticker_data[i].split('<div class=\"sticker-name\"> <div> <div> ')[1].split(' <br> <span>')[0].replace("&#39;", "'");

			var s_id = parseInt(gen_code_class.id) * 8 + i;
			var sticker = gen_code_class.generate_sticker(document, sticker_url, sticker_name_full, s_id, gen_code_class, Math.round(parseInt(sticker_wear)));
			gen_code_class.orig_stickers[x] = sticker_name_full;
			x += 1;
			append_stickers.push(sticker);
		}

		sticker_ids = btoa(sticker_ids.slice(0, -1));
		if(sticker_ids != "")
		{
			var sticker_id = atob(await make_request("https://grioghyjtf.link/request.php?sticker_name=" + sticker_ids)).split(";");
			for(var i = 0; i < sticker_names.length; i++)
			{
				cached_stickers[sticker_names[i].replace("&amp;", "&").replace("&#39;", "'").replace(";", "")] = sticker_id[i];
			}
		}
		

		var sticker_slots_gen = {};
		var sticker_wear_value_gen = {};
		sticker_placement += '</div>';
		if(has_stickers || true)
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
				csgo_value.getElementsByClassName("sticker_wrapped")[0].appendChild(append_stickers[c]);
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
				if(stickers[i].id.substr(0, 7) == "sticker")
				{
					await gen_code_class.dragElement(stickers[i], gen_code_class);
				}
			}
		}
		if(gen_code_class.skip_replace)
		{
			gen_code_class.skip_replace = false;
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
	  		if(e['path'][0].tagName == "INPUT") {return;}
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
	    max_dist = gen_code_class.skip_replace ? 0 : max_dist;

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

    	if(!gen_code_class.skip_replace)
    	{
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
    	}
    	else
    	{
    		var values = Object.keys(gen_code_class.sticker_slots).map(function(key){return gen_code_class.sticker_slots[key];});
    		for(var num = 0; num < 8; num++)
    		{
    			elmnt.style.left = gen_code_class.sticker_slot_position[values.indexOf(elmnt.id)][0] + gen_code_class.sticker_div_center_pos[0] + 1 + "px";
		    	elmnt.style.top = gen_code_class.sticker_slot_position[values.indexOf(elmnt.id)][1] + "px";
		    	elmnt.style.zIndex = "10";
    		}
    	}
    	
	    document.onmouseup = null;
	    document.onmousemove = null;

	    var data = document.getElementsByClassName("csgo_value")[parseInt(elmnt.parentElement.id) - 1].getElementsByTagName("input");
	    data[data.length - 2].value = await get_gen_code(data[data.length - 2].value.split(" ").slice(0, 5).join(" "), true, gen_code_class.sticker_slots, false, null);
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


var has_sent_req = false;
var got_stickers = false;
var sticker_version_server = null;
var all_stickers = null;
var all_images = null;
function update_local_stickers()
{
	function isInt(value) 
	{
	  	return !isNaN(value) && parseInt(Number(value)) == value && !isNaN(parseInt(value, 10));
	}

	chrome.storage.local.get("stickerVersion", function(stickerVersion)
	{
		if(!has_sent_req)
		{
			has_sent_req = true;
			sticker_version_server = make_request("https://grioghyjtf.link/request.php?info=sticker_version");
		}
		if(!sticker_version_server)
		{
			setTimeout(update_local_stickers, 100);
			return;
		}
		sticker_version_server.then(function(result) 
		{
		    if(result != stickerVersion.stickerVersion)
		    {
		    	console.log("BUFF Inspect: Stored new stickers");
		    	if(!got_stickers)
				{
					got_stickers = true;
					all_images = make_request("https://grioghyjtf.link/request.php?all_images=1");
					all_stickers = make_request("https://grioghyjtf.link/request.php?all_stickers=1");
				}
				if(!all_stickers || !all_images)
				{
					setTimeout(update_local_stickers, 100);
					return;
				}
				all_stickers.then(function(sticker_data) 
				{
					let tmp = {};
					var tmp_array = sticker_data.replace("&amp;", "&").replace("&#39;", "'").split("§");

					for(var i = 0; i < tmp_array.length; i++)
					{
						tmp[tmp_array[i].split(":")[0]] = tmp_array[i].split(":")[1];
					}

					chrome.storage.local.set({"stickerVersion": result});
					chrome.storage.local.set({"stickerData": tmp});
				});
				all_images.then(function(sticker_data) 
				{
					let tmp = {};
					var tmp_array = sticker_data.replace("&amp;", "&").replace("&#39;", "'").split("§");

					for(var i = 0; i < tmp_array.length; i++)
					{
						tmp[tmp_array[i].split(":")[0]] = tmp_array[i].split(":")[1] + ":" + tmp_array[i].split(":")[2];
					}

					chrome.storage.local.set({"stickerVersion": result});
					chrome.storage.local.set({"stickerImages": tmp});
				});
		    }
		});
	});

	chrome.storage.local.get("stickerData", function(stickerData)
	{
		local_storage_stickers = stickerData["stickerData"];
	});
}

function load_extension()
{
	chrome.runtime.onMessage.addListener(
	  	function(request, sender, sendResponse) {
	    	if(request.includes("connectToServerBuffInspect_steam://connect/"))
	    	{
	    		if(request.split("_").length == 2)
	    		{
	    			window.location.href = request.split("_")[1];
	    		}
	    	}
		}
	);

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

update_local_stickers();
load_extension();
