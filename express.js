var express = require('express');
var app = express();
var router = express.Router();
var cookieParser = require('cookie-parser');
var fs = require('fs');
var bodyParser = require('body-parser');
var multer = require('multer');
var upload = multer();
var authors = '';
var post = '';
var post_2 = '';

Date.prototype.toIsoString = function(){
    var t = -this.getTimezoneOffset(),
        G = t >= 0 ? '+' : '-',
        pad = function(number){
            var norm = Math.abs(Math.floor(number));
            return (norm < 10 ? '0' : '') + norm;
        };
    return this.getFullYear() +
        '-' + pad(this.getMonth() + 1) +
        '-' + pad(this.getDate()) +
        'T' + pad(this.getHours()) +
        ':' + pad(this.getMinutes()) +
        ':' + pad(this.getSeconds()) +
        G + pad(t / 60) +
        ':' + pad(t % 60);
}

var date = new Date();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

fs.readFile('Author.js', function(err, data){
    if(err) throw err;
        authors = JSON.parse(data);
});

fs.readFile('Post.js', function(err, data){
    if(err) throw err;
        post = JSON.parse(data);
});

fs.readFile('Post.js', function(err, data){
    if(err) throw err;
        post_2 = JSON.parse(data);
});

router.get('/', function(req, res){
    if(req.cookies.login == 'ok')
        res.status(200).json(authors);
    else
        res.json({message:"請登入"});
});

app.route('/login')

    .post(upload.array(), function(req, res, next){
        if(req.body.username == 'test1' && req.body.password == 'test123'){
            var user = req.body.username;
            res.cookie('password', req.body.password);
            res.cookie('username', user);
            res.cookie('login', 'ok');
            for(var i =0; i < authors.length; i++){
                if(user == authors[i].username)
                    res.status(200).json(authors[i]);
            }
        }
        else
            res.json({message:"帳號或密碼錯誤"});
    })

    .get(function(req, res){
        if(req.cookies.login == 'ok'){
            var user = req.cookies.username;
            for(var i =0; i < authors.length; i++){
                if(user == authors[i].username)
                    res.status(200).json(authors[i]);
            }
        }
        else
            res.status(200).json('請登入');
    });

router.get('/authors', function(req, res){
    if(req.cookies.login == 'ok')
        res.status(200).json(authors);
    else
        res.json({message:"請登入"});
});

app.route('/authors/:id')
    
    .get(function(req, res){
        var user_id = req.params.id;
        if(req.cookies.login == 'ok'){
            for(var i = 0; i < authors.length; i++){
                if(user_id == authors[i].username)
                    res.status(200).json(authors[i]);
            }
        }
        else
            res.status(200).json('請登入');
    })

    .patch(upload.array(), function(req, res, next){
        var user_id = req.params.id;
        var password = req.body.password;
        if(req.cookies.login == 'ok' && req.cookies.password == password){
            for(var i = 0; i < authors.length; i++){
                if(user_id == authors[i].username){
                    authors[i].name = req.body.name;
                    authors[i].gender = req.body.gender;
                    authors[i].address = req.body.address;
                    res.status(200).json(authors[i])
                    fs.writeFile('Author.js', JSON.stringify(authors, null, 4), 'utf-8'), function(err){
                        if(err){
                            return console.error(error);
                        }
                    }
                }
            }
        }
        else
            res.status(200).json('請登入');
    });

app.route('/posts')

    .get(function(req, res){
        if(req.cookies.login == 'ok')
            res.status(200).json(post);
        else
            res.json({message:"請登入"});
    })

    .post(upload.array(), function(req, res, next){
        var i = post.length - 1;
            i = post[i].id;
            j = post.length;
        var user_id = req.cookies.username;
        if(req.cookies.login == 'ok'){
            post_2[0].id = i + 1;
            post_2[0].title = req.body.title;
            post_2[0].content = req.body.content;
            post_2[0].created_at = date.toIsoString();
            post_2[0].updated_at = date.toIsoString();
            for(var k = 0; k < authors.length; k++){
                if(user_id == authors[k].username)
                    post_2[0].authors = authors[k];
            }
            post_2[0].tags = req.body.tags;
            post.push(post_2[0]);
            fs.writeFile('Post.js', JSON.stringify(post, null, 4), 'utf-8', function(err){
                if(err)
                    return console.error(error);
            res.status(201).json(post[j]);
            });
        }
        else
            res.status(200).json('請登入');
    });

app.route('/posts/:id')

    .get(function(req, res){
        var post_id = req.body.id;
        if(req.cookies.login == 'ok'){
            for(var i = 0; i < post.length; i++){
                if(post_id == post[i].id)
                    res.status(200).json(post[i]);
            }
        }
    })

    .delete(upload.array(), function(req, res, next){
        var post_id = req.body.id;
        if(req.cookies.login == 'ok'){
            for(var i = 1; i < post.length; i++){
                if(post_id == post[i].id){
                    post.splice(i, 1);
                    console.log(post);
                }
            }
            fs.writeFile('Post.js', JSON.stringify(post, null, 4), 'utf-8', function(err){
                if(err)
                    return console.error(error);
            res.status(200).json(post[j]);
            });
        }
        else
            res.status(200).json('請登入');
    })
    
    .patch(upload.array(), function(req, res, next){
        var post_id = req.params.id;
        if(req.cookies.login == 'ok'){
            for(var i = 0; i < post.length; i++){
                if(post_id == post[i].id){
                    post[i].title = req.body.title;
                    post[i].contene = req.body.content;
                    post[i].updated_at = date.toIsoString();
                    post[i].tags = req.body.tags;
                    res.status(200).json(post[i]);
                    fs.writeFile('Post.js', JSON.stringify(post, null, 4), 'utf-8', function(err){
                        if(err)
                            return console.error(error);
                    });
                }
            }
        }
        else
            res.status(200).json('請登入');
    });

    



app.use('/', router);

app.listen(3000, function(){
    console.log('Listening on port 3000');
});