var path = require('path')
var qs = require('querystring')
var express = require('express');
var session = require('express-session');
var request = require('request');
var app = express();

// 设置模板目录
app.set('views', path.join(__dirname, 'view'));
// 设置模板引擎为 ejs
app.set('view engine', 'ejs');
app.use(express.static('static'));

// session 中间件
app.use(session({
  secret: 'test',  // 通过设置 secret 来计算 hash 值并放在 cookie 中，使产生的 signedCookie 防篡改
  resave: true, // 强制更新 session
  saveUninitialized: false, // 设置为 false，强制创建一个 session，即使用户未登录
}));

// 设置模板全局常量
app.locals.page = {
  title: 'github 接口测试',
  description: '学习测试'
};
// 添加模板必需的三个变量
app.use(function (req, res, next) {
  res.locals.user = req.session.user
  next();
});

// code => token => userInfo 的过程
function getUserInfo (code) {
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

// 你申请 github 应用的 ID(your github app's Client ID)
var client_id = 'XXXXXXXXXXX'
// 你申请 github 应用的 secret(your github app's Client Secret)
var client_secret = 'XXXXXXXXXXXXXXXXXX'
var token = ''

app.get('/', (req, res) => {
  res.render('index');
})

app.get('/login', (req, res) => {
  res.redirect(`https://github.com/login/oauth/authorize?client_id=${client_id}`)
})

// 你申请 github 应用的授权回调地址(Authorization callback URL)
app.get('/github/oauth', (req, res) => {
  getUserInfo(req.query.code).then((userInfo) => {
    req.session.user = {
      name: userInfo.login,
      avatar: userInfo.avatar_url,
      user_id: userInfo.id
    }
    res.redirect('/')
  })
})

// 创建你申请 github 应用的主页 URL 服务(Homepage URL)
var server = app.listen(3000, (req, res) => {
  let address = server.address();
  console.log(`服务已启动，端口号为: ${address.port}`);
})
