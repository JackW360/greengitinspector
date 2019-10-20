
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
  
  //updating the search bar to show loading spinner
  document.getElementById("search_icon").innerHTML = '';
  document.getElementById("searching_spinner").innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>';


  const response = await fetch(search_string)
    .catch();
  
  //updating the search bar to get rid of loading spinner
  document.getElementById("search_icon").innerHTML = '<i class="fas fa-search fa-sm"></i>';
  document.getElementById("searching_spinner").innerHTML = '';

  
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

function update_radar(name, data, overall, color){
  //radar
  let colorString = 'rgba(' + color + ', .2)';
  let borderColorString = 'rgba(' + color + ', .7)';
  //console.log(colorString);
  //console.log(borderColorString);

  let overallPercent = overall.toFixed(2);
  document.getElementById("RadarText").innerText = 'Overall contribution of ' + name + ':' + overallPercent + '%';


  var ctxR = document.getElementById("radarChart").getContext('2d');
  var myRadarChart = new Chart(ctxR, {
  type: 'radar',
  data: {
  labels: ["Commits", "Issues", "Additions", "Deletions"],
  datasets: [{
  label: name,
  data: data,
  backgroundColor: [colorString],
  borderColor: [
  borderColorString,
  ],
  borderWidth: 2
  }
  ]
  },
  options: {
  responsive: true
  }
  });
}

  
//function to make pie chart
function generate_pie_chart(data){
  document.getElementById("piechartholder").innerHTML = '<canvas id="myPieChart"></canvas>'
  //generates a table of data corresponding to the data from github
  let chart_info_array = [];
  totalCommits = 0
  totalIssues = 0
  totalAdditions = 0
  totalDeletions = 0

  othersResolved = 0
  resolveCount = 0

  othersAdditions = 0
  othersDeletions = 0

  minimumMax = 100000000000000000
  for (let i=0; i< data.contributors.length; i++){
    let temp_array = [];
    //calculate additions
    additions = 0
    deletions = 0
    temp = data.contributors[i]['weeks']
    for (let j=0; j<temp.length; j++)
    {
      additions += temp[j]['a']
      deletions += temp[j]['d']
    }


    temp_array.push(data.contributors[i]['author']['login']);
    temp_array.push(data.contributors[i]['total']);
    temp_array.push(data.contributors[i]['issues_resolved'])
    temp_array.push(data.contributors[i]['average_resolve'])
    temp_array.push(additions)
    temp_array.push(deletions)

    totalCommits += temp_array[1]
    totalIssues += temp_array[2]
    totalAdditions += temp_array[4]
    totalDeletions += temp_array[5]

    //find top 7 contributors
    if (chart_info_array.length < 7 || temp_array[1] > minimumMax)
    {
      chart_info_array.push(temp_array);
      minimum = totalCommits
      minIndex = 0
      length = chart_info_array.length
      for (let j = 0; j < length; j++)
      {
        if (chart_info_array[j][1] < minimum)
        {
          minIndex = j
          minimum = chart_info_array[j][1]
        }
      }
      if (length == 8)
      {
        temp = chart_info_array[7]
        chart_info_array[7] = chart_info_array[minIndex]
        chart_info_array[minIndex] = temp

        othersResolved += chart_info_array[7][3]
        resolveCount += chart_info_array[7][2]

        othersAdditions += chart_info_array[7][4]
        othersDeletions += chart_info_array[7][5]
        chart_info_array.pop()
      }
      minimumMax = chart_info_array[0][1]
      for (let j = 0; j < chart_info_array.length; j++)
      {
        if (chart_info_array[j][1] < minimumMax)
        {
          minimumMax = chart_info_array[j][1]
        }
      }
    }
    else
    {
      othersResolved += temp_array[3]
      resolveCount += temp_array[2]

      othersAdditions += temp_array[4]
      othersDeletions += temp_array[5]
    }
  };

  //top 7 contributors are now complete
  labels = []
  data = []
  issues = []
  resolved = []
  additions = []
  deletions = []
  piechartPercentage = []

  others_commits = totalCommits
  others_issues = totalIssues

  others_share = 100

  if (othersResolved == 0)
  {
    others_resolved = null
  }
  else
  {
    others_resolved = othersResolved/resolveCount
  }
  for (let j = 0; j < chart_info_array.length; j++)
    {
      labels.push(chart_info_array[j][0])
      data.push(chart_info_array[j][1])
      issues.push(chart_info_array[j][2])
      resolved.push(chart_info_array[j][3])
      additions.push(chart_info_array[j][4])
      deletions.push(chart_info_array[j][5])
      addPercent = (100*additions[j]/totalAdditions)
      delPercent = (100*deletions[j]/totalDeletions)
      comPercent = (100*data[j]/totalCommits)
      issPercent = (100*issues[j]/totalIssues)
      percentage = (addPercent + delPercent + comPercent + issPercent) / 4
      piechartPercentage.push(percentage)
      
      others_share -= percentage
      others_commits = others_commits - chart_info_array[j][1]
      others_issues = others_issues - chart_info_array[j][2]
    }
  labels.push("Others")
  data.push(others_commits)
  issues.push(others_issues)
  resolved.push(others_resolved)
  additions.push(othersAdditions)
  deletions.push(othersDeletions)
  piechartPercentage.push(others_share)

  //had to add this due to array variable being changed above
  const radar = {
    additions: additions,
    deletions: deletions,
  };

  var ctx = document.getElementById("myPieChart");
  var myPieChart = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: labels,
      datasets: [{
        data: piechartPercentage,
        commits: data,
        issues: issues,
        resolved: resolved,
        additions: additions,
        deletions, deletions,
        backgroundColor: ['#4e5ddf', '#4e73df', '#1cc88a', '#36b9cc', '#36ccbb', '#5ecca7', '#35cc4e', '#6fcc35'],
        hoverBackgroundColor: ['#7a84de', '#2e59d9', '#17a673', '#2c9faf', '#5eccbf', '#87ccb5', '#72cc81', '#95cc72'],
        hoverBorderColor: "rgba(234, 236, 244, 1)",
      }],
    },
    options: {
      maintainAspectRatio: false,
      tooltips: {
        callbacks: {
          beforeBody: function(tooltipItem, data) {
            //console.log(data)
            contributor = labels[tooltipItem[0].index]
            share = data.datasets[0].data[tooltipItem[0].index]
            //contributor = labels[tooltipItem.index]
            //commits = data.datasets[0].data[tooltipItem.index]
            return contributor + " (" + share.toFixed(2) + "%)"
          },

          beforeLabel: function(tooltipItem, data) {
            commits = data.datasets[0].commits[tooltipItem.index]
            additions = data.datasets[0].additions[tooltipItem.index]
            deletions = data.datasets[0].deletions[tooltipItem.index]
            return "commits: " + commits + "(" + (100*commits/totalCommits).toFixed(2) + "%), " +
                  "additions: " + additions + "(" + (100*additions/totalAdditions).toFixed(2) + "%), " +
                  "deletions: " + deletions + "(" + (100*deletions/totalDeletions).toFixed(2) + "%), "
          },
          
          label: function(tooltipItem, data) {
            issues_resolved = data.datasets[0].issues[tooltipItem.index]
            average_time_resolved = data.datasets[0].resolved[tooltipItem.index]
            average_time_resolved = average_time_resolved /  8.64e+7
            issues_contribution = "dummy"
            return "issues resolved: " + issues_resolved + "(" + (100*issues_resolved/totalIssues).toFixed(2) + "%), " +
                    "average time to resolve issue: " + average_time_resolved.toFixed(2) + "d"
          }
        },
        backgroundColor: "rgb(255,255,255)",
        bodyFontColor: "#858796",
        titleFontColor: '##858796',
        borderColor: '#dddfeb',
        borderWidth: 1,
        xPadding: 10,
        yPadding: 15,
        displayColors: false,
        caretPadding: 10,
      },
      legend: {
        display: false
      },
      cutoutPercentage: 80,
    }});

    myPieChart.config.options.onClick = (event, array)=>{

      //console.log(event, array);
      if (array.length == 1){
        let index = array[0]._index;
        let arr = [];

        /*
        arr.push(data[index]);
        arr.push(issues[index]);
        //arr.push(resolved[index]);
        arr.push(radar.additions[index]);
        arr.push(radar.deletions[index]);
        */


        arr.push((100*data[index]/totalCommits).toFixed(2));
        arr.push((100*issues[index]/totalIssues).toFixed(2));
        //arr.push(resolved[index]);
        arr.push((100*radar.additions[index]/totalAdditions).toFixed(2));
        arr.push((100*radar.deletions[index]/totalDeletions).toFixed(2));

        //console.log(array[0]._model.backgroundColor);
        let color = colorHexToRgb(array[0]._model.backgroundColor);

        update_radar(labels[index], arr, piechartPercentage[index], color);
      }
    }
}

function colorHexToRgb(hex) {
  let num = parseInt(hex.slice(1), 16);

  let red = (num >> 16) & 255;
  let green = (num >> 8) & 255;
  let blue = num & 255;

  //console.log(red, green, blue)

  let rgbString = red + "," + green + "," + blue;
  return rgbString;
}

//function to make pie chart
function generate_table(data){

  var top = data.contributors, swap;

  for(let i = 0; i < top.length - 1; i++){
    for(let j = i + 1; j < top.length; j++){
      if(top[i]['total'] < top[j]['total']){
        swap = top[i];
        top[i] = top[j];
        top[j] = swap;
      }
    }
  }

  var table = document.createElement('table'), tr, th, td, row, cell, head;
  table.classList.add('all_table');

  var thead = document.createElement('thead');
  thead.classList.add('thead-dark');

  tr = document.createElement('tr');
  th = document.createElement('th');
  th.classList.add('login');
  tr.appendChild(th);
  th.innerHTML = "Login";

  th = document.createElement('th');
  th.classList.add('commit');
  tr.appendChild(th);
  th.innerHTML = "Commits";

  let week_work = [];

  for (head = top[0]['weeks'].length - 1; head >= 0; head--) {
    th = document.createElement('th');
    tr.appendChild(th);
    th.innerHTML = "Weeks " + (head + 1);

    for(let j = top.length - 1; j >=0 ; j--){
      sum += top[j]['weeks'][head]['a'] + top[j]['weeks'][head]['d'] + top[j]['weeks'][head]['c'];
    }
    week_work.unshift(sum);
    sum = 0;

  }

  thead.appendChild(tr);
  table.appendChild(thead);

  var tbody = document.createElement('tbody')

  for (row = 0; row < 7; row++) {
    tr = document.createElement('tr');
    td = document.createElement('td');
    td.classList.add('login');
    tr.appendChild(td);
    td.innerHTML = top[row]['author']['login'];

    td = document.createElement('td');
    td.classList.add('commit');
    tr.appendChild(td);
    td.innerHTML = top[row]['total'];

      for (cell = top[0]['weeks'].length - 1; cell >= 0; cell--) {
        td = document.createElement('td');
        tr.appendChild(td);

        var div = document.createElement('div');
        div.classList.add('bar');

        var div1 = document.createElement('div');
        div1.classList.add('stats');
        var div2 = document.createElement('div');
        div2.classList.add('stats')
        var div3 = document.createElement('div');
        div3.classList.add('stats')
        var div4 = document.createElement('div');
        div4.classList.add('bar', 'stats');

        var sum = week_work[cell];
        
        if(sum > 0){
          var diff = 0;

          if(top[row]['weeks'][cell]['a'] > 0){
            div1.innerHTML = '.';
            div1.setAttribute('style', 'background-color: #00ffff; color: #00ffff; width: ' + top[row]['weeks'][cell]['a']/sum * 100+ '%;');
            diff += top[row]['weeks'][cell]['a'];

            var span = document.createElement('span');
            span.classList.add('hover');
            span.innerHTML = 'add ' + top[row]['weeks'][cell]['a'] + ' lines';

            div1.appendChild(span)
          }

          if(top[row]['weeks'][cell]['d'] > 0){
            div2.innerHTML = '.';
            div2.setAttribute('style', 'background-color: #ff0000; color: #ff0000; width: ' + top[row]['weeks'][cell]['d']/sum * 100 + '%;');
            diff += top[row]['weeks'][cell]['d'];

            var span = document.createElement('span');
            span.classList.add('hover');
            span.innerHTML = 'del ' + top[row]['weeks'][cell]['d'] + ' lines';

            div2.appendChild(span)
          }

          if(top[row]['weeks'][cell]['c'] > 0){
            div3.innerHTML = '.';
            div3.setAttribute('style', 'background-color: #ffff00; color: #ffff00; width: ' + top[row]['weeks'][cell]['c']/sum * 100 + '%;');
            diff += top[row]['weeks'][cell]['c'];

            var span = document.createElement('span');
            span.classList.add('hover');
            span.innerHTML = 'commit ' + top[row]['weeks'][cell]['c'] + ' lines';

            div3.appendChild(span)
          }

          div4.innerHTML = '.';
          div4.setAttribute('style', 'width: ' + (1 - (diff/sum)) * 100 + '%;');
        }
        else{
          div.innerHTML = '.';
        }

        div.appendChild(div1);
        div.appendChild(div2);
        div.appendChild(div3);
        div.appendChild(div4);

        td.appendChild(div);
      }
      tbody.appendChild(tr);
  }

  table.appendChild(tbody);

  table.classList.add('table');
  table.classList.add('table-hover')
  table.setAttribute('id', 'tableStats');
  document.getElementById('table').appendChild(table);
}

function toPdf(){
  html2canvas(document.getElementById('repoStats'), {
        onrendered: function (canvas) {
            var data = canvas.toDataURL();
            var docDefinition = {
                content: [{
                    image: data,
                    width: 3200
                }],
                pageSize: 'A0',
                pageOrientation: 'landscape'
            };
            pdfMake.createPdf(docDefinition).download("Report.pdf");
        }
    });
}