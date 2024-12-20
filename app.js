const express = require("express");
const path = require("path");
const cors = require("cors");
const bodyParser = require("body-parser");
const app = express();
const fs = require('fs');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

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
    console.log("Request Method: " + req.method);
    console.log("Request Date: " + new Date());
    next();
});

const staticFilesDirectory = path.join(__dirname, "static");

// Serve static files (for testing image serving with /static)
app.use("/static", (req, res, next) => {
    const filePath = path.join(staticFilesDirectory, req.path);
    fs.access(filePath, fs.constants.F_OK, (err) => {
        if (err) {
            return res.status(404).send("File not found!");
        }
        return express.static(staticFilesDirectory)(req, res, next);
    });
});

app.use(express.static(path.join(__dirname, "../CS-V1")));

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
        app.get("/search", async (req, res) => {
            try {
                const searchTerm = req.query.q; // Get the search term from the query parameters
                let searchCriteria = {
                    $or: [
                        { title: { $regex: searchTerm, $options: 'i' } }, // Search in title
                        { location: { $regex: searchTerm, $options: 'i' } }, // Search in location
                        { price: { $regex: searchTerm, $options: 'i' } } // Search in price
                    ]
                };

                // Check if the search term can be parsed as a number for availability
                const availability = parseInt(searchTerm, 10);
                if (!isNaN(availability)) {
                    searchCriteria.$or.push({ availability: availability }); // Search in availability
                }

                const lessons = await database.collection('Lesson Catalog').find(searchCriteria).toArray();
                res.json(lessons);
            } catch (e) {
                console.error(e);
                res.status(500).json({ error: "Error fetching lessons" });
            }
        });
        app.post("/order", async (req, res) => {
            try {
                res.setHeader('Content-Type', 'application/json');
                const userOrders = req.body;

                let result = await database.collection('Booking Orders').insertOne({
                    firstName: userOrders.firstName,
                    lastName: userOrders.lastName,
                    phoneNum: userOrders.phoneNum,
                    lessonId: userOrders.lessonId
                });
                console.log(result);
                res.status(201).json({ message: "Order placed successfully", orderId: result.insertedId });
            } catch (e) {
                console.error(e);
                res.status(500).json({ error: "Error placing order" });
            }
        });
        app.put("/update/:id", async (req, res) => {
            try {
                const id = req.params.id;
                const { availability } = req.body;
                const objectId = new ObjectId(id);

                const result = await database.collection('Lesson Catalog').updateOne(
                    { _id: objectId },
                    { $set: { availability: availability } }
                );
                res.json({ message: "Lesson updated successfully" });
            } catch (e) {
                console.error(e);
                res.status(500).json({ error: "Error updating lesson" });
            }
        });
    } finally {
    }
}
run().catch(console.dir);

app.listen(port, () => {
    console.log(`App started on http://localhost:${port}`);
});
