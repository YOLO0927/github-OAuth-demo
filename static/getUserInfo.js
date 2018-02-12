module.exports = (code) => {
  return new Promise((resolve, reject) => {
    request.get({
      url: `https://github.com/login/oauth/access_token?client_id=${client_id}&client_secret=${client_secret}&code=${code}`,
    }, (err, res, body) => {
      token = qs.parse(body).access_token
      resolve(token)
    })
  }).then((token) => {
    console.log(token)
    return new Promise((resolve, reject) => {
      request.get({
        url: `https://api.github.com/user?access_token=${token}`,
        headers: {
          'User-Agent': 'Awesome-Octocat-App'
        }
      }, (err, res, body) => {
        resolve(JSON.parse(body))
      })
    })
  })
}
