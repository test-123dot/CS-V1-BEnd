const express = require("express");
const path = require("path");
const cors = require("cors");
const bodyParser = require("body-parser");
const app = express();
const { MongoClient, ServerApiVersion } = require('mongodb');

const uri = "mongodb+srv://ro436:qebebcICvSLuZmY1@clustertest.ww7wvpl.mongodb.net/?retryWrites=true&w=majority&appName=clusterTest";
const port = 3000;
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

app.use(cors());
app.use(express.json());
app.use(bodyParser.json());

app.use(function (req, res, next) {
    console.log("Request IP: " + req.url);
    console.log("Request date: " + new Date());
    next();
});

let imagePath = path.resolve(__dirname, "images");
app.use("/static", express.static(imagePath));

app.use('/static', (req, res) => {
    res.status(404);
    res.send("File not found!");
});

app.listen(port, function () {
    console.log("App started on port 3000");
});


let database;

async function run() {
    try {
        await client.connect();
        await client.db("admin").command({ ping: 1 });
        database = client.db("LessonBookingSystem");
        console.log("Pinged your deployment. You successfully connected to MongoDB!");

        app.get("/lessons", async (req, res) => {
            try {
                let lessonGet = await database.collection('Lesson Catalog').find().toArray();
                console.log(lessonGet);
                res.json(lessonGet);
            } catch (e) {
                console.error(e);
            }
        });
        app.post("/order", async (req, res) => {
            try {
                res.setHeader('Content-Type', 'application/json');
                const userOrders = req.body;
                let result = await database.collection('Booking Orders').insertOne({
                    firstName: userOrders.firstName, lastName: userOrders.lastName,
                    phoneNum: userOrders.phoneNum, lessonId: [], availability: userOrders.availability
                });
                console.log(result);
            } catch (e) {
                console.error(e);
            }
        });
        app.put("/availability", async (req, res) => {
            try {

            } catch (e) {
                console.error(e);
            }
        });
    } finally {
        //     await client.close();//
    }
}
run().catch(console.dir);
