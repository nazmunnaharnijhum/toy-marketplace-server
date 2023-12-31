const express = require('express');
const cors = require('cors');
// const jwt = require('jsonwebtoken');
require('dotenv').config()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
// require('dotenv').config()
const app = express();
const port = process.env.PORT || 5000;

//middleware
app.use(cors());
app.use(express.json());

console.log(process.env.DB_PASS)



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.8bejocb.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
// const client = new MongoClient(uri, {
//   serverApi: {
//     version: ServerApiVersion.v1,
//     strict: true,
//     deprecationErrors: true,
//   }
// });
const client = new MongoClient(
	uri,
	{ useUnifiedTopology: true },
	{ useNewUrlParser: true },
	{ connectTimeoutMS: 30000 },
	{ keepAlive: 1 }
);

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
  
const db = client.db('toyMarketplace')
    const toyCollection = db.collection('toys');

    

    app.get('/toySearchByTitle/:text',async(req, res) => {
     
      const indexKeys = {name: 1};
      const indexOptions = {name: "title"};
      const searchText = req.params.text;
      const result2 = await toyCollection.createIndex(indexKeys, indexOptions);
      const result = await toyCollection.find({ name: { $regex: searchText, $options: "i"}}).toArray()

      res.send(result);
    })

    app.post("/postJob", async(req, res) => {
      const body = req.body;
      const result = await toyCollection.insertOne(body);
      
      console.log(result);
      res.send(result);
    })

    app.get('/toys', async(req, res) =>{
        const cursor = await toyCollection.find().limit(20).toArray();
     
        res.send(cursor);
    })

    app.get('/toys/:id', async(req, res) => {
        const id = req.params.id;
        const query = { _id: new ObjectId(id) };
        const result = await toyCollection.findOne(query);
        res.send(result);
    })
   

    app.get('/myToys/:email', async(req, res) => {
      console.log(req.params.id);
      const result = await toyCollection.find({sellerEmail: req.params.email}).sort({price: -1}).toArray();
      res.send(result);
    })



    // app.get("/toys/:category", async( req, res) => {
    //   console.log(req.params.category);
    //   if(req.params.category=="avenger"||req.params.category=="dc"||req.params.category=="transformer"){
    //     const result = await toyCollection.find({subCategory: req.params.category}).toArray();
    //     console.log(result);
    //     return res.send(result);
    //   }

    //   const result = await toyCollection.find({}).toArray();
    //   res.send(result);
    // })

    app.get("/toys/:category", async (req, res) => {
			const category = req.params.category;
			console.log(category);

			if (
				category == "avenger" ||
				category == "dc" ||
				category == "transformer"
			) {
				const result = await toyCollection
					.find({subCategory: category }).toArray();
				console.log(result);
				return res.send(result);
			}
			const result = await toyCollection
				.find({})

				.toArray();
			res.send(result);
		});
		


    // app.get('/myToys/:email/:id', async(req, res) => {
    //   const id = req.params.id;
    //   const query = {_id: new ObjectId(id)}
    //   const result = await toyCollection.findOne(query);
    //   res.send(result);
    // })

    // app.patch('/myToys/:id', async(req, res) => {
    //   const id = req.params.id;
    //   const filter = {_id: new ObjectId(id)};
    //   const updatedMyToys = req.body;
    //   console.log(updatedMyToys);
    //   const updateDoc = {
    //     $set: {
    //       status: 
    //     }
    //   }

    // })

    app.put("/updateToy/:id", async (req, res) => {
      const id = req.params.id;
      const body = req.body;
      console.log(body);
      const filter = { _id: new ObjectId(id) };
      const updateDoc = {
        $set: {
          price: body.price,
          quantity: body.quantity,
          details: body.details,
        },
      };
      const result = await toyCollection.updateOne(filter, updateDoc);
      res.send(result);
    });

    app.delete('/myToys/:id', async(req, res) => {
      const id = req.params.id;
      const query = {_id: new ObjectId(id)}
      const result = await toyCollection.deleteOne(query);
      res.send(result);
    })

    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('marketplace is running')
})

app.listen(port, () => {
    console.log(`marketplace server is running on port ${port}`)
})