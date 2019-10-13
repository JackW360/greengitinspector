//import Octokit from '@octokit/rest';
const Octokit = require('@octokit/rest');
require('dotenv').config();


module.exports = async function (request_data, accessKey) {

    // auth will change if registering app as github app
    //when proper authentication is added, the octokit object can be passed as a parameter from index.js
    const octokit = Octokit({
        auth: accessKey,
        userAgent: 'GreenGitInspector v1.0.0',
        baseUrl: 'https://api.github.com'
      })

    //this will request basics stats for LOC per week for each contributor
  
    let stats_results = await octokit.paginate('GET /repos/:owner/:repo/stats/contributors', request_data).catch();
  
    //console.log(stats_results)

    //getting rid of some uneccesary info

    let body = {
        contributors: [],
        issues: {}
    };

    //temporary variables to store useful info about the events
    let issues_resolved_per_person = {};
    let times_to_resolve = {};
  
    for(let i=0; i<stats_results.length; i++){
    body.contributors.push({
        author : {
        login: stats_results[i]['author']['login'],
        id: stats_results[i]['author']['id']
        },
        total: stats_results[i]['total'],
        weeks: stats_results[i]['weeks'],
        issues_resolved: 0,
        average_resolve: null
        //issues...
    });
    };
  
    const options = {
        repo: request_data.repo,
        owner: request_data.owner,
        state: 'all',
        since: "2019-09-01T00:00:00Z"
    };

    //gets all the issues within a certain time period
    let issues_results = await octokit.paginate('GET /repos/:owner/:repo/issues', options).catch();

    for(let i=0; i<issues_results.length; i++){
        //gather the info for the start and end dates and who created the issue
        const issue_number = issues_results[i].number;

        body.issues[issue_number] = {
            number: issues_results[i].number,
            title: issues_results[i].title,
            body: issues_results[i].body,
            created_by: issues_results[i].user.login,
            created_on: issues_results[i].created_at,
            closed_by: null,
            closed_on: issues_results[i].closed_at
        }

        //if the issue has been closed, check the issue info to see who it was closed by
        if (issues_results[i].state == "closed"){
            const issue_url = 'GET /repos/:owner/:repo/issues/' + issue_number;

            //setTimeout(()=>{}, 10000); this can be added to help with the rate limit if we need
            console.log(issue_number);
            let issue = await octokit.paginate(issue_url, request_data).catch();

            const person = issue[0].closed_by.login;
            body.issues[issue_number].closed_by = person;

            //calculating stats for no. issues resolved and average time
            //no. issues resolved
            if (issues_resolved_per_person[person] != null){
                issues_resolved_per_person[person] = issues_resolved_per_person[person] + 1;
            }
            else{
                issues_resolved_per_person[person] = 1;
            }

            //calculating the time it takes to resolve each issue
            const created = issue[0].created_at;
            const closed = issue[0].closed_at;

            if (times_to_resolve[person] != null){
                times_to_resolve[person].push(date_difference(created, closed))
            }
            else{
                times_to_resolve[person] = [date_difference(created, closed)];
            }
        }
    }

    //rewriting the issue info into the actual data object
    const keys = Object.keys(issues_resolved_per_person);
    for (const key of keys){
    for(let i=0; i< body.contributors.length; i++){
        //console.log(body[i].author.login + ', key is: ' + key);
        if (body.contributors[i].author.login == key){
            //console.log('here')
            body.contributors[i].issues_resolved = issues_resolved_per_person[key];
            body.contributors[i].average_resolve = avg(times_to_resolve[key]);
        }
    }
    }

    //console.log(body);
    return body;

 }

//function to calculate the difference between two dates in milliseconds
 function date_difference(created, closed){
    let date1 = new Date(created);
    let date2 = new Date(closed);

    //calculate difference in milliseconds
    const diff = date2.getTime() - date1.getTime()

    return diff;
 }

//function to calculate the average of an array
 function avg(array){
     let sum = 0;
     for(let i=0; i<array.length; i++){
         sum += array[i];
     }
     return sum/array.length;
 }

 /*

body looks like this:

body = {
    contributors: [
        {
            author:{
                id: int
                login: string
            }
            total: int
            weeks: [...]
            issues_resolved: int
            average_resolve: int (number of milliseconds)
        }
    ]
    issues: {
        issue_id (the actual id of the issue) :{
            number: int
            title: string
            body: string
            created_by: string (login of author)
            created_on: timestamp (use date class to access)
            closed_by: either string or null
            closed_on: either timestamp or null
        }
    }
}
 */