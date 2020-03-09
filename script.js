let isMouseDown = false;
let right_click = false;
let algorithm_in_progress = false;
let refreshing = false;
let maze_in_progress = false;

let size = [70, 30];

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

    if (algorithm.includes("Dijkstra")) {
        await pathfind(dijkstra_selection, dijkstra_path, speed.toLowerCase());
    }

    if (algorithm.includes("Greedy")) {
        await pathfind(greedy_selection, greedy_path, speed.toLowerCase())
    }

    if (algorithm.includes("Depth")) {
        await pathfind(depth_selection, depth_path, speed.toLowerCase())
    }

    if (algorithm.includes("Breadth")) {
        await pathfind(breadth_selection, breadth_path, speed.toLowerCase())
    }

    loadingbar.classList.add("loading");
      

}

//Generate maze
async function generate_maze(loadingbar_id) {
    let algorithm = document.getElementById("maze").innerHTML.split(" ");
    let speed = document.getElementById("speed").innerHTML.split(" ")[1];

    let loadingbar = document.getElementById(loadingbar_id)

    loadingbar.classList.remove("loading");

    if (algorithm.includes("Prim")) {
        await prim(speed.toLowerCase())
    }

    if (algorithm.includes("Hunt")) {
        await hunt_and_kill(speed.toLowerCase())
    }

    if (algorithm.includes("Kruskal")) {
        await kruskal(speed.toLowerCase())
    }

    set_size([70, 30])
    loadingbar.classList.add("loading");
}


//Refresh grid
async function refresh_grid() {
    refreshing = true;
    for (let y = 0; y <= size[1]; y++) {
        for (let x = 0; x <= size[0]; x++) {
            let tile = document.getElementById(x + "_" + y);

            if (tile.classList.contains("start")) {
                tile.className = "start unvisited";
            }

            else if (tile.classList.contains("end")) {
                tile.className = "end unvisited";
            }

            else if (tile.classList.contains("wall")) {
                tile.className = "wall";
            }
            else {
                tile.className = "unvisited";
            }
        }
        
    }
    algorithm_in_progress = false;
    refreshing = false;
}

async function reset_grid() {
    for (let y = 0; y <= size[1]; y++) {
        for (let x = 0; x <= size[0]; x++) {
            let tile = document.getElementById(x + "_" + y);

            if (tile.classList.contains("start")) {
                tile.className = "start unvisited";
            }

            else if (tile.classList.contains("end")) {
                tile.className = "end unvisited";
            }
            else {
                tile.className = "unvisited";
            }
        }
        
    }
    algorithm_in_progress = false;
    refreshing = false;
}

function set_size(size) {
    for (let y = 0; y < 100; y++) {
        for (let x = 0; x < 100; x++) {
            td = document.getElementById(x + "_" + y);
            if (td === null) {
                continue;
            }
            if (x > size[0] || y > size[1]) {
                td.style.visibility = "hidden";
                td.className = "wall";
                td.id = "";
            }
        }
    }
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



            td.id = x + "_" + y;
        }
        table.appendChild(tr);
    }
    set_size(size)

    return table;
}


function place_object(td, type, isRightClick, clicked=false) {

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

async function pathfind(selection_function, path_function, speed) {
    if (algorithm_in_progress || maze_in_progress) {
        return; //Don't run more than one algorithm at a time
    }
    algorithm_in_progress = true;

    //Initialize all values
    let start = document.querySelector(".start");
    let end = document.querySelector(".end");
    let end_pos = end.id.split("_");
    start_pos = start.id.split("_");
    let distances = {};
    nodes = document.querySelectorAll(".unvisited");
    nodes = Array.from(nodes);

    //Set all distances to infinity except start
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

    node = start;

    while (true) {

        if (!algorithm_in_progress || maze_in_progress) {
            return; //Stop algorithm if trying to reset algorithms
        }


        //Set distances
        const current_pos = node.id.split("_");
        const current_id = node.id;

        let neighbor_nodes = neighboring_nodes(current_pos, "unvisited");

        for (let index = 0; index < neighbor_nodes.length; index++) {
            cur_node = neighbor_nodes[index];
            let cur_id = cur_node.id;
            cur_node.classList.add("visiting");

            current_distance = distances[current_id] + 1;

            distances[cur_id] = current_distance;
            
        }

        //Change node to visited
        if (node.classList.contains("visiting")) {
            node.classList.remove("visiting");
        }
        node.classList.remove("unvisited");
        node.classList.add("visited");        

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

        //If end has been found
        if (node.classList.contains("end")) {

            while (true)
            {
                if (!algorithm_in_progress) {
                    return; //Stop algorithm if trying to reset algorithms
                }

                //Select path
                const nodes = neighboring_nodes(node.id.split("_"), "visited")

                node = await path_function(nodes, distances);

                //Wait if speed is not instant
                if (speed !== "instant") {
                    await sleep(30);
                }

                //If start has been found, function is finished
                if (node.classList.contains("start")) {
                    return;
                }
                
                //Add node to path
                node.classList.remove("visited");
                node.classList.add("path");
            }
        }

        nodes.remove(node);
                
        //Select next node
        node = await selection_function(node, nodes, distances, end_pos)
    }
}

function dijkstra_selection(node, nodes, distances, end_pos) {
    let shortest_distance = Infinity;

    for (let index = 0; index < nodes.length; index++) {
        const selected_node = nodes[index];
        const id = nodes[index].id;

        if (distances[id] < shortest_distance) {
            shortest_distance = distances[id]
            node = selected_node;
        }
    }
    return node
}

function dijkstra_path(nodes, distances) {
    let shortest = Infinity;

    for (let index = 0; index < nodes.length; index++) {
        const current_node = nodes[index];
        dist = distances[current_node.id];
        if (dist < shortest) {
            shortest = distances[current_node.id];
            node = current_node;
        }
    }
    return node;
}

function greedy_selection(node, nodes, distances, end_pos) {
    let shortest_distance = Infinity;

    neighbors = neighboring_nodes(node.id.split("_"), "unvisited")

    if (neighbors.length > 0) {
        nodes = neighbors
    }

    else {
        nodes = document.querySelectorAll(".visiting")
    }

    for (let index = 0; index < nodes.length; index++) {
        selected_node = nodes[index];
        const pos = nodes[index].id.split("_");

        if (distance(end_pos, pos) < shortest_distance) {
            shortest_distance = distance(end_pos, pos)
            node = selected_node;
        }
    }
    return node;
}

function greedy_path(nodes, distances) {
    let shortest = Infinity;

    for (let index = 0; index < nodes.length; index++) {
        const current_node = nodes[index];
        dist = distances[current_node.id];
        if (dist < shortest) {
            shortest = distances[current_node.id];
            node = current_node;
        }
    }
    return node;
}

function depth_selection(node, nodes, distances, end_pos) {
    neighbors = neighboring_nodes(node.id.split("_"), "unvisited")
    if (neighbors.length > 0) {
        return neighbors[0];
    }
    else {
        visiting = document.querySelectorAll(".visiting");
        return visiting[0];
    }
}

function depth_path(nodes, distances) {
    let shortest = Infinity;

    for (let index = 0; index < nodes.length; index++) {
        const current_node = nodes[index];
        dist = distances[current_node.id];
        if (dist < shortest) {
            shortest = distances[current_node.id];
            node = current_node;
        }
    }
    return node;
}

async function breadth_selection(node, nodes, distances, end_pos) {
    return dijkstra_selection(node, nodes, distances, end_pos)
}

async function breadth_path(node, nodes, distances, end_pos) {
    return dijkstra_path(node, nodes, distances, end_pos)
}

function A_star(speed) {

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
    maze_in_progress = true;
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
    maze_in_progress = false;
}

async function hunt_and_kill(speed) {
    prepare_maze()
    let start = document.querySelector(".start");
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

        let undecided = true;
        while (undecided) {
            if (unvisited_nodes.length < 1) {
                break;
            }
            const node = unvisited_nodes[Math.floor(Math.random()*unvisited_nodes.length)];

            let neighbors = neighboring_nodes(node.id.split("_"), "unvisited", corners=false, find_end=false, 2)


            if (neighbors.length > 0) {
                prev_node = neighbors[Math.floor(Math.random()*neighbors.length)];
                nodes = neighboring_nodes(prev_node.id.split("_"), "node", corners=false, find_end=true, 2)
                undecided = false;
                break;
            }
        }

        if (nodes.length == 0) {
            break;
        }
        
    }
    maze_in_progress = false;
}

async function kruskal(speed) {
    prepare_maze()
    maze_in_progress = true;
    walls = [];
    maze = [];

    walls = document.querySelectorAll(".node");
    walls = Array.from(walls);

    while (walls.length > 0) {

        let wall = walls[Math.floor(Math.random()*walls.length)];

        let neighbor_maze = neighboring_nodes(wall.id.split("_"), "node", corners=false, true, 2)
        console.log(neighbor_maze);
        console.log(wall)

        if (neighbor_maze.length == 0) {
            continue;
        }

        prev_node = neighbor_maze[Math.floor(Math.random()*neighbor_maze.length)]
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
    maze_in_progress = false;

}

function prepare_maze() {
    refresh_grid(); 
    for (let y = 0; y <= size[1]; y++) {
        for (let x = 0; x <= size[0]; x++) {
            let tile = document.getElementById(x + "_" + y)
            if (tile.classList.contains("end")) {
                tile.className = "end node"
            }

            else if (tile.classList.contains("start")) {
            }

            else if (x % 2 === 0 && y % 2 === 0) {
                tile.className = "node wall"
            }
            else {
                tile.className = "wall";
            }
        }
    }
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function distance(end, pos) {
    return Math.abs(end[0] - pos[0]) + Math.abs(end[1] - pos[1]);
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
