const express = require("express");
const bodyParser = require("body-parser");

const { MongoClient } = require('mongodb');
const ObjectID = require('mongodb').ObjectId;
const uri = "mongodb+srv://pavel:Esq%2FxtHFbY7%2Bz.R@meanprojectudemi.7cc4q.mongodb.net/ThreeJSScene?retryWrites=true&w=majority";
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

const app = express();

const port = 3000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE, OPTIONS");
    next();
});

app.get("/readState/:id", (req, res, next) => {
    const stateID = req.params.id;

    getState(stateID)
        .then(response => {
            res.status(200).json({
                message: JSON.stringify(response),
            });
        })
        .catch(console.dir);
});

app.post("/writeState", (req, res, next) => {
    const state = req.body;

    addState(state)
        .then(response => {
            res.status(200).json({
                message: response
            });
        })
        .catch(console.dir);
});

const getState = async (sceneID) => {
    try {
        await client.connect();
        const database = client.db("ThreeJSScene");
        const collection = database.collection("Scene");
        
        const query = { title: "Record of a Pavel Rolich", _id: ObjectID(sceneID) };
        const options = {
            sort: { "imdb.rating": -1 },
        };
        const result = await collection.findOne(query, options);
        return result.content;
    } finally {
        await client.close();
    }
}

const addState = async (data) => {
    try {
        await client.connect();
        const database = client.db("ThreeJSScene");
        const collection = database.collection("Scene");

        const doc = {
            title: "Record of a Pavel Rolich",
            content: data,
        }
        const result = await collection.insertOne(doc);
        return result.insertedId;
    } finally {
        await client.close();
    }
}

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
});
