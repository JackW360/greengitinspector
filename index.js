//file for testing basic requests to github rest api

//import Octokit from '@octokit/rest';
const Octokit = require('@octokit/rest');
const express = require('express');
const superagent = require('superagent');
const app = express();
require('dotenv').config();

const port = 3000 || process.env.PORT;

app.listen(port, ()=>{
  console.log('listening at port ' + port)
});

app.use(express.static('WebContent/index'))

// auth will change if registering app as github app
const octokit = Octokit({
  auth: process.env.AUTH,
  userAgent: 'GreenGitInspector v1.0.0',
  baseUrl: 'https://api.github.com'
})

//routing
app.get('/search', (request, response, next) =>{
  //console.log(request);
  //this will include retrieving all of the necessary info from github api

  //console.log(request);
  let body = {};

  //retrieving info about the team members/contributors
  octokit.repos.listContributors(request['query'])
    .then(results =>{

      let contributors = []
      for (let i = 0; i < results['data'].length; i++){
          contributors.push({
              login: results['data'][i]['login'],
              id: results['data'][i]['id'],
              contributions: results['data'][i]['contributions']
          });
      };

      body['contributors'] = contributors;
      //console.log(contributors);
      console.log(body);
      response.send(body);
    })
  
  //response.send(JSON.stringify(body));
  //response.send(body);
  
});

app.use(express.static('WebContent/index'))

/*
app.get('/callback', (request, response) =>{

  const code = request['query']['code'];
  console.log(code);

  if (!code){
    return response.send({
      success: false,
      message: 'There was no code!'
    })
  }
  superagent
    .post('https://github.com/login/oauth/access_token')
    .send({ 
      client_id: process.env.CLIENT_ID,
      client_secret: process.env.CLIENT_SECRET,
      code: code,
      redirect_uri: 'http://localhost:3000'
    })
    .set('accept', 'application/json')
    .end((err, res) => {
      //console.log(response)
      // Calling the end function will send the request
      //console.log(res);
      const data = res.body;

      console.log('data', data);
      response.send();
  });
})
*/

/*
octokit.paginate('GET /repos/:owner/:repo/commits', { owner: 'octokit', repo: 'rest.js'})
  .then(stuff => {

  //console.log(stuff)

  let i;
  for (i = 0; i < stuff.length; i++) {
    console.log(stuff[i]['commit']['author']['date'] + ' by ' + stuff[i]['commit']['author']['name'])
  }

  })
  */
/*
octokit.paginate('GET /repos/:owner/:repo/commits', { owner: 'octokit', repo: 'rest.js'})
  .then(stuff => {

    //console.log(stuff[0])
    //get tree of first commit object
    
    var sha = stuff[1]['commit']['tree']['sha']
    console.log(sha)
    octokit.request('GET /repos/:owner/:repo/git/trees/:tree_sha', { owner: 'octokit', repo: 'rest.js', tree_sha: sha})
      .then(stuff2 =>{
        console.log(stuff2['data']['tree'])
      })
    
  })
*/

/*
function get_url_info(url){

    let base_url = url.slice(0, 19);
    //console.log(base_url)

    let info = url.slice(19);
    //console.log(info)

    let owner = info.split("/")[0];
    let repo = info.split("/")[1];

    //check url is same as github.com ....
    if ((base_url != 'https://github.com/') || (info.split("/").length != 2)){
        return null
    }

    return {
        repo: repo,
        owner: owner
    }
}


function list_members(data){
    //data must include the repo and owner
    octokit.repos.listContributors(data)
        .then(results =>{

            let contributors = []
            for (let i = 0; i < results['data'].length; i++){
                contributors.push({
                    login: results['data'][i]['login'],
                    id: results['data'][i]['id'],
                    contributions: results['data'][i]['contributions']
                })
            }

            //console.log(contributors)
            return contributors
        })
}

*/
//list_members(get_url_info('https://github.com/tensorflow/tensorflow'))