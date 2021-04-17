const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs-extra');
const fileUpload = require('express-fileupload');
const MongoClient = require('mongodb').MongoClient;
require('dotenv').config()

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.0hcik.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;

console.log(process.env.DB_NAME);

const app = express();

app.use(bodyParser.json());
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
  
  app.post("/service", (req, res) => {
      const file = req.files.file;
      const name = req.body.name;
      const textarea = req.body.textarea;
      const price = req.body.price;

      // const filePath = `${__dirname}/service/${file.name}`;
        // file.mv(filePath, err => {
        //     if(err) {
        //         res.status(500).send({msg: 'Failed to upload Image'})
        //     }
            const newImg = file.data;
            const encImg = newImg.toString('base64');

            var image = {
              contentType: file.mimetype,
              size: file.size,
              img: Buffer.from(encImg, 'base64')
            }
            serviceCollection.insertOne({name, textarea, price, image})
            .then((result) =>{
                // fs.remove(filePath, error => {
                //   if(error) { res.status(500).send({msg: 'Failed to upload Image'})}
                  res.send(result.insertedCount > 0);
                // })
            })
        // })
  })
  app.get("/service", (req, res) => {
    serviceCollection.find({})
    .toArray((err, documents) => {
      res.send(documents);
    });
  });


  app.post('/addReview', (req, res) => {
    const file = req.files.file;
    const name = req.body.name;
    const title = req.body.title;
    const textarea = req.body.textarea;
    // const filePath = `${__dirname}/review/${file.name}`;


    // file.mv(filePath, err => {
    //   if (err) {
    //     res.status(500).send({msg: 'Failed to upload Image'})
    //   }
      const newImg = file.data;
      const encImg = newImg.toString('base64');

      var image = {
        contentType: file.mimetype,
        size: file.size,
        img: Buffer.from(encImg, 'base64')
      }

      reviewCollection.insertOne({name, title, textarea, image})
      .then(result => {
        // fs.remove(filePath, error => {
        //   if(error) {
        //     res.status(500).send({msg: 'Failed to upload Image'})
        //   }
          res.send(result.insertedCount > 0)
        // })
        
      })
    // })
    
  })

  app.get("/review", (req, res) => {
    reviewCollection.find({}).toArray((err, documents) => {
      console.log(err);
      res.send(documents);
    });
  });
  

});



app.listen(process.env.PORT || port)