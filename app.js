const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const jwt = require("jsonwebtoken");
const bcrypt = require('bcryptjs');
const config = require('config');


// db connecsion

// mongo compass
// mongoose.connect('mongodb://localhost/grocery_list', { useNewUrlParser: true, useUnifiedTopology: true }).then(() => console.log('MongoDB is running'));

// mongo atlas
mongoose.connect(`mongodb+srv://raphael:${config.get("dbPass")}@cluster0.i22n5.mongodb.net/mykolet`, { useNewUrlParser: true, useUnifiedTopology: true }).then(() => console.log('MongoDB is running'));



// valid token
const authToken = require("./authToken");

// // models
const { User, Product, List, Item } = require("./models");
const { date } = require('joi');


const app = express();

app.use(cors());

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());


// routing

// users
app.get('/users' , (req,res) => {
    User.find({})   
      .then(data => {
        console.log(data);
        res.json(data)
      })
      .catch(err => {
        res.status(400).json(err)
      })
   
});

app.post('/login', (req,res) => {
    var my_username = req.body.username;
    var my_password = req.body.password;

    var user = User.findOne({ username: my_username }, function(err,result) { // Is username exists?
        if (result) {
            bcrypt.compare(my_password, result.password, function(err, passres) { // If yes, check password
                if (passres) { // If password correct generate token
                    var token = jwt.sign({id: result._id}, 'hash-brownie', {
                        expiresIn: 43200
                    });
                    
                    const logged_info = {
                        token: token,
                        user_info: result
                    }

                    res.json({status: 200, user_info: logged_info});
                } else { // if password INCORRECT return 401
                    res.json({status: 401});
                }
            });
        } else { // If username not exists - Send Status 400
            res.json({status: 400});
        }
    });
});

app.post('/register', (req,res) => {
    //console.log(req.body);

    bcrypt.genSalt(10, function(err, salt) {
        bcrypt.hash(req.body.password, salt, function(err, hash) {
            var user = new User({
                username: req.body.username,
                email: req.body.email,
                phone: req.body.phone,
                password: hash,
            });
        
            user.save().then( (result) => {
                //console.log(result);
                res.send(result)
            }).catch((err) => {
                res.send(400)
            });
        
        });
    });
});


// products
app.get('/products' , (req,res) => {
    Product.find({})   
      .then(data => {
        console.log(data);
        res.json(data)
      })
      .catch(err => {
        res.status(400).json(err)
      })
   
});

app.get('/search' , (req,res) => {
    // var  item_titel = req.query.item_titel;
    // Product.find({ItemName: item_titel})   
    Product.find({}, { ItemName: 1 , _id:1})   
      .then(data => {
        console.log(data);
        res.json(data)
      })
      .catch(err => {
        res.status(400).json(err)
      })
   
});

// lists
app.get('/lists' , (req,res) => {
    List.find({})   
      .then(data => {
        console.log(data);
        res.json(data)
      })
      .catch(err => {
        res.status(400).json(err)
      })
   
});

app.get('/singelLists' , (req,res) => {
    var list_id = req.query.list_id;  
    List.find({_id: list_id })   
      .then(data => {
        console.log(data);
        res.json(data)
      })
      .catch(err => {
        res.status(400).json(err)
      })
   
});

app.post('/addProdToLlist', (req,res) => {
   
    console.log(req.body);
  
    var list_id = req.body.list_id;  
    // var item = req.body.item;
    
    item ={  
        pid: req.body.pid,    
        isChecked: req.body.isChecked,
        title:  req.body.title,
        quantity:  req.body.quantity        
    };

    List.updateMany({_id: list_id},{$push:{items: item}}).then((result) => {
        console.log(result);
    });

    res.send(200);
         
});

app.post('/delete_prod', (req,res) => {
    var list_id = req.body.list_id;  
    // var pid = req.body.pid
    console.log(req.body);

    List.update({ _id: list_id }, { $pull: { items: { title: req.body.title } } })
    .then(data => {
        console.log(data);
        res.json(data)
      })
      .catch(err => {
        res.status(400).json(err)
      })
});

app.post('/updateToogleCheck', (req,res) => {
    let list_id = req.body.list_id;  
    // var pid = req.body.pid
    let isChecked = req.body.isChecked
    let title = req.body.title
   
    
    console.log(req.body);

    List.update({ '_id': list_id , 'items': { '$elemMatch': { 'title': title }} }, { '$set': { 'items.$.isChecked': isChecked } })
    .then(data => {
        console.log(data);
      
      })
      .catch(err => {
        res.status(400).json(err)
      })
});

app.post('/updateQuantity', (req,res) => {
    let list_id = req.body.list_id;  
    // var pid = req.body.pid   
    let title = req.body.title;
    let quantity = req.body.quantity;
   
    
    console.log(req.body);

    List.update({ '_id': list_id , 'items': { '$elemMatch': { 'title': title }} }, { '$set': { 'items.$.quantity': quantity } })
    .then(data => {
        console.log(data);
      
      })
      .catch(err => {
        res.status(400).json(err)
      })
});

app.get('/userLists', (req,res) => {
    var user_id = req.query.user_id;
    List.find({ user_id: user_id }, function(err,result) {
        res.json({lists: result});
    });
});


app.post('/new_list', (req,res) => {

        let date_ob = new Date();
        let date = ("0" + date_ob.getDate()).slice(-2);
        let month = ("0" + (date_ob.getMonth() + 1)).slice(-2);
        let year = date_ob.getFullYear();    
        let now = year + "-" + month + "-" + date;
       
    var list = new List({
        title: req.body.title,
        date: now,
        items: [],
        user_id: req.body.user_id
    });

    list.save().then( (result) => {
        console.log(result);
        res.send(result)
    }).catch((err) => {      
        res.send(400)
    });
});

app.post('/delete_list', (req,res) => {
    var list_id = req.body.list_id;
    console.log(req.body);
    List.deleteOne({_id: list_id}).then((result) => {
        console.log(result);
    });

    res.send(200);
});



const port = process.env.PORT || 4000;
app.listen(port, function() {
    console.log('Server is running with port ' + port);
});