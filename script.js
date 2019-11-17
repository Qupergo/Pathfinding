
let isMouseDown = false;
let right_click = false;

document.onmousedown = function() { isMouseDown = true; };
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
            

            //Place start node
            if (x == 10 && y == 20) {
                td.className = "bg-info";
                td.id = "start";
            }

            //Place end node
            if (x == 30 && y == 20) {
                td.className = "bg-danger";
                td.id = "end";
            }
        }
        table.appendChild(tr);
    }
    return table
}

function place_object(td, type, isRightClick, clicked=false) {

    if (isMouseDown || clicked)
    {
        if (isRightClick) {
            td.className = "";
        }

        else {
            td.classList.remove("empty")
            td.classList.add(type);
        }
    }
}


let table = create_grid()
