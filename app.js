const express = require("express");
const ejs = require('ejs');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const { urlencoded } = require("body-parser");
const _ = require('lodash');
const { method } = require("lodash");

const app = express();
app.set('view engine', 'ejs')
app.use(bodyParser.urlencoded({extended: true}))
app.use(express.static('public'))

mongoose.connect("mongodb://0.0.0.0/wikiDB");
const articleSchema = new mongoose.Schema({
    title: String,
    content: String
})
const Article = mongoose.model('Article', articleSchema)


app.route('/articles')
.get(function (req, res) {

    Article.find({}, function (err, articles) {
        if(!err) {
            res.json(articles)
        } else {
            res.send(err)
        }
    })  
})
.post(function (req, res) {

    const article = new Article({
        title: _.lowerCase(req.body.title),
        content: req.body.content
    })
    article.save(function (err) {
        if(err) {
            res.send(err)
        } else {
            res.send("Posted new item to the DB.")
        }
    })
})
.delete(function (req, res) {
    Article.deleteMany({}, function (err) {
        if (!err) {
            res.send("Successfully deleted every thing in the DB 🌚.")
        } else {
            res.send(err)
        } 
    })
});

app.route('/articles/:title')
.get(function (req, res) {
    
    Article.findOne({title: _.lowerCase(req.params.title)}, function (err, article) {
        if(!err) {
            if(article) {
                res.send(article)
            } else {
                res.send("Cannot find any article with that name.")
            }
        } else {
            res.send(err)
        }
    })
})
.put(function(req, res) {
    Article.findOneAndReplace(
        {title: _.lowerCase(req.params.title)}, 
        {title: req.body.title, content: req.body.content},
        {new: true},
        function (err, result) {
        if(err) {
            res.send(err)
        } else {
            res.send(result)
        }
    })

})
.patch(function (req, res) {
    Article.updateOne(
        {title: req.params.title},
        {$set: req.body},
        function (err) {
            if (!err) {
                res.send("Successfully updated article.")
            } else {
                res.send(err)
            }
        })
})
.delete(function (req, res) {
    Article.findOneAndDelete({title: req.params.title}, function (err, article) {
        if(!err) {
            if(!article) {
                res.send("No article matching this title is found🌚.")
            }  
            else {
                res.send("Successfully deleted article from DB.")
            }
        } else {
            res.send(err)
        }
    })
});



app.listen("3000", function () {
    console.log("Server is running on port 3000")
});