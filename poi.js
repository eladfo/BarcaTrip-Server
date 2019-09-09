var DButilsAzure = require('./DButils');

async function getRandomPOI(req, res){
    try{
        var index1;
        var index2;
        var index3;
        var min = req.params.min;
        var sqlRes = await DButilsAzure.execQuery("SELECT * FROM POI WHERE Rank >= " + min)
        if(sqlRes.length <= 3)
        {
            res.status(200).send(sqlRes)
            return;
        }
        else
        {
            index1 = Math.floor(Math.random() * (sqlRes.length-1));
            index2 = Math.floor(Math.random() * (sqlRes.length-1))
            while(index2 == index1)
                index2 = Math.floor(Math.random() * (sqlRes.length-1));

            index3 = Math.floor(Math.random() * (sqlRes.length-1));
            while( index3 == index1 || index3 == index2)
                index3 = Math.floor(Math.random() * (sqlRes.length-1));

            
            res.status(200).send({ "res1": sqlRes[index1] , "res2" :sqlRes[index2] , "res3": sqlRes[index3]});
            return; 
        }
    }
    catch(err){
        res.status(400).send(err)
    }
}
module.exports.getRandomPOI = getRandomPOI;

async function getPopularPOI(req, res){
    try{
        var category1 = new Object();
        var category2 = new Object();
        var userID = req.params.userID;

        var sqlRes = await DButilsAzure.execQuery("SELECT Category FROM Usercategories WHERE Username =  '" + userID + "'")

        if(sqlRes.length == 0)
        {
            res.status(400).send( {err: "The Username not found in the DB!"});
            return;
        }

        category1 = sqlRes[0];
        category2 = sqlRes[1];

        

        sqlRes = await DButilsAzure.execQuery("SELECT MAX(Rank) AS Rank FROM POI WHERE CategoryID =  " + category1.Category )
        if(sqlRes[0].Rank != null )
        {
            sqlRes = await DButilsAzure.execQuery("SELECT * FROM POI WHERE CategoryID =  '" + category1.Category + "' AND Rank = " + sqlRes[0].Rank )
            if(sqlRes[0].Rank != undefined)   
                category1 = sqlRes[0];
        }
        
        sqlRes = await DButilsAzure.execQuery("SELECT MAX(Rank) AS Rank FROM POI WHERE CategoryID =  '" + category2.Category + "'")
        if(sqlRes[0].Rank != null )
        {
            sqlRes = await DButilsAzure.execQuery("SELECT * FROM POI WHERE CategoryID =  '" + category2.Category + "' AND Rank = '" + sqlRes[0].Rank + "'")
            if(sqlRes[0].Rank != undefined)   
                category2 = sqlRes[0];
        }


        if(category1.Rank == undefined && category2.Rank == undefined)
        {
            res.status(400).send({err:"There is no POI in the CategoryID"})
            return;
        }
        else if(category1.Rank != undefined && category2.Rank == undefined)
        {
            res.status(200).send({"res1":category1})            
            return;
        }
        else if(category1.Rank == undefined && category2.Rank != undefined)
        {
            res.status(200).send({"res1":category2})            
            return;
        }
        res.status(200).send({"res1":category1 , "res2":category2 })            
        return;
    }   
    catch(err){
        res.status(400).send(err)
    }
}
module.exports.getPopularPOI = getPopularPOI;




async function getAllPOI(req, res){
    var sqlRes = await DButilsAzure.execQuery("SELECT * FROM POI")
    res.status(200).send(sqlRes)
    return 
}
module.exports.getAllPOI = getAllPOI;

async function getPOIByName(req, res){
    var sqlRes = await DButilsAzure.execQuery("SELECT * FROM POI WHERE Name = '" + req.params.poiName + "'")
    if(sqlRes.length == 0){
        res.status(400).send( {err: "POI does not exist."});
        return;
    }
    res.status(200).send(sqlRes);
    return;
}
module.exports.getPOIByName = getPOIByName;

async function addPoiToFavorite(req, res){
    try{
        if(req.body.userID == undefined || req.body.poiID == undefined){
            res.status(400).send( {err: "Please try again! The parameters in the body request is not valid"});
            return;
        }
        var sqlRes = await DButilsAzure.execQuery("SELECT * FROM Users WHERE Username = '" + req.body.userID + "'")
        if(sqlRes.length == 0){
            res.status(400).send( {err: "User does not exist."});
            return;
        }
        sqlRes = await DButilsAzure.execQuery("SELECT * FROM POI WHERE ID = '" + req.body.poiID + "'")
        if(sqlRes.length == 0){
            res.status(400).send( {err: "POI does not exist."});
            return;
        }
        var date = new Date();
        var str = date.toLocaleDateString() + " " + date.toLocaleTimeString();
        await DButilsAzure.execQuery("INSERT INTO FavoritePOI (Username, POI_ID, Date) Values ('" + req.body.userID + "','" + req.body.poiID + "','" + str + "')")
        res.status(200).send("POI added to favorites")
        return;
    }
    catch(err){
        res.status(400).send(err)
    }
}
module.exports.addPoiToFavorite = addPoiToFavorite;


async function CheakValidPOIReview(body)
{
   if(body.Username == undefined || body.POI_ID == undefined || body.Rank == undefined || body.Review == undefined  )
      return false;
   
   var a = await DButilsAzure.execQuery("SELECT * FROM Users WHERE Username = '" + body.Username + "'" );
   if(a.length == 0)
      return false;

   a = await DButilsAzure.execQuery("SELECT * FROM POI WHERE ID = '" + body.POI_ID + "'" );
   if(a.length == 0)
      return false;

   if( parseFloat(body.Rank) != 1 && parseFloat(body.Rank) != 2 && parseFloat(body.Rank) != 3 && parseFloat(body.Rank) != 4 && parseFloat(body.Rank) != 5 )
      return false;
   
   return true ;
}
module.exports.CheakValidPOIReview = CheakValidPOIReview;



async function getNewAvgOfPOI(body)
{

   try{
   var Sum = 0 ;
   var now = new Date();
   var a = await DButilsAzure.execQuery("SELECT *  FROM UserReview WHERE POI_ID = '" + body.POI_ID + "'" );
   var lenn = a.length;
   
   a = await DButilsAzure.execQuery("SELECT SUM(Rank) AS sum FROM UserReview WHERE POI_ID = '" + body.POI_ID + "'" );
      if(a[0].sum != null)
         Sum = parseFloat(a[0].sum);
   var avg = (Sum + parseFloat(body.Rank) )  / (parseFloat(lenn)+1) * 0.2 ;
   a = await DButilsAzure.execQuery("UPDATE POI SET Rank=" +avg +"WHERE ID = '" + body.POI_ID + "'" );
   a = await DButilsAzure.execQuery("INSERT INTO UserReview (Username, POI_ID , Rank , Review , Date) VALUES ('" + body.Username + "','" + body.POI_ID +"','" + body.Rank +"','" + body.Review +"','" + now.toLocaleDateString()+" "+now.toLocaleTimeString()+ "')" )
   return avg;
   }
   catch(err)
   {
      console.log(err);
   }
  
}
module.exports.getNewAvgOfPOI = getNewAvgOfPOI;



async function getLastReview(req ,res)
{
    try
    {
        var a = await DButilsAzure.execQuery("SELECT Review , Date , Rank FROM UserReview WHERE POI_ID = '" + req.params.poiID + "' ORDER BY Date DESC ")
        if(a.length<2)
         res.status(200).send(a);
         else
         res.status(200).send([a[0] ,a[1] ]);
    }
    catch
    {
      res.status(400).send({err:"The Request is faild!"});
    }
}
module.exports.getLastReview = getLastReview;



async function getPOIbyCategory(req ,res)
{
    try
    {
        var a = await DButilsAzure.execQuery("SELECT * FROM POI ORDER BY CategoryID ")
        res.status(200).send(a);
       
    }
    catch
    {
      res.status(400).send({err:"The Request is faild!"});
    }
}
module.exports.getPOIbyCategory = getPOIbyCategory;



async function getPOIbyRank(req ,res)
{
    try
    {
        var a = await DButilsAzure.execQuery("SELECT * FROM POI WHERE Rank >=  " + req.params.Rank)
        res.status(200).send(a);
       
    }
    catch
    {
      res.status(400).send({err:"The Request is faild!"});
    }
}
module.exports.getPOIbyRank = getPOIbyRank;


async function IncreaseWatchPOI(req ,res)
{
    try
    {
       console.log(req.params.POI_ID);
        var a = await DButilsAzure.execQuery(" UPDATE POI SET Num_of_Users = Num_of_Users + 1 WHERE ID = '" + req.params.POI_ID + "'")
        res.status(200).send(a);
       
    }
    catch
    {
      res.status(400).send({err:"The Request is faild!"});
    }
}
module.exports.IncreaseWatchPOI = IncreaseWatchPOI;


async function getLastFavoritePOI(req ,res)
{
    try
    {
        var username = req.params.UserName;
        var resql = await DButilsAzure.execQuery("SELECT * FROM FavoritePOI WHERE Username = '" + username + "' ORDER BY Date DESC ")
        if(resql.length == 0)
        {
            res.status(200).send({err:"There is no Favorite POI save!"})
            return;
        }
            else if(resql.length <= 2)
            {
                res.status(200).send(resql)
                return;
            }
            else
            {
                res.status(200).send(resql );
                return; 
            }
    }
    catch
    {
      res.status(400).send({err:"The Request is faild!"});
    }
}
module.exports.getLastFavoritePOI = getLastFavoritePOI;


async function RemovePoiFromFavorite(req ,res)
{
    try
    {
        var a = await DButilsAzure.execQuery("DELETE FROM FavoritePOI WHERE POI_ID = '" + req.body.poiID + "' AND Username = '" + req.body.Username + "'" )
        res.status(200).send(a);
        return;
    }
    catch
    {
      res.status(400).send({err:"The Request is faild!"});
    }
}
module.exports.RemovePoiFromFavorite = RemovePoiFromFavorite;


async function getFavoriteSize(req ,res)
{
    try
    {
        var a = await DButilsAzure.execQuery("SELECT * FROM FavoritePOI WHERE Username = '" + req.params.Username + "'" )
        var s = a.length;

        res.status(200).send({length : a.length});
        return;
    }
    catch
    {
      res.status(400).send({err:"The Request is failed!"});
    }
}
module.exports.getFavoriteSize = getFavoriteSize;


async function isPOIFavoritePOI(req ,res)
{
    try{
    if( req.body.POI == undefined || req.body.Username == undefined )
    {
        res.status(400).send( {err: "Please send again! the parameters in the body request is bad!"});
        return;
    }
    
     var a = await DButilsAzure.execQuery("SELECT * FROM FavoritePOI WHERE POI_ID = '" + req.body.POI + "' AND Username = '" + req.body.Username + "'" )
     if(a.length == 0)
        res.status(200).send({res: "False"});
     else
        res.status(200).send({res: "True"});
    return;
    }
    catch(err){
        res.status(400).send({err:"The Request is faild!"})
    }
}
module.exports.isPOIFavoritePOI = isPOIFavoritePOI;


async function getAllFavoritePOI(req ,res)
{
    try{
   
    
     var a = await DButilsAzure.execQuery("SELECT * FROM FavoritePOI WHERE Username = '" + req.params.Username+"'" )
     res.status(200).send(a)
    return;
    }
    catch(err){
        res.status(400).send({err:"The Request is faild!"})
    }
}
module.exports.getAllFavoritePOI = getAllFavoritePOI;

//=====

async function getAllFavoritePoiSort(req ,res)
{
    try{

     var a = await DButilsAzure.execQuery("SELECT POI.ID,POI.Name, POI.Picture ,POI.Num_of_Users ,POI.Rank , POI.Description FROM FavoritePOI INNER JOIN POI ON FavoritePOI.POI_ID = POI.ID  AND FavoritePOI.Username = '" + req.params.Username+"' order by POI.Rank")
     res.status(200).send(a)
    return;
    }
    catch(err){
        res.status(400).send({err:"The Request is faild!"})
    }
}
module.exports.getAllFavoritePoiSort = getAllFavoritePoiSort;
