
let isMouseDown = false;
let right_click = false;

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
                td.className = "bg-info start";
            }

            //Place end node
            if (x == 30 && y == 20) {
                td.className = "bg-danger end";
            }
            td.id = x + "_" + y;
        }
        table.appendChild(tr);
    }
    return table;
}


function place_object (td, type, isRightClick, clicked=false) {

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

function find_path (algorithm) {
    let start = document.querySelector(".start");
    let end = document.querySelector(".end");

    unvisited_nodes = document.querySelectorAll(".unvisited");

    start_pos = start.id.split("_");
    id = start.id

    let unvisited_distances = {id:0}

    for (let index = 0; index < unvisited_nodes.length; index++) {
        
        const node = unvisited_nodes[index];
        let current_pos = node.id.split("_");
        let current_id = node.id;

        unvisited_distances.current_id = distance(start_pos, current_pos);
        let neighbor_nodes = neighboring_nodes(current_pos);

        for (let jndex = 0; jndex < neighbor_nodes.length; jndex++) {
            const element = neighbor_nodes[jndex];
            
        }



    }
}

function distance(start, pos) {
    return Math.abs(start[0] - pos[0]) + Math.abs(start[1] - pos[1]);
}

function neighboring_nodes(pos) {
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
            
            if (tile.classList.contains("unvisited")) {
                squares.push([temp_x, temp_y]);
            }

        }
    }
    return squares;
}

let table = create_grid();

setInterval(function() { find_path("dijkstra") }, 1000)