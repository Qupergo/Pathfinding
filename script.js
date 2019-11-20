
let isMouseDown = false;
let right_click = false;
let algorithm_in_progress = false;
let refreshing = false;

document.onmousedown = () => isMouseDown = true; ;
document.onmouseup   = function() { isMouseDown = false; right_click = false; };

window.oncontextmenu = function ()
{
    return false;     // cancel default menu
}

function mouseDown(e) {
  e = e || window.event;
  if ( !e.which && e.button !== undefined ) {
    e.which = ( e.button & 1 ? 1 : ( e.button & 2 ? 3 : ( e.button & 4 ? 2 : 0 ) ) );
  }
  if (e.which === 1) {
      right_click = false;
  }

  else if (e.which === 3) {
      right_click = true;
  }
}

function refresh_grid() {
    refreshing = true;
    for (let y = 0; y < 100; y++) {
        for (let x = 0; x < 100; x++) {
            let tile = document.getElementById(x + "_" + y);

            if (tile.classList.contains("start")) {
                tile.className = "start unvisited";
                continue;
            }

            if (tile.classList.contains("end")) {
                tile.className = "end unvisited";
                continue;
            }

            if (tile.classList.contains("wall")) {
                tile.className = "wall";
                continue;
            }
            tile.className = "unvisited";
        }
        
    }
    algorithm_in_progress = false;
    refreshing = false;
}

function create_grid() {
    let table = document.createElement("table");
    document.body.appendChild(table);
    table.classList.add("table");
    table.classList.add("table-bordered");

    for (let y = 0; y < 100; y++) {
        let tr = document.createElement("tr");

        for (let x = 0; x < 100; x++) {
            let td = document.createElement("td");
            tr.appendChild(td);
            td.addEventListener('mousemove', function() {place_object(this, "wall", right_click)});
            td.addEventListener('click', function() {place_object(this, "wall", right_click, clicked=true)});
            td.className = "unvisited"

            //Place start node
            if (x == 10 && y == 20) {
                td.className = "start unvisited";
            }

            //Place end node
            if (x == 30 && y == 20) {
                td.className = "end unvisited";
            }

            if (x == 60 && y < 41 || y == 40 && x < 60) {
                td.className = "wall";
            }

            td.id = x + "_" + y;
        }
        table.appendChild(tr);
    }
    return table;
}


function place_object (td, type, isRightClick, clicked=false) {

    if (td.classList.contains("start") || td.classList.contains("end")){
        return
    }

    if (isMouseDown || clicked)
    {

        if (isRightClick) {
            td.className = "unvisited";
        }

        else {
            td.classList.remove("unvisited");
            td.classList.add(type);
        }
    }
}

async function dijkstra (speed) {
    if (algorithm_in_progress) {
        return; //Don't run more than one algorithm at a time
    }
    algorithm_in_progress = true;
    let start = document.querySelector(".start");
    let end = document.querySelector(".end");

    nodes = document.querySelectorAll(".unvisited");

    start_pos = start.id.split("_");
    id = start.id;

    let distances = {};

    for (let index = 0; index < nodes.length; index++) {
        
        const node = nodes[index];
        let current_id = node.id;
        if (node.classList.contains("start"))
        {
            distances[current_id] = 0;
        }
        else {
            distances[current_id] = Infinity;
        }
    }
    nodes = Array.from(nodes);
    let iter = 0;

    while (true) {
        if (refreshing) {
            return; //Stop algorithm if trying to reset algorithms
        }
        iter++;
        
        let shortest_distance = Infinity;
        let selected_node;
        
        //Select current node
        for (let index = 0; index < nodes.length; index++) {
            selected_node = nodes[index];
            const id = nodes[index].id;

            if (distances[id] < shortest_distance) {
                shortest_distance = distances[id]
                node = selected_node;
            }
        }

        const current_pos = node.id.split("_");
        const current_id = node.id;
        let neighbor_nodes = neighboring_nodes(current_pos, "unvisited");

        for (let jndex = 0; jndex < neighbor_nodes.length; jndex++) {
            cur_node = neighbor_nodes[jndex];
            let cur_id = cur_node.id;
            cur_node.classList.add("visiting");

            current_distance = distances[current_id] + 1;

            if (current_distance < distances[cur_id]) {
                distances[cur_id] = current_distance;
            }
        }

        if (node.classList.contains("visiting")) {
            node.classList.remove("visiting");
        }
        node.classList.remove("unvisited");
        node.classList.add("visited");

        if (node.classList.contains("end")) {

            while (true)
            {
                const nodes = neighboring_nodes(node.id.split("_"), "visited")
                let shortest = Infinity;
                for (let index = 0; index < nodes.length; index++) {
                    const element = nodes[index];
                }

                for (let index = 0; index < nodes.length; index++) {
                    const current_node = nodes[index];
                    dist = distances[current_node.id];
                    if (dist < shortest) {
                        shortest = distances[current_node.id];
                        node = current_node;
                    }
                    if (speed !== "fastest") {
                        await sleep(10);
                    }
                }

                if (node.classList.contains("start")) {
                    return;
                }

                node.classList.remove("visited");
                node.classList.add("path");
            }
        }
        if (speed === "slow") {
            await sleep(500);
        }

        if (speed === "mid") {
            await sleep(100);
        }

        if (speed === "fast") {
            await sleep(0);
        }

        if (speed === "fastest") {
            //Do nothing
        }
        nodes.remove(node);
    }
}

async function greedy (speed) {
    if (algorithm_in_progress) {
        return; //Don't start more than one algorithm at a time
    }
    algorithm_in_progress = true;
    actual_dists = {};
    let start = document.querySelector(".start");
    let end = document.querySelector(".end");

    nodes = document.querySelectorAll(".unvisited");

    start_pos = start.id.split("_");
    id = start.id;
    end_pos = end.id.split("_");

    let distances = {};

    for (let index = 0; index < nodes.length; index++) {
        
        const node = nodes[index];
        let current_id = node.id;
        if (node.classList.contains("start"))
        {
            distances[current_id] = 0;
            actual_dists[current_id] = 0;
        }
        else {
            distances[current_id] = Infinity;
            actual_dists[current_id] = Infinity;
        }
    }
    nodes = Array.from(nodes);
    let iter = 0;

    while (true) {
        if (refreshing) {
            return; //Stop algorithm if trying to reset algorithms
        }
        iter++;
        
        let shortest_distance = Infinity;
        let selected_node;
        
        //Select current node
        for (let index = 0; index < nodes.length; index++) {
            selected_node = nodes[index];
            const id = nodes[index].id;

            if (distances[id] < shortest_distance) {
                shortest_distance = distances[id]
                node = selected_node;
            }

  
        }

        const current_pos = node.id.split("_");
        const current_id = node.id;
        let neighbor_nodes = neighboring_nodes(current_pos, "unvisited");
        
        for (let jndex = 0; jndex < neighbor_nodes.length; jndex++) {
            cur_node = neighbor_nodes[jndex];
            let cur_id = cur_node.id;
            cur_node.classList.add("visiting");

            current_distance = distance(end_pos, cur_id.split("_"));

            distances[cur_id] = current_distance;

            current_distance = actual_dists[current_id] + 1;

            if (current_distance < actual_dists[cur_id]) {
                actual_dists[cur_id] = current_distance;
            }
        }

        if (node.classList.contains("visiting")) {
            node.classList.remove("visiting");
        }
        node.classList.remove("unvisited");
        node.classList.add("visited");

        if (node.classList.contains("end")) {

            while (true)
            {
                const nodes = neighboring_nodes(node.id.split("_"), "visited")
                let shortest = Infinity;
                


                for (let index = 0; index < nodes.length; index++) {
                    const current_node = nodes[index];
                    dist = actual_dists[current_node.id];
                    if (dist < shortest) {
                        shortest = actual_dists[current_node.id];
                        node = current_node;
                    }
                    if (speed !== "fastest") {
                        await sleep(10);
                    }
                }

                if (node.classList.contains("start")) {
                    return;
                }

                node.classList.remove("visited");
                node.classList.add("path");
            }
        }
        if (speed === "slow") {
            await sleep(500);
        }

        if (speed === "mid") {
            await sleep(100);
        }

        if (speed === "fast") {
            await sleep(0);
        }

        if (speed === "fastest") {
            //Do nothing
        }
        nodes.remove(node); 
    }
}


function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}


function distance(end, pos) {
    return Math.abs(end[0] - pos[0]) + Math.abs(end[1] - pos[1]);
}

function neighboring_nodes(pos, find_with, find_end = true) {
    pos_x = pos[0];
    pos_y = pos[1];

    squares = [];

    for (let y = -1; y < 2; y++) {
        for (let x = -1; x < 2; x++) {
            if (x == y || x == -y) {
                continue;
            }
            temp_x = pos_x - - x
            temp_y = pos_y - - y

            tile = document.getElementById(`${temp_x}_${temp_y}`);
            if (tile === null) {
                continue;
            }

            if (!find_end && tile.classList.contains("end")) {
                continue;
            }

            if (tile.classList.contains(find_with)) {
                squares.push(tile);
            }

        }
    }
    return squares;
}

Array.prototype.remove = function() {
    var what, a = arguments, L = a.length, ax;
    while (L && this.length) {
        what = a[--L];
        while ((ax = this.indexOf(what)) !== -1) {
            this.splice(ax, 1);
        }
    }
    return this;
};

let table = create_grid();

