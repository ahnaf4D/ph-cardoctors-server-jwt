require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const app = express();
const jwt = require('jsonwebtoken');
const port = process.env.PORT || 3000;
const corsOptions = {
  origin: ['http://localhost:5173', 'http://localhost:5174'],
  credentials: true,
  optionsSuccessStatus: 200,
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

// Custom MiddleWares
const logger = async (req, res, next) => {
  console.log('called : ', req.hostname, req.originalUrl);
  next();
};
const verifyTokens = async (req, res, next) => {
  const token = req.cookies.token;
  console.log('value of token in middleware : ', token);
  if (!token) {
    res.status(401).send({ massage: 'not authorized' });
  }
  jwt.verify(token, process.env.TOKEN_SECRET_KEY, (err, decoded) => {
    if (err) {
      console.log(err);
      return res.status(401).send({ massage: 'unauthorized' });
    }
    console.log('value in the token', decoded);
    next();
  });
};
async function run() {
  try {
    const serviceCollection = client.db('phCarDoctors').collection('Services');
    const bookingsCollection = client.db('phCarDoctors').collection('Bookings');
    // Auth Related api
    app.post(`/jwt`, logger, async (req, res) => {
      const user = req.body;
      console.log(user);
      const token = jwt.sign(user, process.env.TOKEN_SECRET_KEY, {
        expiresIn: '1h',
      });

      res
        .cookie('token', token, {
          httpOnly: true,
          secure: false, // false in dev and true in prod
        })
        .send({ success: true });
    });

    // Service related api
    app.get('/api/services', logger, async (req, res) => {
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
    app.get('/api/bookings/', logger, verifyTokens, async (req, res) => {
      console.log(req.query.email);
      // console.log('token', req.cookies.token);
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
