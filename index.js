require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const app = express();
const jwt = require('jsonwebtoken');
const port = process.env.PORT || 3000;
const corsOptions = {
  origin: ['http://localhost:5173', 'http://localhost:5174', '***'],
  credentials: true,
  optionSuccessStatus: 200,
};
app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());
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

    // Auth related apis
    app.post('/jwt', async (req, res) => {
      const user = req.body;
      console.log(user);
      const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: '1h',
      }); // generate token
      res
        .cookie('token', token, {
          httpOnly: true,
          secure: false, // in development false in production true
          sameSite: 'none',
          // expires : new Date(Date.now() + process.env.COOKIE_EX)
        })
        .send({ success: true });
    });

    // Services related apis
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
      console.log('token', req.cookies.token); // check that if client send cookie to me
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
