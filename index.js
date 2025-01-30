const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Root route
app.get('/', (req, res) => {
  res.send('Hello World!');
});

// MongoDB configuration
const uri = "mongodb+srv://mern-book-store:sanjaiy2006@cluster0.dmkqw.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

// Asynchronous function to connect to MongoDB
async function connectToMongoDB() {
  try {
    await client.connect();
    const bookCollection = client.db("BookInventory").collection("books");

    //insert a book to the db : post method
    app.post("/upload-book",async(req,res)=>{
      const data = req.body;
      const result = await bookCollection.insertOne(data);
      res.send(result);
    })

    //get all books from the databse
    // app.get("/all-books",async(req,res) => {
    //   const books = bookCollection.find();
    //   const result = await books.toArray();
    //   res.send(result);
    // })

    //update book data: patch or update methods
    app.patch("/book/:id",async(req,res) => {
      const id = req.params.id;
      //console.log(id);
      const updateBookData = req.body;
      const filter = {_id : new ObjectId(id)};
      const options = {upsert : true};

      const updateDoc = {
        $set: {
          ...updateBookData
        }
      }

      //update
      const result = await bookCollection.updateOne(filter,updateDoc,options);

    })

    //delete a book data 
    app.delete("/book/:id",async(req,res) => {
      const id  =req.params.id;
      const filter = {_id : new ObjectId(id)};
      const result = await bookCollection.deleteOne(filter);
      res.send(result);
    }) 

    //find category
    app.get("/all-books",async(req,res) => {
      let query = {};
      if(req.query?.category){
        query = {category : req.query.category};
      }
      const result = await bookCollection.find(query).toArray();
      res.send(result);
    })

    //to get single book data
    app.get("/book/:id",async(req,res) => {
      const id = req.params.id;
      const filter = {_id: new ObjectId(id)};
      const result = await bookCollection.findOne(filter);
      res.send(result);
    })

    await client.db("admin").command({ ping: 1 });
    console.log("Connected to MongoDB successfully!");
  } catch (error) {
    console.error("Failed to connect to MongoDB:", error.message);
    process.exit(1); // Exit the process with failure
  }
}

// Call the MongoDB connection function
connectToMongoDB();

// Define the port
const port = process.env.PORT || 5000;

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
