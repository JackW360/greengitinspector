//file for functionality of page

// Search
function search() {
  generate_table();
}
//function to make table
function generate_table() {
  // initialise a table
  var timeline = document.createElement("TABLE");
  timeline.setAttribute("id", "timeline");

  // for loop to create rows
  for (var i=0; i<5; i++) {
    var row = document.createElement("TR");
    timeline.appendChild(row);
    // for loop to create cells
	  for (var j=0; j<5; j++) {
      var new_cell = document.createElement("TD");
      var name = document.createTextNode("testname");
      new_cell.appendChild(name);
      row.appendChild(new_cell);
    }
  }
  // add timeline to page
  document.body.appendChild(timeline);
}
