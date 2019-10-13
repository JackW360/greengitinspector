
//load google charts api
google.charts.load('current', {'packages':['corechart']});
google.charts.load('current', {'packages':['table']});

var csv;

// Search
async function search() {
  //first check if the url is good
  //need to fix the send_request function to accept parameters for the repo and owner
  //probably need to include stuff for accepting http instead of https and also the url without that
  const url = document.getElementById("search_input").value;

  if (url.length < 23){
    search_repo_error();
  }
  else{
    let base_url = url.slice(0, 19);
    //console.log(base_url)

    let info = url.slice(19);
    //console.log(info)

    if (info.split("/").length != 2){
      search_repo_error();
    }
    else{
      let owner = info.split("/")[0];
      let repo = info.split("/")[1];

      //check url is same as github.com ....
      if ((base_url != 'https://github.com/') || (info.split("/").length != 2)){
          search_repo_error();
      }
      else{
        const data = await send_request({repo: repo, owner: owner});

        if (data == null){
          search_repo_error();
        }
        else{
          generate_pie_chart(data);
          generate_table(data);
        }
      }
    }
  }
}


async function send_request(query){

  let search_string = '/home/search?owner=' + query['owner'] + '&repo=' + query['repo'];

  const response = await fetch(search_string)
    .catch();

  const text = await response.text();

  if ((text != null) && (text != '')){
    const data = JSON.parse(text);
    return data
  }
  return null
}


function search_repo_error(){
  //function for handling errors with searching for a repository
  //will create an alert when the search url is invalid
  alert('The repository url is invalid. Please re-enter a valid url');
  document.getElementById("search").value = '';
}


//function to make pie chart
function generate_pie_chart(data) {
  //pie chart taken from google.developers
  console.log(data)
  //generates a table of data corresponding to the data from github
  let chart_info_array = [];
  total = 0
  chart_info_array.push(['Task', 'Total Commits', 'Issues Solved', 'Average Time to Solve']);
  for (let i=0; i< data.contributors.length; i++){
    let temp_array = [];

    temp_array.push(data.contributors[i]['author']['login']);
    temp_array.push(data.contributors[i]['total']);
    temp_array.push(data.contributors[i]['issues_resolved'])
    temp_array.push(data.contributors[i]['average_resolve'])

    /*
    temp_array.push(data['contributors'][i]['author']['login']);
    temp_array.push(data['contributors'][i]['total']);
    */

    total += Number(data.contributors[i]['total'])

    //testing adding tooltip
    chart_info_array.push(temp_array);
    console.log(temp_array)
  };


  //let chart_data = google.visualization.arrayToDataTable(chart_info_array);
    let chart_data = new google.visualization.DataTable();
    chart_data.addColumn('string', 'Task');
    chart_data.addColumn('number', 'Total Commits');
    chart_data.addColumn({type: 'string', role:'tooltip'});

    for (let i=0; i< chart_info_array.length; i++){
      currno = Number(chart_info_array[i][1])
      chart_data.addRow([
        chart_info_array[i][0],
        currno,
        chart_info_array[i][0] + ", " + chart_info_array[i][1] + "(" + (100*currno/total).toFixed(2) + "%)\nissues solved: " +
        chart_info_array[i][2] + "\naverage time to solve issue: " +
        chart_info_array[i][3]
      ]);
    };

    // Optional; add a title and set the width and height of the chart
    var options = {'title':'Developer Code Distribution',
                   'width':550, 'height':400,
                   'backgroundColor': '98e979',
                   'colors': ['#66ffba', '#49de9b', '#2eb87a', '#17915a','#0c7847'],
                   'tooltip': {isHtml: true}
                  };

    // Display the chart inside the <div> element with id="piechart"
    var chart = new google.visualization.PieChart(document.getElementById('piechart'));
    chart.draw(chart_data, options);
}

//function to make table
function generate_table(data){
  //calling google.visualization.DataTable() to create a table
  var table = new google.visualization.DataTable();

  //add 1st two columns
  table.addColumn('string', 'Contributors');
  table.addColumn('number', 'Commits');
  table.addColumn('number', 'Issues Resolved');

  //total contribution per week
  let week_work = [];
  var sum = 0;

  //calculating total contribution per week
  /*for(let i = 0; i < data['contributors'][0]['weeks'].length; i++){
    for(let j = 0; j < data['contributors'].length; j++){
      sum += data['contributors'][j]['weeks'][i]['a'] + data['contributors'][j]['weeks'][i]['d'];
    }
    if(sum <= 0){
      sum = 1;
    }
    week_work.push(sum);
    sum = 0;
  }*/

  //columns corresponding to weeks
  for (let i = data.contributors[0]['weeks'].length - 1; i >= 0 ; i--){
    table.addColumn('number', 'Week' + String(i + 1));

    for(let j = data.contributors.length - 1; j >=0 ; j--){
        sum += data.contributors[j].weeks[i].a + data.contributors[j].weeks[i].d;
      }
      if(sum <= 0){
        sum = 1;
      }
      week_work.unshift(sum);
      sum = 0;
    }


  //array for rows
  let rows = [];

  //populating rows with data
  for (let i=0; i< data['contributors'].length; i++){
    rows.push([data['contributors'][i]['author']['login'], data['contributors'][i]['total'],
    	data['contributors'][i]['issues_resolved']]);

    for (let j = data['contributors'][i]['weeks'].length - 1; j >= 0 ; j--){
      var value = data['contributors'][i]['weeks'][j]['a'] + data['contributors'][i]['weeks'][j]['d'];
      rows[i].push((value / week_work[j]) * 100);
    }
  }
  table.addRows(rows);

  csv = google.visualization.dataTableToCsv(table);

  //creating table
  var chart = new google.visualization.Table(document.getElementById('table'));

  //format table for implementing progress bar
  var formatter = new google.visualization.BarFormat({width: 14});
  for(let j = 0; j < data['contributors'][0]['weeks'].length ; j++){
    formatter.format(table, 3 + j);
  }

  //code for drawing table
  chart.draw(table, {allowHtml: true, showRowNumber: true, width: '100vw', height: '50vh',
      frozenColumns: 3, alternatingRowStyle: true});
}


function toCsv(){
	var hiddenElement = document.createElement('a');
    hiddenElement.href = 'data:text/csv;charset=utf-8,' + encodeURI(csv);
    hiddenElement.target = '_blank';
    hiddenElement.download = 'summary.csv';
    hiddenElement.click();
}
