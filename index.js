const AWS = require('aws-sdk')
AWS.config.update({ region: 'us-west-2' })

const getMovies = async() => {
    const ddb = new AWS.DynamoDB({ apiVersion: '2012-10-08' });

    const params = {
        TableName: 'webapp-demo',
        ProjectionExpression: 'movie,category,rating'
    }

    return new Promise((resolve, reject) => {
        ddb.scan(params, (err, data) => {
            if (err) {
                return resolve(err)
            }
            resolve(data)
        })
    })
}

const addMovie = (movie, category, rating) => {
    const ddb = new AWS.DynamoDB({ apiVersion: '2012-10-08' });

    const params = {
        Item: {
            "movie": {
                S: movie
            },
            "category": {
                S: category
            },
            "rating": {
                N: rating.toString()
            }
        },
        ReturnConsumedCapacity: "TOTAL",
        TableName: "webapp-demo"
    };

    return new Promise((resolve, reject) => {
        ddb.putItem(params, function(err, data) {
            if (err) {
                return resolve(err)
            }
            resolve(data)
        })
    });
}

const removeMovie = name => {
    const ddb = new AWS.DynamoDB({ apiVersion: '2012-10-08' });

    const params = {
        Key: {
            "movie": {
                S: name
            }
        },
        TableName: "webapp-demo"
    };

    return new Promise((resolve, reject) => {
        ddb.deleteItem(params, function(err, data) {
            if (err) {
                return resolve(err);
            }
            resolve(data);
        });
    });
}

exports.handler = async(event) => {
    const { httpMethod, body } = event;
    let content = event;

    if (httpMethod === "GET") {
        content = await getMovies();
    }

    if (httpMethod === "POST") {
        const bodyObject = JSON.parse(body);

        const {
            movie,
            category,
            rating
        } = content = bodyObject;

        content = await addMovie(movie, category, rating);
    }

    if (httpMethod === "DELETE") {
        const bodyObject = JSON.parse(body);
        const {
            name
        } = bodyObject;
        content = await removeMovie(name);
    }

    const response = {
        statusCode: 200,
        headers: {
            "Access-Control-Allow-Origin": "*"
        },
        body: JSON.stringify(content)
    };

    return response;
};
