const express = require('express');
const bodyParser = require('body-parser');



const cors = require('cors');
const fs = require('fs-extra');
const fileUpload = require('express-fileupload');
const MongoClient = require('mongodb').MongoClient;
const ObjectID = require('mongodb').ObjectID
require('dotenv').config()

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.0hcik.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;


const app = express();

app.use(bodyParser.json({limit: "50mb"}));
app.use(bodyParser.urlencoded({limit: "50mb", extended: true, parameterLimit:50000}));
app.use (cors());
app.use(express.static('service'))
app.use(express.static('review'))
app.use(fileUpload());

const port = 5000;



app.get('/', (req, res) =>{
    res.send("Hello from db it's working working")
})


const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
  const serviceCollection = client.db("landryServer").collection("service");
  const reviewCollection = client.db("landryServer").collection("review");
  const ordersCollection = client.db("landryServer").collection("orders");
  const adminCollection = client.db("landryServer").collection("admin");
  
  app.post("/service", (req, res) => {
      const file = req.files.file;
      const name = req.body.name;
      const textarea = req.body.textarea;
      const price = req.body.price;

            const newImg = file.data;
            const encImg = newImg.toString('base64');

            var image = {
              contentType: file.mimetype,
              size: file.size,
              img: Buffer.from(encImg, 'base64')
            }
            serviceCollection.insertOne({name, textarea, price, image})
            .then((result) =>{
                  res.send(result.insertedCount > 0);
 
            })
  })
  app.get("/service", (req, res) => {
    serviceCollection.find({})
    .toArray((err, documents) => {
      res.send(documents);
    });
  });

  app.delete('/delete/:id', (req, res) => {
    const id = ObjectID(req.params.id);
    serviceCollection.findOneAndDelete({_id: id})
    .then((result) => {
        res.send(!!result.value)
    })
  })

  app.get('/singleService/:id', (req, res) => {
    const id = ObjectID(req.params.id);
    serviceCollection.find({_id: id})
    .toArray((err, items) => {
      res.send(items);
    })
  })

  app.post('/addBooking', (req, res) => {
    const order = req.body;
    ordersCollection.insertOne(order)
    .then(result => {
        res.send(result.insertedCount > 0);
    })
})

  app.post('/admin', (req, res) => {
    const order = req.body;
    adminCollection.insertOne(order)
    .then(result => {
      console.log(result);
        res.send(result.insertedCount > 0);
    })
})
app.post('/isAdmin', (req, res) => {
  const email = req.body.email;
  console.log(email)
  adminCollection.find({ email: email})
    .toArray((err, items) => {
      res.send(items.length > 0);
    })
})

  app.get('/orders', (req, res) => {
    ordersCollection.find()
    .toArray((err, items) => {
      res.send(items)
    })
  })

  app.get('/booking', (req, res) => {
    ordersCollection.find({email: req.query.email})
    .toArray((err, items) => {
      res.send(items)
    })
  })

  app.post('/addReview', (req, res) => {
    const file = req.files.file;
    const name = req.body.name;
    const title = req.body.title;
    const textarea = req.body.textarea;

      const newImg = file.data;
      const encImg = newImg.toString('base64');

      var image = {
        contentType: file.mimetype,
        size: file.size,
        img: Buffer.from(encImg, 'base64')
      }

      reviewCollection.insertOne({name, title, textarea, image})
      .then(result => {
          res.send(result.insertedCount > 0)
  
      })
  })

  app.get("/review", (req, res) => {
    reviewCollection.find({}).toArray((err, documents) => {
      res.send(documents);
    });
  });
  

});



app.listen(process.env.PORT || port)