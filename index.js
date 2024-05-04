require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 3000;
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.USER}:${process.env.PASS}@cluster0.zrua0aj.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    const serviceCollection = client.db('phCarDoctors').collection('Services');
    const bookingsCollection = client.db('phCarDoctors').collection('Bookings');
    app.get('/api/services', async (req, res) => {
      const cursor = serviceCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });
    app.get('/api/services/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const options = {
        projection: { service_id: 1, title: 1, price: 1, img: 1 },
      };
      const result = await serviceCollection.findOne(query, options);
      res.send(result);
    });
    app.get('/api/bookings/', async (req, res) => {
      console.log(req.query.email);
      let query = {};
      if (req.query?.email) {
        query = { email: req.query.email };
      }
      const cursor = bookingsCollection.find(query);
      const result = await cursor.toArray();
      res.send(result);
    });
    app.post('/api/bookings/', async (req, res) => {
      const doc = req.body;
      //   delete doc._id;
      console.log(doc);
      const result = await bookingsCollection.insertOne(doc);
      res.send(result);
    });
    app.delete('/api/bookings/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await bookingsCollection.deleteOne(query);
      res.send(result);
    });
    app.patch('/api/bookings/:id', async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const updatedBooking = req.body;
      const updatedDoc = {
        $set: {
          status: updatedBooking.status,
        },
      };
      console.log(updatedBooking);
      const result = await bookingsCollection.updateOne(filter, updatedDoc);
      res.send(result);
    });
    console.log(
      'Pinged your deployment. You successfully connected to MongoDB!'
    );
  } finally {
  }
}
run().catch(console.dir);
app.get('/', (req, res) => {
  res.send('Welcome to Programming Hero Cart Doctor Server');
});
app.listen(port, () => {
  console.log(`server listening at ${port}`);
});
