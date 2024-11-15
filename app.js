const express = require("express");
const path = require("path");
const fs = require("fs");
const port = 3000;
const app = express();

app.use(express.json());

app.use(function (req, res, next) {
    console.log("Request IP: " + req.url);
    console.log("Request date: " + new Date());
    next();
});

let imagePath = path.resolve(__dirname, "images");
app.use("/static", express.static(imagePath));

app.use('/static', (req, res, next) => {
    const error = new Error("File not found in /static");
    error.status = 404; // Set the HTTP status code for the error
    next(error); // Pass the error to the error-handling middleware
});

app.use(function (req, res) {
    res.status(404);
    res.send("File not found!");
});

app.listen(port, function () {
    console.log("App started on port 3000");
});

const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = "mongodb+srv://ro436:qebebcICvSLuZmY1@clustertest.ww7wvpl.mongodb.net/?retryWrites=true&w=majority&appName=clusterTest";

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
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
            } catch (e) {
                console.error(e);
            }
        });
        app.put("/availability", (req, res) => {
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
