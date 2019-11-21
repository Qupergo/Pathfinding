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

//Change text
function changeText(id, text) {
    let element = document.getElementById(id);
    element.innerHTML = text;
}

//Find path
async function find_path(loadingbar_id) {
    let algorithm = document.getElementById("pathfinding").innerHTML.split(" ");
    let speed = document.getElementById("speed").innerHTML.split(" ")[1];

    let loadingbar = document.querySelector("#" + loadingbar_id)

    loadingbar.classList.remove("loading");
    loadingbar.classList.add("loading_show");

    if (algorithm.includes("Dijkstra")) {
        await dijkstra(speed.toLowerCase())
    }

    if (algorithm.includes("Greedy")) {
        await greedy(speed.toLowerCase())
    }

    loadingbar.classList.remove("loading_show");
    loadingbar.classList.add("loading");
      

}

//Generate maze
async function generate_maze(loadingbar_id) {
    let algorithm = document.getElementById("maze").innerHTML.split(" ");
    let speed = document.getElementById("speed").innerHTML.split(" ")[1];

    let loadingbar = document.getElementById(loadingbar_id)

    loadingbar.classList.remove("loading");
    console.log(loadingbar);

    if (algorithm.includes("Prim")) {
        await prim(speed.toLowerCase())
    }

    if (algorithm.includes("Hunt")) {
        await hunt_and_kill(speed.toLowerCase())
    }

    loadingbar.classList.add("loading");


}


//Refresh grid
async function refresh_grid() {
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

async function reset_grid() {
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
            tile.className = "unvisited";
        }
        
    }
    algorithm_in_progress = false;
    refreshing = false;
}

//Create Grid
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
            if (x == 50 && y == 20) {
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

//Dijkstra
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
        if (!algorithm_in_progress) {
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
                if (!algorithm_in_progress) {
                    return; //Stop algorithm if trying to reset algorithms
                }
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
                    if (speed !== "instant") {
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

        if (speed === "instant") {
            //Do nothing
        }
        nodes.remove(node);
    }
}

//Greedy
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

    while (true) {
        if (!algorithm_in_progress) {
            return; //Stop algorithm if trying to reset algorithms
        }
        
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
                if (!algorithm_in_progress) {
                    return; //Stop algorithm if trying to reset algorithms
                }
                const nodes = neighboring_nodes(node.id.split("_"), "visited")
                let shortest = Infinity;

                for (let index = 0; index < nodes.length; index++) {
                    const current_node = nodes[index];
                    dist = actual_dists[current_node.id];
                    if (dist < shortest) {
                        shortest = actual_dists[current_node.id];
                        node = current_node;
                    }
                    if (speed !== "instant") {
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

        if (speed === "instant") {
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

function neighboring_nodes(pos, find_with, corners=false, find_end=true, offset=1) {
    pos_x = pos[0];
    pos_y = pos[1];

    squares = [];

    for (let y = -1; y < 2; y++) {
        for (let x = -1; x < 2; x++) {
            if (!corners) {
                if (x == y || x == -y) {
                    continue;
                }
            }

            temp_x = pos_x - - x*offset
            temp_y = pos_y - - y*offset

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

async function prim(speed) {
    prepare_maze()
    walls = [];
    maze = [];
    let start = document.querySelector(".start");
    let end = document.querySelector(".end");

    neighbor_walls = neighboring_nodes(start.id.split("_"), "node", corners=false, true, 2);
    for (let index = 0; index < neighbor_walls.length; index++) {
        const element = neighbor_walls[index];
        walls.push(element);
    }

    while (walls.length > 0) {

        let wall = walls[Math.floor(Math.random()*walls.length)];

        let neighbor_maze = neighboring_nodes(wall.id.split("_"), "unvisited", corners=false, true, 2)


        prev_node = neighbor_maze[0]
        prev_node_pos = prev_node.id.split("_");
        current_pos = wall.id.split("_")

        x_offset = (prev_node_pos[0] - current_pos[0])/2
        y_offset = (prev_node_pos[1] - current_pos[1])/2

        wall_between = document.getElementById((current_pos[0] - -x_offset) + "_" + (current_pos[1] - -y_offset))

        if (wall_between.classList.contains("end")) {
            wall_between.className = "unvisited end"
        }
        else {
            wall_between.className = "unvisited";
        }

        if (wall.classList.contains("end")) {
            wall.className = "unvisited end"
        }
        else {
            wall.className = "unvisited";
        }        
        
        neighbor_walls = neighboring_nodes(wall.id.split("_"), "node", corners=false, true, 2);

        for (let index = 0; index < neighbor_walls.length; index++) {
            const element = neighbor_walls[index];
            walls.push(element);
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

        if (speed === "instant") {
            //Do nothing
        }
        walls.remove(wall);
    }
}

async function hunt_and_kill(speed) {
    prepare_maze()
    let start = document.querySelector(".start");
    let start_pos = start.id.split("_");
    let prev_node = start;
    let nodes = neighboring_nodes(prev_node.id.split("_"), "node", corners=false, true, 2);

    while (true) {
        //Walk
        while (nodes.length > 0) {

            let node = nodes[Math.floor(Math.random()*nodes.length)] 
            if (node.classList.contains("end")) {
                node.className = "unvisited end";
            }

            else {
                node.className = "unvisited";
            }
            
            prev_node_pos = prev_node.id.split("_");
            current_pos = node.id.split("_")

            x_offset = (prev_node_pos[0] - current_pos[0])/2
            y_offset = (prev_node_pos[1] - current_pos[1])/2

            wall_between = document.getElementById((current_pos[0] - -x_offset) + "_" + (current_pos[1] - -y_offset))

            if (wall_between.classList.contains("end")) {
                wall_between.className = "unvisited end"
            }
            else {
                wall_between.className = "unvisited";
            }

            prev_node = node;
            nodes = neighboring_nodes(prev_node.id.split("_"), "node", corners=false, find_end=true, 2)
            if (speed === "slow") {
                await sleep(500);
            }
    
            if (speed === "mid") {
                await sleep(100);
            }
    
            if (speed === "fast") {
                await sleep(0);
            }
    
            if (speed === "instant") {
                //Do nothing
            }
        }

        //Hunt
        unvisited_nodes = document.querySelectorAll(".node");
        for (let index = 0; index < unvisited_nodes.length; index++) {
            const node = unvisited_nodes[index];
            let neighbors = neighboring_nodes(node.id.split("_"), "unvisited", corners=false, find_end=true, 2)
            if (neighbors.length > 0) {
                prev_node = neighbors[Math.floor(Math.random()*neighbors.length)];
                nodes = neighboring_nodes(prev_node.id.split("_"), "node", corners=false, find_end=true, 2)
                break;
            }
            
        }
        if (nodes.length == 0) {
            break;
        }
    }
}


function prepare_maze() {
    refresh_grid(); 
    for (let y = 0; y < 100; y++) {
        for (let x = 0; x < 100; x++) {
            let tile = document.getElementById(x + "_" + y)
            if (tile.classList.contains("end")) {
                tile.classList.add("node")
                continue;
            }

            if (tile.classList.contains("start")) {
                continue;
            }

            if (x % 2 === 0 && y % 2 === 0) {
                tile.className = "node wall"
                continue;
            }
            tile.className = "wall";
        }
    }
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

