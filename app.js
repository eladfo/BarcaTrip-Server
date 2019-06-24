
var express = require('express');
var app = express();
var DButilsAzure = require('./DButils');
var userMod = require('./user');
var poiMod = require('./poi');
app.use(express.json());
var port = 3000;

const jwt = require("jsonwebtoken");


app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header(
      "Access-Control-Allow-Headers",
      "Origin, X-Requested-With, Content-Type, Accept, Authorization"
    );
    if (req.method === 'OPTIONS') {
        res.header('Access-Control-Allow-Methods', 'PUT, POST, PATCH, DELETE, GET');
        return res.status(200).json({});
    }
    next();
  });


app.listen(port, function () {
    console.log('Example app listening on port ' + port);
});



app.use("/private", (req, res,next) => {
    var secret = "thisIsASecret";
	const token = req.header("x-auth-token");
	// no token
	if (!token) res.status(401).send("Access denied. No token provided.");
	// verify token
	try {
		const decoded = jwt.verify(token, secret);
		req.decoded = decoded;
		next(); //move on to the actual function
	} catch (exception) {
		res.status(400).send("Invalid token.");
	}
});


app.post('/LogIn', function(req, res)
{
    userMod.LogIn(req,res);

});


app.post('/signUp', async function(req, res){ 
    
    userMod.signUp(req,res);

});



app.post('/restorePassword', async function(req, res){
    
    userMod.restorePassword(req,res);

});




app.get('/getPossibleCountries', function(req, res)
{
    
    DButilsAzure.execQuery("SELECT Country FROM Country ")
    .then(function(result){
            res.status(200).send(result)
    })
    .catch(function(err){
        res.status(400).send(err)
    })
});

app.get('/getAllCategories', async function(req, res)
{
    await userMod.getAllCategories(req ,res);
});

app.get('/getRandomPOI/:min', function(req, res)
{
    poiMod.getRandomPOI(req,res);

});


app.get('/private/getPopularPOI/:userID', function(req, res)
{
    poiMod.getPopularPOI(req,res);

});



app.get('/getAllPOI', function(req, res)
{
    poiMod.getAllPOI(req,res);
});



app.get('/getPOIByName/:poiName', function(req, res)
{
    poiMod.getPOIByName(req,res);
});

app.post('/private/addPoiToFavorites', async function(req, res)
{
    poiMod.addPoiToFavorite(req, res);

});





app.get('/private/getLastFavoritePOI/:UserName', async function(req, res)
{
    await poiMod.getLastFavoritePOI(req,res);
});



app.delete('/private/removePoiFromFavorites', async function(req, res)
{
    await poiMod.RemovePoiFromFavorite(req,res);
    
});



app.get('/private/getFavoritesCount/:Username', async function(req, res)
{
    poiMod.getFavoriteSize(req,res);
});


app.post('/private/isPoiFavorite', async function(req, res)
{
    poiMod.isPOIFavoritePOI(req,res);
    
});



app.get('/private/getAllFavoritePOI/:Username', async function(req, res)
{
poiMod.getAllFavoritePOI(req,res);
    
});




app.post('/private/addPoiReview', async function(req, res)
{

    var flag = await poiMod.CheakValidPOIReview(req.body);
    if( !flag)
    {
        res.status(400).send( {err: "Please send again! the parameters in the body request is bad!"});
        return;
    }
    try{
            var R = await poiMod.getNewAvgOfPOI(req.body);
            res.status(200).send("")


    }
    catch(err){
        res.status(400).send(err)
    }
    
});

app.get('/private/getLastReviews/:poiID', async function(req, res)
{
    await poiMod.getLastReview(req ,res);
});
//======


app.get('/getPOI_ByCategory/:category', async function(req, res)
{
    await poiMod.getPOIbyCategory(req ,res);
});

app.get('/getPOIbyRank/:Rank', async function(req, res)
{
    await poiMod.getPOIbyRank(req ,res);
});

app.get('/IncreaseWatchPOI/:POI_ID', async function(req, res)
{
    await poiMod.IncreaseWatchPOI(req ,res);
});




