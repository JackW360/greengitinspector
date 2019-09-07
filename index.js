//file for testing basic requests to github rest api

//import Octokit from '@octokit/rest';
const Octokit = require('@octokit/rest')

require('dotenv').config()


// auth will change if registering app as github app
const octokit = Octokit({
    //auth: process.env.AUTH,
    userAgent: 'myApp v1.2.3',
    baseUrl: 'https://api.github.com'
})


octokit.request('GET https://github.com/login/oauth/authorize', {client_id: process.env.CLIENT_ID})
  .then(results =>{
    console.log(results)
    
  })



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


//list_members(get_url_info('https://github.com/tensorflow/tensorflow'))