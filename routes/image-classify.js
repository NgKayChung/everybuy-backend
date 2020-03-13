var express = require('express');
var router = express.Router();
var tf = require('@tensorflow/tfjs');
require('@tensorflow/tfjs-node');

var MYSQL = require('../models/DBConnection');

const PREDICTION_LABELS = ["Mouse", "Keyboard", "Electric Fan", "Gaming Controller", "Desk", "Bag"];

/* POST API - Image Classification */
router.post('/', async function(req, res) {
    if(req.body.image_data) {
        var imageData = req.body.image_data;
        
        var input = [];
        for(var i = 0; i < imageData.length; i += 4) {
            input.push(imageData[i + 0] / 255.0);
            input.push(imageData[i + 1] / 255.0);
            input.push(imageData[i + 2] / 255.0);
        }

        var tfModel = await tf.loadLayersModel('file://./trained_model/model.json');

        var tfinput = tf.tensor1d(input).reshape([1, 50, 50, 3]);
        
        var outputs = tfModel.predict([tfinput]);
        
        let predictionResult = outputs.toString();
        predictionResult = predictionResult.substring(predictionResult.indexOf("["));
        predictionResult = predictionResult.replace(/[\[\s\]]*/gi, "");
        
        let predictionArr = predictionResult.split(",");
        predictionArr.pop(); // remove empty value after the last ","

        let predictions = predictionArr.map((predValue, index) => {
          return { "label": PREDICTION_LABELS[index], "score" : parseFloat(predValue) * 100 };
        });

        predictions.sort((pred1, pred2) => {
          return pred2.score - pred1.score;
        });

        res.send({ 'code': 20, 'message': 'Successful', 'data': predictions });
    }
    else {
        res.send({ 'code': 40, 'message': 'Invalid parameter' });
    }
});

module.exports = router;