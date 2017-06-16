// Setup basic express server
var mongoOp     =   require("./models/mongo");
var quizzesOp     =   require("./models/quizzes");
var bodyParser  =   require("body-parser");
var topics     =   require("./models/topics");
var Player     =   require("./models/player");
var FacebookPlayer = require("./models/facebookplayer");
var dbFiller = require('./libs/database-filler.js');
var OnlineUsers   =   require("./models/onlineusers");

var RandomChallengedGames     =   require("./models/randomchallengedgames");
var FriendChallengedGames   =   require("./models/friendchallengedgames");
var GameRequests   =   require("./models/gamerequests");

var GamesAccepted   =   require("./models/gamesaccepted");
var Friend    =   require("./models/friend");
var QuestionsForFriendChallenge   =   require("./models/questionsforfriendchallenge");
var mongoose    =   require("mongoose");
var express = require('express');
var morgan      =   require('morgan')
var app = express();
var server = require('http').createServer(app);

var io = require('socket.io')(server);
var port = process.env.PORT || 3100;
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var FacebookStrategy = require('passport-facebook').Strategy;
var async = require('async');
var nodemailer = require('nodemailer');
var router      =   express.Router();
var mongoURL = 'mongodb://userD2E:X1wbDQLqUSD1ot4w@mongodb/sampledb';
mongoose.connect(mongoURL);

// Configure app to use validation system with our config (custom rules)
var expressValidator = require('express-validator');
var evConfig         = require('./libs/express-validator-config.js');

app.use(expressValidator(evConfig));

//Logging
app.use(function(req, res, next) {
    res.header('Access-Control-Allow-Credentials', true);
    res.header('Access-Control-Allow-Origin', req.headers.origin);
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept');
    if ('OPTIONS' == req.method) {
        res.send(200);
    } else {
        next();
    }
});

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))
// parse application/json
app.use(bodyParser.json())
// parse application/vnd.api+json as json
app.use(bodyParser.json({ type: 'application/vnd.api+json' }))
app.use(function (req, res, next) {
  console.log("************************* REQUEST ************************* =  " )
  console.log(req.body) // populated!
  console.log("************************* REQUEST ************************* " )

  next()
})
app.use(morgan('combined'))
app.use(express.static(__dirname));

//Passport

/*      done = function verified(err, user, info) {
        if (err) { return self.error(err); }
        if (!user) { return self.fail(info); }
        self.success(user, info);
  }*/
passport.use(new LocalStrategy(function(username, password, done) { 
    // burdaki username ve password /user/login in içindeki req'den geliyo.
    console.log(" LocalStrategy username = " + username + " password = " + password + " done = " + done);
   
    Player.findOne({ username: username }, function(err, user) {
        if (err) return done(err);
        if (!user) return done(null, false, { message: 'Incorrect username.' });
        user.comparePassword(password, function(err, isMatch) {
            if (isMatch) {
                return done(null, user);
            } else {
                return done(null, false, { message: 'Incorrect password.' });
            }
        });
    });
}));

passport.use(new FacebookStrategy({
    clientID: '1301406996598081',
    clientSecret: '265c7bf3e223e09773ce4b49225d4c54',
    callbackURL: "http://localhost:3100/auth/facebook/callback"
  },
 
 // facebook will send back the token and profile 
  function(token, refreshToken, profile, done) {

        // asynchronous
        process.nextTick(function() {

            // find the user in the database based on their facebook id
            FacebookPlayer.findOne({ 'facebookId' : profile.id }, function(err, user) {

                // if there is an error, stop everything and return that
                // ie an error connecting to the database
                if (err)
                    return done(err);

                // if the user is found, then log them in
                if (user) {
                     console.log("FACEBOOK KULANICI KAYDI IF İÇİ USER = " + user + " DONE = " + done);
                    return done(null, user); // user found, return that user
                } 
               // if there is no user found with that facebook id, create them               
                else { 
                    console.log("FACEBOOK KULANICI KAYDI ELSE İÇİ " + JSON.stringify(profile));
                    var newFacebookUser = new FacebookPlayer({
                        facebookId    : profile.id,
                        facebookName  : profile.displayName,
                        facebookToken : token
                    });

                    console.log("facebookId = " + profile.id + " facebookToken = " + token + " facebookName = " + profile.displayName);

                    // save our user to the database
                    newFacebookUser.save(function(err) {
                        if (err){
                            console.log("Errrorrrrr " + err);
                            throw err;
                        }
                        // if successful, return the new user
                         else{
                          console.log("newUser save else içi newUser = " + newFacebookUser);
                          return done(null, newFacebookUser);
                         }
                    });
                }
            });
        });
    }
));

passport.serializeUser(function(user, done) {
    done(null, user.id);
});

passport.deserializeUser(function(id, done) {
    User.findById(id, function(err, user) {
        done(err, user);
    });
});

app.use(passport.initialize());
app.use(passport.session());
app.use('/',router);
//************************************** OZAN 0 BİTİŞ ****************************** 

 // =====================================
 // FACEBOOK ROUTES =====================
 // =====================================
    
// route for facebook authentication and login
// If your application needs extended permissions, they can be requested by setting the scope option.
// Multiple permissions can be specified as an array.  { scope: ['read_stream', 'publish_actions'] }

router.route('/auth/facebook').get(passport.authenticate('facebook'));

// handle the callback after facebook has authenticated the user. Normalde aşağıdaki gibiydi ben değiştirdim.

router.route('/auth/facebook/callback').get(passport.authenticate('facebook', 
    { successRedirect: '/',
      failureRedirect: '/login' }));

/*
router.route('/auth/facebook/callback').get( 
      passport.authenticate('facebook', function(err, user){
            // function(err, user) ekleyerek FacebookStrategy'nin, done() ile yolladıklarını
            // alabiliyoruz. Normalde function(err, user) yoktu ben ekledim
            console.log("WWWWWWWWW + " + user ); 
            // bu user FacebookStrategy'nin done'ından geliyor.
            if (err){ 
                console.log(err);
                return next(err);
            }
            if(user){
                console.log(" USER if içi user = " + user);
                // return res.json({ err_code: 0, message: "login success"});                
            }
        })
   // }
);
*/
// Login

/*
    next = function next(err) {
        if (err && err === 'route') {
        return done();
        }
        var layer = stack[idx++];
        if (!layer) {
        return done(err);
        }
        if (layer.method && layer.method !== method) {
        return next(err);
        }
        if (err) {
        layer.handle_error(err, req, res, next);
        } else {
        layer.handle_request(req, res, next);
        }
    }
************************* REQUEST ************************* =  
    { username: 'vcvc', password: '44' }
************************* REQUEST ************************* */

router.route("/user/login")
    .post(function (req, res, next) { 
        console.log(" /user/login req = " + (req) + " res = " +(res) + " next = " + next);

        passport.authenticate('local', function (err, user, info) { 
            // bu (err, user, info), passport.use daki done()'dan gelen değerler.
            // done aslında diğer fonk.lardaki callback parametresi gibi oluyo ama değil.
           
            console.log("/user/login ERR = ," + err + " USER = ," + user + " info = " + JSON.stringify(info));
           
            // örnek: return done(null, false, { message: 'Incorrect password.' }); için print şöyle oluyor:
            // /user/login ERR = null, USER = false, info = {"message":"Incorrect password."}
            
            if (err) 
                return next(err)
            
            if (!user) {
                return res.json({ err_code: 1, message: "wrong password or username" })
            }
            req.logIn(user, function (err) {
                if (err) 
                    return next(err);
				
                console.log("SUCCES LOGIN");
                return res.json({ err_code: 0, message: "login success", userid: user._id, username: user.username });
            });
        })(req, res, next);   
})
//Register
router.route("/user/register")
    .post(function (req, res) {
        var user = new Player({
            username: req.body.username,
            email: req.body.email,
            password: req.body.password
        });
		
		console.log("USERNAME  ---> "  +  req.body.username);

        user.save(function (err) {
            if (err) {
                if (err.errmsg.match(/username_1/)) {
                    return res.json({ err_code: 1, message: "username already exists" });
                }
                if (err.errmsg.match(/email_1/)) {
                    return res.json({ err_code: 2, message: "email already registered" });
                }
                return res.json({ err_code: err.code, message: err.errmsg });
            } 
            else {
                req.logIn(user, function (err) {
                    res.json({ err_code: 0, message: "signup success",  userid: user._id });
                });
            }
        });
      })
//FACEBOOK Register
router.route("/user/register/facebook")
    .post(function (req, res) {

        console.log("/user/register/facebook a girdi");
		console.log("USERNAME  ---> "  +  req.body.name + " ID ----> " + req.body.id ); 
       
         FacebookPlayer.findOne({ 'facebookId' : req.body.id }, function(err, user) {       
            if (err)
                return done(err);

                // if the user is found, then log them in
            if (user) {
                console.log("FACEBOOK KULANICI KAYDI IF İÇİ USER = " + user + " user._id = " + user._id);
                return res.json({ err_code: 0, message: "login success", userid: user._id, username: req.body.name });

                //return done(null, user); // user found, return that user
            } 
            else{
              //  var facebookId = req.body.id;
              //  var idToString = facebookId.toString();
                var facebookUser = new FacebookPlayer({
                    username: req.body.name,
                    facebookId: req.body.id
                    // email: req.body.email,
                });
		
                facebookUser.save(function (err) {
                    if (err) {
                        return res.json({ err_code: err.code, message: err.errmsg });
                    } 
                    else {
                        res.json({ err_code: 0, message: "signup success",  userid: user._id, username: req.body.name });
                        console.log("Facebookplayer saved !!!")
                    /*   
                        req.logIn(facebookUser, function (err) {
                                res.json({ err_code: 0, message: "signup success",  userid: req.body.id });
                            });
                    */
                    }
                });
            }
        })
    })      

router.route("/user/logout")
    .post(function (req, res) {
        req.logout();
        res.json({ err_code: 0, message: "logout success" });
    })


server.listen(port, function () {
  console.log('Server HIHIHIH listening at port %d', port);
});

var theRoom = { 
             roomId:'heleholo',
             numUsers:0
};

var roomObject;
var roomObject_575e798ca02edd940875a65a = [];
var roomObject_575e79a8a02edd940875a65b = [];
var roomObject_575fe940a02edd940875db89 = [];
var roomObject_5762564aa02edd940876305d = [];

var roomObject_5763f85ca02edd9408766a27 = [];
var roomObject_57678127a02edd940876ec0f = [];
var roomObject_5767b67da02edd940877394e = [];
var roomObject_5768f629a02edd9408774101 = [];
var roomObject_576edfde1a46fbcd0719e0fa = [];
var roomObject_576f8de91a46fbcd071a0b2a = [];
var roomObject_576fface1a46fbcd071a9dff = [];
var roomObject_5770dc681a46fbcd071b5617 = [];

var allRoomsArray = [];
var scoresArray = [];

var x = new Array(10);
for (var i = 0; i < 10; i++) {
      x[i] = new Array(10);
}

//var name = window['a'];

var defaultNsps = '/';

var questions;
var scoresArray;

var selected_products = new Array();

function createScoresArray(){
         scoresArray = [[]];
}
            
var index = 0;

function emptyroomObject(roomObject){

    if(roomObject[0].numUsers == 3){
        console.log("emptyroomObject IF İÇİ num of users = " + roomObject[0].numUsers);
        roomObject = [];
        console.log("emptyroomObject IF İÇİ num of users = " + roomObject.length);
    }
    console.log("emptyroomObject IF DIŞI num of users = " + roomObject.length);

    return roomObject;
}

function getQuestionsByCategory(categoryId,qnumber, callback){
    console.log("In the getQuestionsByCategory");
    quizzesOp.find({'topic' : categoryId}, function(err, questions) {
        if (err) {
            callback(err, null);
        } else {
            callback(null, questions[0]);
        }
    });
};

function getCategoryByUser(callback)
{
    var userid = "575c214aa02edd940875a3c4";//semih
    topics.find({'createdBy' : userid}, function(err, name) {
        if (err) {
            callback(err, null);
        } else {
            callback(null, name);
        }
    });
};

function isGameExistWusername(username, gamename, categoryid, callback)
{
    RandomChallengedGames.find({'username' : username , 'gamename' : gamename , 'categoryid' : categoryid}, function(err, game) {
        if (err) {
            console.log("isGameExistWusername ERROR" + err);
            callback(err, null);
        } else {            
            console.log("isGameExistWusername ELSE" + game);
            callback(null, game);
        }
    });

}

function isGameExist(gamename, categoryid , callback)
{
    RandomChallengedGames.find({'gamename' : gamename , 'categoryid' : categoryid}, function(err, game) {
        if (err) {
            callback(err, null);
        } else {
            callback(null, game);
        }
    });
}

function isClientInOngoingPlayInCategory(myuserid, categoryId, callback)
{
    var userid = myuserid;
    var num = 0;
    console.log("IsClientInOngoingPlayInCategory userid = " + userid + " " + categoryId);

    RandomChallengedGames.find({usersThatDidntDeleteGame : userid, 'categoryid' : categoryId, 'completed': 0 }, function(err, game) {
        if (err) {
          callback(err, null);
        } 
        else { 
          console.log(" else içi game = " + game[0]);  
          callback(null, game[0]);
        }
    });
}

function findRandomChallengedGameWRoomId(roomid, currentTimeInSeconds, callback)
{
    console.log("findRandomChallengedGameWRoomId içi roomid =  " + roomid + " " + currentTimeInSeconds);

    RandomChallengedGames.find({'roomId' : roomid, 'currentTimeInSeconds' : currentTimeInSeconds}, function(err, game) {
        if (err) {
            console.log("findRandomChallengedGameWRoomId IF içi game =  " + err);           
            callback(err, null);
        } else {
            console.log("findRandomChallengedGameWRoomId ELSE içi game =  " + game[0] + " --- " + game );
            callback(null, game[0]);
        }
    });
}

function findRandomChallengedGamesWUsername(myuserId, callback)
{
/*    RandomChallengedGames.find({'username' : username}, function(err, games) {
        if (err) {
            callback(err, null);
        } else {
            console.log("findRandomChallengedGamesWUsername içi = " + games);
            callback(null, games);
        }
    });*/
    var userId = myuserId;    
    RandomChallengedGames.find({usersThatDidntDeleteGame : userId}, function(err, games) {
        if (err) {
            callback(err, null);
        } else {
            callback(null, games);
        }
    });
}
function findFriendChallengedGameHistoryWUsername(myuserId, callback)
{   console.log("findFriendChallengedGameHistoryWUsername myuserId = " + myuserId)
    var userId = myuserId;
    FriendChallengedGames.find({usersThatDidntDeleteGame : userId}, function(err, games) {
        if (err) {
            callback(err, null);
        } else {
            callback(null, games);
        }
    });
}

function deleteUserFromRandomChallengedSchema(currentTimeInSeconds, roomid, useridtobedeleted, callback)//Friend challengellar için
{
    var count = 0;  
    var array = [];
    var response = {"message" : "Silindi"};

    console.log("deleteUserFromRandomChallengedSchema içi currentTimeInSeconds = " + currentTimeInSeconds + " roomid = " + roomid + " useridtobedeleted = " + useridtobedeleted);        


    RandomChallengedGames.findOne({'currentTimeInSeconds': currentTimeInSeconds, 'roomId' : roomid}, function(err, game){
        
          console.log("deleteUserFromRandomChallengedSchema game = " + game);
          console.log(" game[0] = " + game[0]);        
          
          var index = game.usersThatDidntDeleteGame.indexOf(useridtobedeleted);
          console.log("INDEX = " + index);    
          if (index !== -1) {
                game.usersThatDidntDeleteGame.splice(index, 1);   //The first parameter (0) defines the position where new elements should be added (spliced in).
                                          //The second parameter (1) defines how many elements should be removed.
                                          //The rest of the parameters are omitted. No new elements will be added.
                callback(null, response);
          }
          game.save(function(err){
           if (err) throw err;
          }); 

          if (err) 
            callback(err, null);          
    })

    /*if(game.usersThatDidntDeleteGame.length == 0)
        game.remove().exec();*/
}
function deleteUserFromFriendChallengedSchema(currentTimeInSeconds, invitingusrid,invitedusrid,categoryid,useridtobedeleted, callback)//Friend challengellar için
{
    var response = {"message" : "Silindi"};

    FriendChallengedGames.findOne({'currentTimeInSeconds': currentTimeInSeconds,'invitinguserid' : invitingusrid , 'inviteduserid' : invitedusrid, 'categoryid' : categoryid}, function(err, game){
          console.log("deleteUserFromFriendChallengedSchema game = " + game);

          var index = game.usersThatDidntDeleteGame.indexOf(useridtobedeleted); 
          console.log("INDEX = " + index);
          if (index !== -1) {
            game.usersThatDidntDeleteGame.splice(index, 1);//The first parameter (0) defines the position where new elements should be added (spliced in).
                                          //The second parameter (1) defines how many elements should be removed.
                                          //The rest of the parameters are omitted. No new elements will be added.
            console.log("SİLİNDİ");
            callback(null, response);
          }

          if(game.usersThatDidntDeleteGame.length != 0){
                game.save(function(err){
                if (err) throw err;
                });
          }          

          if (err) 
            callback(err, null);  

          if(game.usersThatDidntDeleteGame.length == 0)
             game.remove();             
    })   
}

function deleteUserFromGameRequestSchema(currentTimeInSeconds, invitingusrid,invitedusrid,categoryid,useridtobedeleted, callback){
 // anasayfasında bu oyunu artık kayıtta tutmayan inviteduser ı silme işi.   
  
    var response = {"message" : "Silindi"};

    console.log("currentTimeInSeconds " + currentTimeInSeconds + " invitingusrid " 
        + invitingusrid + " invitedusrid " + invitedusrid + " categoryid " + categoryid + " useridtobedeleted " + useridtobedeleted )
    
    GameRequests.findOne({'currentTimeInSeconds': currentTimeInSeconds,'invitinguserid' : invitingusrid , 'inviteduserid' : invitedusrid, 'categoryid' : categoryid}, function(err, game){            

        console.log("deleteUserFromGameRequestSchema game = " + game);
        if(game!=null){
            var index = game.usersThatDidntDeleteGame.indexOf(useridtobedeleted);    
            
            if (index !== -1) {
                game.usersThatDidntDeleteGame.splice(index, 1);  
                callback(null, response); 
            }
            if(game.usersThatDidntDeleteGame.length != 0){
                game.save(function(err){
                    if (err) throw err;
                }); 
            }              
            if(game.usersThatDidntDeleteGame.length == 0)
                game.remove();
            if (err) 
                callback(err, null);        
        }
    })
}  
function getUserInfoByName(username, callback)
{
    Player.find({'username' : username}, function(err, userInfo) {
        if (err) {
            callback(err, null);
        } else {
            callback(null, userInfo[0]);
        }
    });
};

function getUserInfoByNameOnlineUserList(username, callback)
{
    OnlineUsers.find({'username' : username}, function(err, userInfo) {
        if (err) {
            callback(err, null);
        } else {
            callback(null, userInfo[0]);
        }
    });
};

function insertOnlineUserList(username , userid , mysocketid)
{
    var newUser = OnlineUsers({
        socketid : mysocketid,
        _id : userid,
        username: username
    });

    newUser.save(function(err)
    {
        if (err) throw err;

        console.log('User ' + username+ ' is created wtih socket id ' + mysocketid);
    });
}

function getCategoryInfoByCategoryId(myinvitingusername , myinvitedusername ,mycategoryid, mycategorydata, callback)
{
    topics.find({'_id' : mycategoryid}, function(err, categoryInfo) {
        if (err) {
            callback(err, null);
        } else {
            callback(null, categoryInfo[0]);
        }
    });
};

function deleteOnlineUserList(mysocketid)
{
    OnlineUsers.find({ 'socketid':mysocketid }).remove().exec();
    console.log('Socket number ' + mysocketid + ' is removed from list');
}

function updateGameScoreInfo(currentTimeInSeconds, invitinguserid , inviteduserid, gamereqcategoryid, infoForRankings, callback)
{
    console.log("currentTimeInSeconds " + currentTimeInSeconds + "invitinguserid ---> " + invitinguserid  + "  inviteduserid ---> " + inviteduserid + "  categoryid ---> " + gamereqcategoryid);
    
    GameRequests.findOne({'currentTimeInSeconds': currentTimeInSeconds, 'invitinguserid' : invitinguserid , 'inviteduserid' : inviteduserid, 'categoryid' : gamereqcategoryid}, function (err, gamerequest){ 

        if (err) { 
            console.log("updateGameScoreInfo GameRequests IF İÇİ")
            callback(err, null);
        } 
        else if(gamerequest != null){            
            console.log("updateGameScoreInfo GameRequests ELSE İÇİ game değerleri = " + gamerequest);
            gamerequest.scoreArrayForChallengeRank.push(infoForRankings);
            //gamerequest.usersThatDidntDeleteGame.push(infoForRankings.updaterUsername);

            if(gamerequest.scoreArrayForChallengeRank.length==2)
                gamerequest.completed=1;
            else
                gamerequest.completed=0;
                
            gamerequest.save(function (err) {
                if(err) 
                {
                    console.error('SAVE ERROR!');
                }
            });
            console.log("Server.js updateGameScoreInfo GameRequests scores are updated...." + 
               " game.scoreArrayForChallengeRank = " + gamerequest.scoreArrayForChallengeRank );
            callback(null, gamerequest.scoreArrayForChallengeRank);            
        }   
    });

    FriendChallengedGames.findOne({'currentTimeInSeconds': currentTimeInSeconds, 'invitinguserid' : invitinguserid, 'inviteduserid' : inviteduserid, 'categoryid' : gamereqcategoryid}, function (err, game){ 

        if (err) { 
            console.log("updateGameScoreInfo IF İÇİ")
            callback(err, null);
        } 
        else if(game != null){            
            console.log("updateGameScoreInfo FriendChallengedGames ELSE İÇİ game değerleri = " + game);
            game.scoreArrayForChallengeRank.push(infoForRankings);
            //gamerequest.usersThatDidntDeleteGame.push(infoForRankings.updaterUsername);

            if(game.scoreArrayForChallengeRank.length==2)
                game.completed=1;
            else
                game.completed=0;
                
            game.save(function (err) {
                if(err) 
                {
                    console.error('SAVE ERROR!');
                }
            });
            console.log("Server.js updateGameScoreInfo FriendChallengedGames scores are updated...." + 
               " game.scoreArrayForChallengeRank = " + game.scoreArrayForChallengeRank );
            callback(null, game.scoreArrayForChallengeRank);            
        }   
    });
}

function updateQuestionsGameRequestInfo(myinvitingusername , myinvitedusername , mycategoryid, questiondata)
{
    console.log("invitingusername ---> " + myinvitingusername + "  invitedusername ---> " + myinvitedusername + "  categoryid ---> " + mycategoryid);
    FriendChallengedGames.findOne({'currentTimeInSeconds': currentTimeInSeconds, 'invitingusername' : myinvitingusername , 'invitedusername' : myinvitedusername, 'categoryid' : mycategoryid}, function (err, myrecord){
        console.log("UPDATEQUESTIONSGAMEONFOOOOO **********  " + JSON.stringify(questiondata));
        if(myrecord !== null && myrecord !== undefined)
        {
            myrecord.questions = questiondata;
            myrecord.save(function (err) {
                    if(err) 
                    {
                        console.error('ERROR!');
                    }
                });
            console.log("Server.js updateQuestionsGameRequestInfo questions are updated....");
        }
        else
        {
            console.log("Couldnt find a record to update questions field......");
        }
    });
};

function insertGamesFromGameRequests(mycurrentTimeInSeconds, myinvitingusername, myinvitedusername, myinvitinguserid, myinviteduserid, mycategoryid, mycategoryname, mytimeouttime, myisexpired, scoreInfoArray, mycompleted, myisCurrentViewerDeletedDiv)
{
   // console.log(" insertGamesFromGameRequests'e GİRDİ scoreArray = " + scoreInfoArray)
   
    var scoreInfoObjectForChallengeRanking = {userScore : 0,
                                           userTime : 0,
                                           username : ''    }
    //var scoreInfoArray = [];

    var mytimeouttime = mytimeouttime + 120; // Adam oyunu kabul ettikten sonra timeout time a ek süre ekliyoz.

    var newGame = FriendChallengedGames({
        currentTimeInSeconds: mycurrentTimeInSeconds, 
        invitingusername : myinvitingusername,
        invitedusername : myinvitedusername,
        invitinguserid : myinvitinguserid,
        inviteduserid : myinviteduserid,
        categoryid: mycategoryid, 
        categoryname : mycategoryname,
        timeoutTime : mytimeouttime,
        isExpired : myisexpired,
        scoreArrayForChallengeRank: scoreInfoArray,
        completed: mycompleted,
        isCurrentViewerDeletedDiv: myisCurrentViewerDeletedDiv
    });
    newGame.usersThatDidntDeleteGame.push(myinvitinguserid);    
    newGame.usersThatDidntDeleteGame.push(myinviteduserid);

    newGame.save(function(err)
    {
        if (err) throw err;
        console.log('New FriendChallengedGames is created ' + mycurrentTimeInSeconds + ' ' + myinvitingusername + ' Invited user ' + myinvitedusername + ' category ' + mycategoryid);
    });

    console.log("FriendChallengedGames newGame = " + newGame)

}

function insertGameRequest(mycurrentTimeInSeconds, myinvitingusername, myinvitedusername, myinvitinguserid, myinviteduserid, mycategoryid, mycategoryname, myisexpired, mycompleted, myisdeclined, myisCurrentViewerDeletedDiv, callback)
{
    console.log(" insertGameRequest'e GİRDİ currentTimeInSeconds = " + mycurrentTimeInSeconds + " myinvitinguserid = " + myinvitinguserid + " myinviteduserid = " + myinviteduserid)

   // var curTimeInSeconds = Math.round(new Date().getTime()/1000);
    var timeoutValue = 60;

    var scoreInfoObjectForChallengeRanking = {userScore : 0,
                                           userTime : 0,
                                           username : ''    }
    var scoreInfoArray = [];
 //   scoreInfoArray.push(scoreInfoObjectForChallengeRanking);

    var newGameRequest = GameRequests({
        currentTimeInSeconds : mycurrentTimeInSeconds,
        invitingusername : myinvitingusername,
        invitedusername : myinvitedusername,
        invitinguserid : myinvitinguserid,
        inviteduserid : myinviteduserid, 
        categoryid : mycategoryid, 
        categoryname : mycategoryname,
       // questions : myquestiondata,
        timeoutTime : mycurrentTimeInSeconds + timeoutValue,
        isExpired : myisexpired,
        completed: mycompleted,
        isDeclined: myisdeclined,
        isCurrentViewerDeletedDiv: myisCurrentViewerDeletedDiv

      //  scoreArrayForChallengeRank: scoreInfoArray
    });
    console.log("insertGameRequest içi newGameRequest = " + newGameRequest)
    newGameRequest.usersThatDidntDeleteGame.push(myinvitinguserid);
    newGameRequest.usersThatDidntDeleteGame.push(myinviteduserid);
    console.log("insertGameRequest içi newGameRequest 2 = " + newGameRequest)

    newGameRequest.save(function(err)
    {
        if (err){
           console.log("ERR = " + err);
          callback(err,null)
        } 
        console.log('Game request inserted and gamerequest = ' + newGameRequest);
    });

    callback(null, newGameRequest);
}

function getGameRequestInfo(mycurrentTimeInSeconds, myinvitinguserid , myinviteduserid , mycategoryid, callback)
{
    console.log(" getGameRequestInfo'e GİRDİ currentTimeInSeconds = " + mycurrentTimeInSeconds);

    GameRequests.find({'currentTimeInSeconds': mycurrentTimeInSeconds,'invitinguserid' : myinvitinguserid , 'inviteduserid' : myinviteduserid, 'categoryid' : mycategoryid}, function(err, gamerequestInfo) {
        if (err) {
            callback(err, null);
        } else {
            callback(null, gamerequestInfo[0]);
        }
    });
};

function setFriendChallengeQuestions(mycurrentTimeInSeconds, myinvitinguserid , myinviteduserid , mycategoryid, mycategoryname, myquestiondata, callback)
{
    console.log(" setFriendChallengeQuestions'e GİRDİ currentTimeInSeconds = " + mycurrentTimeInSeconds);

    var timeoutValue = 60;

    var newGameQuestions = QuestionsForFriendChallenge({
        currentTimeInSeconds: mycurrentTimeInSeconds,
        invitinguserid : myinvitinguserid,
        inviteduserid : myinviteduserid,
        categoryid: mycategoryid, 
        categoryname : mycategoryname,
        questions : myquestiondata,
        //currentTime : curTimeInSeconds,
        timeoutTime : mycurrentTimeInSeconds + timeoutValue,
    });

    newGameQuestions.save(function(err)
    {
        if (err){
          throw err;
          callback(err,null)
        } 
        console.log("setFriendChallengeQuestions SAVED");
    });
    
    callback(null, newGameQuestions);
};

function getFriendChallengeQuestions(mycurrenttimeinseconds, myinvitinguserid, myinviteduserid , mycategoryid, callback)
{
    console.log(" getFriendChallengeQuestions'e GİRDİ currentTimeInSeconds = " + mycurrenttimeinseconds);

    QuestionsForFriendChallenge.find({'currentTimeInSeconds': mycurrenttimeinseconds,'invitinguserid' : myinvitinguserid , 'inviteduserid' : myinviteduserid, 'categoryid' : mycategoryid}, function(err, questions) {
        if (err) {
            callback(err, null);
        } else {
            callback(null, questions[0]);
        }
    });
};

function getGameRequestListForUserId(myuserId , callback)
{
    console.log("getGameRequestListForUserId içi userID = " + myuserId);
    var array = [];
    var userId = myuserId;

    GameRequests.find({usersThatDidntDeleteGame : userId}, function(err, game) {
     if (err) {
        callback(err, null);
     }
     else {
        console.log("getGameRequestListForUsername requestListForUsername = " + JSON.stringify(game));
        array.push(game);

           /* requestListForUsername.forEach(function(){
                count++;
                console.log("getGameRequestListForUsername COUNT = " + count);
                //callback(null, requestListForUsername);
                array.push(requestListForUsername);
            });*/   
/*
      * Performs the specified action for each element in an array.
      * @param callbackfn  A function that accepts up to three arguments. forEach calls the callbackfn function one time for each element in the array.
      * @param thisArg  An object to which the this keyword can refer in the callbackfn function. If thisArg is omitted, undefined is used as the this value.
      */
 //   forEach(callbackfn: (value: T, index: number, array: T[]) => void, thisArg?: any): void;
     
        callback(null, array);
        }
    });
};

// function getGameRequestListForUsername(myinvitedusername , callback)
// {
//     var count = 0;  
//     var array = [];

//     GameRequests.find({'invitedusername' : myinvitedusername}, function(err, requestListForUsername) {
//         if (err) {
//             callback(err, null);
//         }
//         else {
//         // callback(null, requestListForUsername[0]); // ozan böyle yapmıştı o yüzden tek request geliyodu
        
//             console.log("getGameRequestListForUsername requestListForUsername.length SSSS = " + requestListForUsername.length);
//             array.push(requestListForUsername);

//            /* requestListForUsername.forEach(function(){
//                 count++;
//                 console.log("getGameRequestListForUsername COUNT = " + count);
//                 //callback(null, requestListForUsername);
//                 array.push(requestListForUsername);
//             });*/
//             callback(null, array);
// /**
//       * Performs the specified action for each element in an array.
//       * @param callbackfn  A function that accepts up to three arguments. forEach calls the callbackfn function one time for each element in the array.
//       * @param thisArg  An object to which the this keyword can refer in the callbackfn function. If thisArg is omitted, undefined is used as the this value.
//       */
//  //   forEach(callbackfn: (value: T, index: number, array: T[]) => void, thisArg?: any): void;

//         }
//     });
// };

// function getSentGameRequestListForUsername(myinvitingusername , callback)
// {
//     var array = [];

//     GameRequests.find({'invitingusername' : myinvitingusername}, function(err, requestListForUsername) {
//         if (err) {
//             callback(err, null);
//         }
//         else {
//             console.log("getSentGameRequestListForUsername requestListForUsername = " + JSON.stringify(requestListForUsername));
//             array.push(requestListForUsername);

//             callback(null, array);
//         }
//     });
// };

function deleteGameRequestInfo(mycurrenttimeinseconds, myinvitinguserid , myinviteduserid , mycategoryid)
{
    console.log('deleteGameRequestInfo e GİRDİ ' + mycurrenttimeinseconds + ' ' + myinvitinguserid + ' ' + myinviteduserid);

    GameRequests.find({'currentTimeInSeconds': mycurrenttimeinseconds,'invitinguserid' : myinvitinguserid , 'inviteduserid' : myinviteduserid, 'categoryid' : mycategoryid}).remove().exec();
    console.log('Requested GameRequestInfo is removed from list SSSSSSSSSSSSSSSSSS');
};

function checkGameRequestsTimeouts(mycurrenttimeinseconds)
{
    GameRequests.find({'timeoutTime' : {$lte : mycurrenttimeinseconds, $ne: null} },function(err,gamerequest) {       
        
        console.log("checkGameRequestsTimeouts = " + mycurrenttimeinseconds);
        console.log("function checkGameRequestsTimeouts içi games = " + gamerequest[0])
        
        for(i=0; i<gamerequest.length; i++){
            gamerequest[i].isExpired = true; 
            gamerequest[i].save(function(err)
            {
                if (err) throw err;
            });     
        }
    });
};

function checkFriendChallegedTimeoutGames(mycurrenttimeinseconds)
{
    FriendChallengedGames.find({'timeoutTime' : {$lte : mycurrenttimeinseconds, $ne: null} },function(err,games) {
        if (err) {
            callback(err, null);
        } else {
            console.log("function check FriendChallegedTimeoutGames içi games = " + games.length)
            for(i=0; i<games.length; i++){
                games[i].isExpired = true;  
                console.log("function checkFriendChallegedTimeoutGames for içi games[i] = " + games[i]);
            }
        }
        
    });
};

function deleteRandomChallegedTimeoutGames(mycurrenttimeinseconds)
{
    RandomChallengedGames.find({'timeoutTime' : { $lte : mycurrenttimeinseconds , $ne: null}}).remove().exec();
    console.log('deleteRandomChallegedTimeoutGames Game is removed from list ');
};


function getGamesAcceptedInfo(myinvitingusername , myinvitedusername , mycategoryid, callback)
{
    GamesAccepted.find({'invitingusername' : myinvitingusername , 'invitedusername' : myinvitedusername, 'categoryid' : mycategoryid}, function(err, gamerequestInfo) {
        if (err) { 
            console.log("getGamesAcceptedInfo IF İÇİ")
            callback(err, null);
        } else {
            console.log("getGamesAcceptedInfo ELSE İÇİ " + gamerequestInfo[0])
            callback(null, gamerequestInfo[0]);
        }
    });
};

function getAcceptedGameScoreInfoByUsername(myinvitingusername , myinvitedusername , mycategoryid, myupdateusername, callback)
{
    GamesAccepted.find({'invitingusername' : myinvitingusername , 'invitedusername' : myinvitedusername, 'categoryid' : mycategoryid}, function(err, data) {
        if (err) {
            callback(err, null);
        } else {
            callback(null, data[0]);
        }
    });
};

function updateAcceptedGameScoreInfo(myinvitingusername , myinvitedusername , mycategoryid, myupdateusername, score)
{
    GamesAccepted.findOne({'invitingusername' : myinvitingusername , 'invitedusername' : myinvitedusername, 'categoryid' : mycategoryid}, function (err, doc){
        console.log("updateAcceptedGameScoreInfo **********  ");

        for(i = 0 ; i < doc.gameContent.length ; i++)
        {
            if(doc.gameContent[i].usernameInfo === myupdateusername)
            {
                doc.gameContent[i].scoreInfo = score;
                doc.save();
                break;
            }
        }

        console.log("Score is updated....");
    });
};

// Will remove all falsy values: undefined, null, 0, false, NaN and "" (empty string)
function cleanArray(actual) {
    var newArray = new Array();
    for (var i = 0; i < actual.length; i++) {
        if (actual[i]) {
            newArray.push(actual[i]);
        }
    }
    return newArray;
}

/* Creates an array of random integers between the range specified
 len = length of the array you want to generate
 min = min value you require
 max = max value you require
 unique = whether you want unique or not (assume 'true' for this answer)
 */
function _arrayRandom(len, min, max, unique) {
    var len = (len) ? len : 10,
        min = (min !== undefined) ? min : 1,
        max = (max !== undefined) ? max : 100,
        unique = (unique) ? unique : false,
        toReturn = [], tempObj = {}, i = 0;

    if(unique === true) {
        for(; i < len; i++) {
            var randomInt = Math.floor(Math.random() * ((max - min) + min));
            if(tempObj['key_'+ randomInt] === undefined) {
                tempObj['key_'+ randomInt] = randomInt;
                toReturn.push(randomInt);
            } else {
                i--;
            }
        }
    } else {
        for(; i < len; i++) {
            toReturn.push(Math.floor(Math.random() * ((max - min) + min)));
        }invitedusername
    }
   return toReturn;
}

function getRoomId(roomObject){
    return roomObject[0].roomId;
}

function getRooomsCurrentTimeInSeconds(roomObject){
    return roomObject[0].currentTimeInSeconds;
}

function getQuestions()
{
    // Return a random number between 1 and 2:
    var res = Math.floor((Math.random() * 2) + 1);
    console.log("getCurrentQuestions içi res = " + res);

    if(res==1)
      return jsonObj;
    else
      return jsonObj2;  
}


function sortScoresArray(arrToSort){

//      arrayToClient = sortScoresArray(scoresArray[i]);


    console.log("Array to be sorted 0 = " + arrToSort);
    //arrayToSort = arrToSort.shift(); // arrayin ilk elemanını siliyoruz.

   // console.log("Array to be sorted 1 = " + arrToSort[0].scoreInfo + " " + arrToSort[1].scoreInfo + " " + arrToSort[2].scoreInfo);

    // sort by value
  /*  arrToSort.sort(function (a, b) {
        if ((a).scoreInfo > (b).scoreInfo) {        
            console.log("Sort İÇİ İF İÇİ a.scoreInfo = " + a.scoreInfo + " b.scoreInfo = " + b.scoreInfo);           
            return -1;
        }
        if ((a).scoreInfo < (b).scoreInfo) {
            return 1;
        }
        // a must be equal to b
        return 0;
    });  */
    
    arrToSort.sort(function (b, a) {
        var n = a.scoreInfo - b.scoreInfo;
        console.log("sortScoresArray Function içi n = " +n);
        if (n !== 0) {
            return n;
        }
        console.log("sortScoresArray Function içi b.finalTime - a.finalTime = " + (b.finalTime - a.finalTime));
        
        return b.finalTime - a.finalTime;
        });    
   
    for ( i = 1; i < arrToSort.length; i++ ){ 
        console.log( 'value number score = ' + arrToSort[i].scoreInfo + " finalTime = " +
         arrToSort[i].finalTime );
    }
  //  console.log("Sorted Array = " + arrToSort[0].scoreInfo + " " + arrToSort[1].scoreInfo + " " + arrToSort[2].scoreInfo);

    return arrToSort;

}
router.route("/friendship/create")
    .post(function (req, res) {
  // Validation rules
  req.checkBody('uid1', 'param required').notEmpty();
  req.checkBody('uid2', 'param required').notEmpty();
  //req.checkBody('uid1', 'uid1 has to be a non-negative Integer').isUID();
  //req.checkBody('uid2', 'uid2 has to be a non-negative Integer').isUID();
  req.checkBody('uid1', 'uid1 cannot be equal to uid2').notEqual(req.body.uid2);
  
  // Validate
  const errors = req.validationErrors();

  if(errors){
    // Send "422: Unprocessable Entity" with errors
    res.status(422).json(errors);
  }else{
    Friend.addFriendship(req.body.uid1, req.body.uid2, req.body.username1, req.body.username2, (r) => {
      if(r){
        // Send "204: No Content"
        res.status(200).send({"error" : false,"message" : "FriendshipCreated"});
      }else{
        // Send "500: Internal Server Error"
        res.status(500).send("Internal Server Error");
      }
    });
  }
})

router.route("/friendship/delete/:id/:username/:friendname")
    .delete(function (req, res) {
  // Validation rules
  req.checkParams('id', 'Id must be formated as: UID1 + "-" + UID2').isProperDeleteId();
  
  // Validate
  const errors = req.validationErrors();

  if(errors){
    // Send "422: Unprocessable Entity" with errors
    res.status(422).json(errors);
  }else{
    // Get user id's from :id param
    const UIDs = req.params.id.split('-');
    const friendname = req.params.friendname;
	const username = req.params.username;
    Friend.deleteFriendship(UIDs[0], UIDs[1], username, friendname, (r) => {
      if(r.result){
        // Send "204: No Content"
        res.status(204).send();
      }else{
        // Send "500: Internal Server Error"
        res.status(500).send();
      }
    });
  }
})

router.route("/friendlist/:id")
    .get(function (req, res) {

    console.log("router.route(/friendlist/:id e girdi !!!");
  
    console.log("router.route(/friendlist/:id req.params.id = " + req.params.id);

    var id = req.params.id; 

    console.log("TypeOf 1 " + typeof id); // string
    console.log("TypeOf 2 " + typeof parseInt(id)); //number

    Friend.findById(req.params.id, (response) => {
    
        let friendlist = [];

        console.log("router.route(/friendlist/:id response = " + JSON.stringify(response));
    // console.log("router.route(/friendlist/:id response.user.friendlist = " + response.user.friendlist);

        if(response.user !== null){
            friendlist = response.user.friendlist;
      }
    console.log("router.route(/friendlist/:id response.user.friendlist = " + friendlist);

      // Send "200: OK" with friendlist in JSON format
      res.status(200).json(friendlist);
    });
 // }
})

router.route("/friendlist/search/:id")
    .get(function (req, res) {
  // Validation rules
  //req.checkParams('id', 'Id must be a non-negative Integer').isUID();

  // Validate
  //const errors = req.validationErrors();
  var friendUsername = req.params.id;
  //if(errors){
    // Send "422: Unprocessable Entity" with errors
    //res.status(422).json(errors);
  //}else{

    console.log("/friendlist/search/:id friendUsername = " + friendUsername)
    
   // Find user in DB
	Player.findOne({'username': friendUsername }, function (err, data) {  
	    if (err) 
        {
		    res.status(500).send(err)
	    } 
        else if(data != null)
        {
            console.log(" Player Schemada var " + data);		    
            res.send(data);
	    }
        else if(data == null){
        
            FacebookPlayer.findOne({'username': friendUsername }, function (err, data) {  
            console.log(" FacebookPlayer Schema ");
            
                if (err) 
                {
                    console.log(" FacebookPlayer Schemada yok err = " + err);                   
                    res.status(500).send(err)
                } 
                else 
                {
                    console.log(" FacebookPlayer Schemada var data = " + data);
                    res.send(data);
                }
            });
        }        
    
	});

  //}
})

router.route("/friendlist/getlist/:id")
    .get(function (req, res) {

  var friendUserId = req.params.id;

    // Find user in DB
	Friend.findFriends(friendUserId, (response) => {
      var friendlist = {};

      if(response.user !== null){
        friendlist = response.user;
      }

      // Send "200: OK" with friendlist in JSON format
      res.status(200).json(friendlist);
    });

})

router.route("/testing/fillDB/sample")
    .get(function (req, res) {
        dbFiller.clearCollection(() => {
            dbFiller.sampleData(() => {
            res.status(200).json({
                users: 5,
                connections: 2,
            });
            });
        });
    })

router.route("/delete/everything/:username").post(function (req, res) {

    console.log('/delete/everything GİRDİ!!!');
           
    // **************************** HERŞEYİ SİLMEK İÇİN !!!!!!! ****************************        
            FriendChallengedGames.remove(function(err,removed) {
                // where removed is the count of removed documents
            });
            GameRequests.remove(function(err,removed) {
                // where removed is the count of removed documents
            });
            RandomChallengedGames.remove(function(err,removed) {
                // where removed is the count of removed documents
            });
/*            Friend.remove(function(err,removed){

            });*/
    // **************************** HERŞEYİ SİLMEK İÇİN !!!!!!! **************************** 

                res.status(500).json("Silindi...");
 
})        


router.route("/gamerequest/accept/:currentTimeInSeconds/:invitingusr/:invitedusr/:invitingusrId/:invitedusrId/:categoryid/:categoryname")
    .get(function (req, res) {

    console.log('/gamerequest/accept/:invitingusr/:invitedusr/ GİRDİ!!!');

    var invitingusername = req.params.invitingusr;
    var invitedusername = req.params.invitedusr;
    var invitinguserid = req.params.invitingusrId;
    var inviteduserid = req.params.invitedusrId;
    var gamereqcategoryid = req.params.categoryid;
    var gamereqcategoryname = req.params.categoryname;
    var currentTimeInSeconds = req.params.currentTimeInSeconds
    console.log('/gamerequest/accept/ PARAMETRELERİ = ' + invitinguserid + ' ' + inviteduserid + ' ' + gamereqcategoryid + ' TIME = ' + currentTimeInSeconds);

    getFriendChallengeQuestions(currentTimeInSeconds, invitinguserid , inviteduserid, gamereqcategoryid, function(err, data) {
        
            if (err)
            {
                console.log(err);
                response = {"error" : true,"message" : "There is not any gamerequest record"};
            }
            else if(data != null)
            {
                console.log('QUESTIONS IN ACCEPT ARE = ' + data.questions);

                //insertGamesAccepted(invitingusername , invitedusername, gamereqcategoryid, data.categoryname , data.questions , gameContentArray);
                //insertGamesFromGameRequests(invitingusername, invitedusername, gamereqcategoryid, gamereqcategoryname, data.timeoutTime)

                res.status(200).json(data.questions);
            }
            else if(data == null)
            {
                console.log('No game request exists.... ');
                res.status(500).json("NULL DATA...");
            }
    });

    getGameRequestInfo(currentTimeInSeconds, invitinguserid , inviteduserid, gamereqcategoryid, function(err, data) {
        
            if (err)
            {
                console.log(err);
                response = {"error" : true,"message" : "There is not any gamerequest record"};
            }
            else if(data != null)
            {
                console.log('/gamerequest/accept getGameRequestInfo ELSE İÇİ');
                insertGamesFromGameRequests(currentTimeInSeconds, invitingusername, invitedusername, invitinguserid, inviteduserid, gamereqcategoryid, gamereqcategoryname, data.timeoutTime, data.isExpired, data.scoreArrayForChallengeRank, data.completed, data.isCurrentViewerDeletedDiv);
               // data.usersThatDidntDeleteGame.push(invitedusername);
                
                deleteGameRequestInfo(currentTimeInSeconds, invitinguserid , inviteduserid, gamereqcategoryid);

            }
            else if(data == null)
            {
                console.log('No game request exists.... ');
                res.status(500).json("NULL DATA...");
            }
    });
    
})

router.route("/gamerequest/decline/:currentTimeInSeconds/:invitingusrId/:invitedusrId/:categoryid/:decliningusername")
    .get(function (req, res) {

   
    var invitinguserid = req.params.invitingusrId;
    var inviteduserid = req.params.invitedusrId;   
    var gamereqcategoryid = req.params.categoryid;
    var currentTimeInSeconds = req.params.currentTimeInSeconds;
    var decliningusername = req.params.decliningusername;

    console.log('/gamerequest/decline/:invitingusr/:invitedusr/:categoryid e GİRDİ');
    // deleteGameRequestInfo(invitingusername , invitedusername, gamereqcategoryid);
    // res.status(200).json({"error" : false,"message" : "Succesfully Removed"});
    
    GameRequests.find({'currentTimeInSeconds':currentTimeInSeconds,'invitinguserid' : invitinguserid , 'inviteduserid' : inviteduserid, 'categoryid' : gamereqcategoryid}, function(err, gamerequest) {
        if (err) {
            callback(err, null);
        }
        else {
            console.log( "gamerequest to be declined is = " + gamerequest[0]);
            var index = gamerequest[0].usersThatDidntDeleteGame.indexOf(decliningusername);    
            if (index !== -1) {
                    gamerequest[0].usersThatDidntDeleteGame.splice(index, 1);   //The first parameter (0) defines the position where new elements should be added (spliced in).
                                            //The second parameter (1) defines how many elements should be removed.
                                            //The rest of the parameters are omitted. No new elements will be added.
            }
            gamerequest[0].isDeclined = true;
            gamerequest[0].save(function(err){
                if (err) throw err;
                else console.log('Game request DECLINED with Inviting User ' + invitinguserid + ' Invited user ' + inviteduserid + ' decliningusername ' + decliningusername);
            }); 
        }
    });
})
//router.route("/gamerequest/decline/:currentTimeInSeconds/:invitingusr/:invitedusr/:invitingusrId/:invitedusrId/:categoryid/:decliningusername")


router.route("/game/updatescore/:currentTimeInSeconds/:invitingusrId/:invitedusrId/:categoryid/:score/:finalTime/:updaterUsername")
    .get(function (req, res) {
// game/updatescore/1496419745/58f6170e72a5ba07aa8995e2/58f6172e72a5ba07aa8995e3/5770dc681a46fbcd071b5617/20/1.03/vcvc 
    //  var invitingusername = req.params.invitingusr;
    //  var invitedusername = req.params.invitedusr;
        var invitinguserid = req.params.invitingusrId;
        var inviteduserid = req.params.invitedusrId;
        var gamereqcategoryid = req.params.categoryid;
        var updaterusrName = req.params.updaterUsername;
        var usrScore = req.params.score;
        var usrTime = req.params.finalTime;
        var currentTimeInSeconds = req.params.currentTimeInSeconds
        
        console.log("Updating Score ... invitinguserid = " + invitinguserid + "inviteduserid = " + inviteduserid + " currentTimeInSeconds = " + currentTimeInSeconds  );

        var scoreArrayForChallengeRank = [];

        var infoForRankings = { userScore: usrScore,
                                userTime: usrTime,
                                updaterUsername: updaterusrName }

     //   scoreArrayForChallengeRank.push(infoForRankings); 

        console.log("Updating Score ... gamereqcategoryid = " + gamereqcategoryid + " currentTimeInSeconds = " + currentTimeInSeconds  );

       // updateAcceptedGameScoreInfo(invitingusername , invitedusername, gamereqcategoryid, usernameupdated , score);
       updateGameScoreInfo(currentTimeInSeconds, invitinguserid, inviteduserid, gamereqcategoryid, infoForRankings,function(err, scoreArrayForChallengeRank)
         {
             if (err)
            {
                console.log(err);
                response = {"error" : true,"message" : "There is not any record"};
            }
            else
            {   
                console.log('scores to sent --->' + scoreArrayForChallengeRank);
                res.status(200).json(scoreArrayForChallengeRank);
            }
         });
})

router.route("/game/getscore/:invitingusr/:currentTimeInSeconds/:invitedusr/:categoryid/:usernameupdated")//Ozan: birebir düeollada scoreUPDATİNİ ALMAK İÇİN 
    .get(function (req, res) {

        var invitingusername = req.params.invitingusr;
        var invitedusername = req.params.invitedusr;
        var gamereqcategoryid = req.params.categoryid;
        var usernameupdated = req.params.usernameupdated;
        var getscore = 0;
        var currentTimeInSeconds = req.params.currentTimeInSeconds

        console.log("Getting Requested Score");

        getAcceptedGameScoreInfoByUsername(currentTimeInSeconds,invitingusername , invitedusername , gamereqcategoryid, usernameupdated, function(err, data) 
        {
                for(i = 0 ; i < data.gameContent.length ; i++)
                {
                    if(data.gameContent[i].usernameInfo === usernameupdated)
                    {
                        getscore = data.gameContent[i].scoreInfo;
                        res.status(200).json(getscore);
                        break;
                    }
                }
        });
})

router.route("/randomGameChallenge/delete/:currentTimeInSeconds/:roomId/:useridtobedeleted")
     .get(function (req, res) {

        var categoryid = req.params.categoryid;
        var useridtobedeleted = req.params.useridtobedeleted;
        var currentTimeInSeconds = req.params.currentTimeInSeconds;
        var roomId = req.params.roomId;
       // var currentTimeInSeconds = req.params.currentTimeInSeconds
        console.log('/randomGameChallenge/delete/:username e girdi !!!! ' + currentTimeInSeconds + " " + roomId + " " + useridtobedeleted);
       

       deleteUserFromRandomChallengedSchema(currentTimeInSeconds, roomId, useridtobedeleted, function(err, data) 
        {
            if (err)
            {
                console.log(err);
                console.log("SERR");
                response = {"error" : true,"message" : "Silinemedi"};
            }
            else
            {   console.log("/randomGameChallenge/delete/: ELSE içi elaman SİLİNDİ");
                res.status(200).json(data)
                //res.json({ err_code: 0, message: "signup success",  userid: user._id });            
            }
                
        }); // anasayfasında bu oyunu artık kayıtta tutmayan kullanıcıyı silme işi.        
    })

router.route("/friendGameChallenge/delete/:currentTimeInSeconds/:invitingusrId/:invitedusrId/:categoryid/:usernametobedeleted")
     .get(function (req, res) {


        var invitingusrid = req.params.invitingusrId;
        var invitedusrid = req.params.invitedusrId;
        var categoryid = req.params.categoryid;
        var usernametobedeleted = req.params.usernametobedeleted;
        var currentTimeInSeconds = req.params.currentTimeInSeconds
        console.log('/friendGameChallenge/delete/:username e girdi !!!! ' + currentTimeInSeconds);

    //  deleteUserFromFriendChallengedSchema(invitingusr,invitedusr,categoryid,usernametobedeleted);
        
        deleteUserFromFriendChallengedSchema(currentTimeInSeconds,invitingusrid,invitedusrid,categoryid,usernametobedeleted, function(err, data) 
        { // anasayfasında bu oyunu artık kayıtta tutmayan kullanıcıyı silme işi. 
            if (err)
            {
                console.log("SERR");                
                console.log(err);
                console.log("SERR");
                response = {"error" : true,"message" : "Silinemedi"};
            }
            else
            {   console.log("/friendGameChallenge/delete/: ELSE içi elaman SİLİNDİ");

                res.status(200).json(data)
                //response = {"error" : false,"message" : "Silindi"};
                //res.json({ err_code: 0, message: "signup success",  userid: user._id });            
            }
                
        }); // anasayfasında bu oyunu artık kayıtta tutmayan kullanıcıyı silme işi.        
    })
    
router.route("/gameRequest/delete/:currentTimeInSeconds/:invitingusrId/:invitedusrId/:categoryid/:useridtobedeleted")
     .get(function (req, res) {
// GameRequest Expiredan ya da declineddan sonra invtingin ya da invitedın bu requesti sayfasından silmesi

        console.log('/sentGameRequest/delete/ !!!! ' );

        var invitingusrid = req.params.invitingusrId;
        var invitedusrid = req.params.invitedusrId;
        var categoryid = req.params.categoryid;
        var useridtobedeleted = req.params.useridtobedeleted;
        var currentTimeInSeconds = req.params.currentTimeInSeconds
        
        deleteUserFromGameRequestSchema(currentTimeInSeconds,invitingusrid,invitedusrid,categoryid,useridtobedeleted, function(err, data) 
        { // GameRequest Expiredan sonra invtingin ya da invitedın bu requesti sayfasından silmesi
            if (err)
            {
                console.log(err);
                console.log("SERR");
                response = {"error" : true,"message" : "Silinemedi"};
            }
            else
            {   
                console.log("/gameRequest/delete/: ELSE içi elaman SİLİNDİ");
                res.status(200).json(data);               
                //res.json({ err_code: 0, message: "signup success",  userid: user._id });            
            }
                
        }); 
       
    })  
/*
router.route("/sentGameRequest/delete/:invitingusr/:invitedusr/:categoryid/:usernametobedeleted")
     .get(function (req, res) {

        console.log('/sentGameRequest/delete/ !!!! ' );

        var invitingusr = req.params.invitingusr;
        var invitedusr = req.params.invitedusr;
        var categoryid = req.params.categoryid;

        deleteInvitingUserGameRequestSchema(invitingusr,invitedusr,categoryid, usernametobedeleted); 
    })    
*/

router.route("/gamerequest/list/:userId")
    .get(function (req, res) {

        console.log('/gamerequest/list/:username e girdi !!!! ');

        var currentTimeInSeconds = Math.round(new Date().getTime()/1000);
       
        checkGameRequestsTimeouts(currentTimeInSeconds);
        
        var userId = req.params.userId;
        getGameRequestListForUserId(userId, function(err, data)
        {
            if (err)
            {
                console.log(err);
                response = {"error" : true,"message" : "There is not any gamerequest record"};
            }
            else if(data != null)
            {
              //  console.log('/gamerequest/list/:invitedusr ELSE IF İÇİ data = ' + data);
                res.status(200).json(data);
            }
            else if(data == null)
            {
                console.log('No game request exists.... ');
                res.status(500).json({"error" : true,"message" : "There is not any gamerequest record"});
            }

        });

})
/*
router.route("/sentgamerequest/list/:invitingusr")
    .get(function (req, res) {

        console.log('/sentgamerequest/list/:invitingusr e girdi !!!! ' );

        var currentTimeInSeconds = Math.round(new Date().getTime()/1000);
       
        checkGameRequestsTimeouts(currentTimeInSeconds);

        var invitingusername = req.params.invitingusr;
        getSentGameRequestListForUsername(invitingusername , function(err, data)
        {
            if (err)
            {
                console.log(err);
                response = {"error" : true,"message" : "There is not any gamerequest record"};
            }
            else if(data != null)
            {
                console.log('/gamerequest/list/:invitedusr ELSE IF İÇİ data = ');
                data.questions = null;
                res.status(200).json(data);
            }
            else if(data == null)
            {
                console.log('No game request exists.... ');
                res.status(500).json({"error" : true,"message" : "There is not any gamerequest record"});
            }
        });
    })    

*/
io.on('connection', function (socket) {

        console.log('a user connected with socket id ' + socket.id);

        socket.on('disconnect', function(mysocket)
        {
            deleteOnlineUserList(socket.id);
            console.log(socket.id + ' is Disconnected');            
        });

        socket.on('randomChallengedGameHistory', function(params){

            var currentTimeInSeconds = Math.round(new Date().getTime()/1000);
                      
          // ***************** Sonra kullanılcak bu ***********************
          //  deleteRandomChallegedTimeoutGames(currentTimeInSeconds);
          // ***************** Sonra kullanılcak bu ***********************

            findRandomChallengedGamesWUsername(params.userId , function(err , games) {
                
                console.log("randomChallengedGameHistory gameHistory içi GAMES = " + games +" USERID = " + params.userId + "  length = " + games.length);                          

                if(games.length > 0)
                    {
                        console.log("randomChallengedGameHistory " + games);
                        socket.emit('randomChallengedGameHistory', {gamesHistory: games});
                    }
                console.log("EMIT GERCEKLESTİ ****** ");    
            })
        });
    
        socket.on('friendChallengedGameHistory', function(params){

                var currentTimeInSeconds = Math.round(new Date().getTime()/1000);
            
                //**************************************************************** */
                //Bunu DÜZELT çok verimsiz. Her gameHistory isteyen için bütün gamerequestleri kontrol etmek olmaz
               
                checkFriendChallegedTimeoutGames(currentTimeInSeconds);
               
                //****************************************************************
                findFriendChallengedGameHistoryWUsername(params.userId , function(err , games) {
                   
                    console.log("friendChallengedGameHistory içi GAMES = " + games +" USERID = " + params.userId
                    + "  length = " + games.length + " " + games.usersThatDidntDeleteGame );                          

                    if(games.length > 0)
                    {
                        socket.emit('friendChallengedGameHistory', {gamesHistory: games});                           
                    }
                console.log("EMIT GERCEKLESTİ ****** ");    
                })
        });

       socket.on('gamerequest', function(mysocket){
            
            console.log('gamerequest function içi mysocket değerleri = ' + mysocket.invitingusername + '  ' + mysocket.invitedusername 
                +  '  ' + mysocket.categoryid + ' ' + mysocket.categoryname + ' ' + mysocket.invitinguserid + ' ' + mysocket.inviteduserid);

            // *************** SORU SAYISI !!!!!!!!!!!!! **********************
                var qNumber = 5;
            // *************** SORU SAYISI !!!!!!!!!!!!! **********************

            getQuestionsByCategory(mysocket.categoryid, qNumber, function(err, data) {
                if (err)
                {
                    console.log(err);
                    response = {"error" : true,"message" : "There is not any record"};
                }
                else if(data != null && (qNumber > 0))
                {
                    console.log("****************** GETTING QUESTIONS ********************");
                    var allQuestions = (data._doc).questions;
                    var numQuestions = (data._doc.questions).length;
                    var rndquestnumbers = new Array(qNumber);
                    var questionData = new Array(qNumber);
                    rndquestnumbers = _arrayRandom(qNumber, 0, numQuestions, true);
                    for (var i = 0; i < qNumber; i++)
                    {
                        if(allQuestions != null && (qNumber <= numQuestions))
                        {
                            questionData[i] = allQuestions[rndquestnumbers[i]]._doc;
                            response = {"error" : false,"message" : questionData};
                        }
                        else
                        {
                            response = {"error" : true,"message" : "Opps some parameter is wrong"};
                        }
                    }
                  //console.log("QUESTIONS IN GAMEREQUEST ARE = " + JSON.stringify(questionData) );
                  //updateQuestionsGameRequestInfo(mysocket.invitingusername , mysocket.invitedusername, mysocket.categoryid , questionData);
    
                var isExpired = false;
                var completed = 0;
                var isDeclined = false;
                var isCurrentViewerDeletedDiv = false;

                insertGameRequest(mysocket.currentTimeInSeconds, mysocket.invitingusername , mysocket.invitedusername, mysocket.invitinguserid, mysocket.inviteduserid, mysocket.categoryid, mysocket.categoryname, isExpired, completed, isDeclined, isCurrentViewerDeletedDiv, function(err , newGameRequest) {                        

                    if(newGameRequest != null)
                    {
                        console.log("insertGameRequest'ten gelen cevap = " + newGameRequest); 
                    }
                    else
                        console.log(" ERROR !!! insert edilemedi!!!"); 
                   
                });

                setFriendChallengeQuestions(mysocket.currentTimeInSeconds, mysocket.invitinguserid , mysocket.inviteduserid, mysocket.categoryid, mysocket.categoryname, questionData, function(err , newGameQuestions) {                        

                    if(newGameQuestions != null)
                    {
                       // console.log("setFriendChallengeQuestions'ten gelen cevap = " + newGameQuestions); 
                    }
                    else
                        console.log(" ERROR !!! sorular set edilemedi!!!"); 
                   
                });

                socket.emit('gamerequest', questionData);

                /****questionların gamerequest schemasına kaydedildiği zamanki insertGameRequest bu ****** 
                                       
                    insertGameRequest(mysocket.invitingusername , mysocket.invitedusername, mysocket.categoryid, data.name , questionData);
                 // insertGameRequest() metodu GameRequests modeline yeni bir kayıt yapıyor.

                    socket.emit('gamerequest', questionData);
                                            
                /****questionların gamerequest schemasına kaydedildiği zamanki insertGameRequest bu ****** */

                }
                else
                {
                    console.log("Data is null")
                }
            });
        });

        socket.on('allCategories', function(mysocket)
        {
            //console.log('SERVER PART USERNAME ' + mysocket.username);
            getCategoryByUser(function(err, data) 
            {
                console.log("allCategories = " + JSON.stringify(data));
                io.emit('allCategories', {
                        allCategories: data,
                        image : "https://snap-photos.s3.amazonaws.com/img-thumbs/280h/GFIZG3CMEB.jpg"
                });
            });
        });


    //*********************************************************************************************************************
    //*********************************************************************************************************************
    //*********************************************************************************************************************

        socket.on('score', function(info){

            // if(scoresArray.length==0 || scoresArray[99][99]!== 'undefined'){
            if(scoresArray.length == 100)       
                createScoresArray();
                         
            var infoForRankings = { socketInfo: info.socketConnectedTo,
                                    userScore: info.score,
                                    updaterUsername: info.username,
                                    connectionIndex: info.connectionIndex,
                                    userTime: info.finalTime }

            console.log("socket.on(score) içi " + " length = " + scoresArray.length + " info.socketConnectedTo = " + info.socketConnectedTo);
            console.log(" userID =  ---->>>> " + info.userid );
            console.log(" currentTimeInSeconds  ----->>>>> " + info.currentTimeInSeconds );
            console.log("CATEGORY NAME  ----->>>>> " + info.categoryname );

            for( var i = 0, len = scoresArray.length; i < len; i++ ) { 
                
            // scoresArray = [ [theRoom, infoForRankings1, infoForRankings2, infoForRankings3], [ ], [ ], ..... ]
            // roomObject = [ theRoom, Questions ]
            
            /*  var theRoom = { 
                roomId:socketEntity.username,
                currentTimeInSeconds: socketEntity.currentTimeInSeconds
                categoryId: socketEntity.categoryId,
                numUsers:0
            }*/
                if( scoresArray[i][0].roomId === info.socketConnectedTo && scoresArray[i][0].currentTimeInSeconds === info.currentTimeInSeconds ) { 
                
                // vcvc kullanıcısı adına bir oda açıldı diyelim. ve sonra bu kullanıcı başka bir kategoride bir oda             
                // daha açtı. Bu durumda iki ayrı kategorideki odanın scorelarını aynı odaya alıyo. yani örneğin kan
                // kategorisi için vcvc'ye ait iki skor oluyor. bu yüzden roomid eşleşmesinin yanına currenttime da 
                // koydum. tabi time yerine categoryid de koysam olurdu.

                //    console.log("for içi IF İÇİ infoForRankings.connectionIndex 0 = " + infoForRankings.connectionIndex);                    
                    console.log("for içi IF İÇİ scoresArray[i] BEFORE push = " + JSON.stringify(scoresArray[i]) + 
                                 " info.socketConnectedTo = " + info.socketConnectedTo );

                    scoresArray[i].push(infoForRankings);

                    console.log("scoresArray[i] AFTER push = " + JSON.stringify(scoresArray[i]));
                    console.log("scoresArray[i] AFTER shift = " + scoresArray[i].shift);
                    
                    arrayToClient = sortScoresArray(scoresArray[i]);                        
                    var scoresArrayJson = JSON.stringify(arrayToClient);

                    findRandomChallengedGameWRoomId(info.socketConnectedTo, info.currentTimeInSeconds, function(err, game){

                        if(game != null)
                        {
                            game.usersThatDidntDeleteGame.push(info.userid);
                            game.infoForRankings.push(infoForRankings);
                            
                            console.log("infoForRankings.socketInfo = " + infoForRankings.socketInfo)
                            console.log("scoresArrayJson = " + scoresArrayJson);
                            
                            socket.join(infoForRankings.socketInfo);
                            io.to(infoForRankings.socketInfo).emit('score', {
                                scoresArray: scoresArrayJson
                            });

                            game.save(function(err) {
                                if (err){
                                    console.log(err);
                                    throw err;
                                }
                                console.log('Score Array INSERTED');                                
                            }); 

                            if(scoresArray[i].length == 4)
                            game.completed = 1;

                            console.log("****************** game START ******************"); 
                            console.log(game);
                            console.log("****************** game END ****************** ");
                        }
                        else
                            console.log(" Oyun bulanamadı !!!"); 
                    });                    

/*                  if(scoresArray[i].length == 4){ // 4 olmasının nedeni başta(scoresArray[0]) bi de username olması.
                                                  // Buraya bi de || koyup yarışmanın zaman sınırı doldugunda emit et de

                        console.log("for içi IF İÇİ infoForRankings.socketInfo = " + infoForRankings.socketInfo);

                        arrayToClient = sortScoresArray(scoresArray[i]);                        
                        var scoresArrayJson = JSON.stringify(arrayToClient);
                        
                        io.to(infoForRankings.socketInfo).emit('score', {
                                scoresArray: scoresArrayJson
                        });                        
                  }
 */                                       
                    function findRoomObject(socketos) { 
                         return socketos.roomId === info.socketConnectedTo;
                    }
                    
                    scoresArray.find(findRoomObject);                                      
                    
                    console.log("UNCOMPLETED GAME");
                    console.log("*********************** scoresArrayJson **************************");
                    console.log(scoresArrayJson);
                    console.log("*********************** scoresArray[0][1] **************************");
                    console.log(scoresArray[0][1]);
                    console.log("*********************** scoresArray[i] **************************");                    
                    console.log("for içi IF İÇİ scoresArray[i] = " + scoresArray[i]);
                   
                    break;
                }
            }                                  

            function findRoomObject(socketos) { 
                return socketos.roomId === info.socketConnectedTo;
            }
            scoresArray.find(findRoomObject);
        });

//*********************************************************************************************************************

     // RANDOM GAME CHALLENGE OYNAMA İSTEKLERİNİN İLK KISMI

        if(scoresArray.length==0)
            createScoresArray();

        socket.on('575e798ca02edd940875a65a', function(socketEntity){
            checkClientStatus(socket, socketEntity,'575e798ca02edd940875a65a');
        });
        socket.on('575e79a8a02edd940875a65b', function(socketEntity){
            checkClientStatus(socket, socketEntity,'575e79a8a02edd940875a65b');
        });
        socket.on('575fe940a02edd940875db89', function(socketEntity){
            checkClientStatus(socket, socketEntity,'575fe940a02edd940875db89');    
        });
        socket.on('5762564aa02edd940876305d', function(socketEntity){
            checkClientStatus(socket, socketEntity,'5762564aa02edd940876305d');    
        });
        socket.on('5763f85ca02edd9408766a27', function(socketEntity){
            checkClientStatus(socket, socketEntity,'5763f85ca02edd9408766a27');    
        });
        socket.on('57678127a02edd940876ec0f', function(socketEntity){         
            checkClientStatus(socket, socketEntity,'57678127a02edd940876ec0f');        
        });
        socket.on('5767b67da02edd940877394e', function(socketEntity){       
            checkClientStatus(socket, socketEntity,'5767b67da02edd940877394e');
        });
        socket.on('5768f629a02edd9408774101', function(socketEntity){       
            checkClientStatus(socket, socketEntity,'5768f629a02edd9408774101');       
        });
        socket.on('576edfde1a46fbcd0719e0fa', function(socketEntity){       
            checkClientStatus(socket, socketEntity,'576edfde1a46fbcd0719e0fa');        
        });
        socket.on('576f8de91a46fbcd071a0b2a', function(socketEntity){        
            checkClientStatus(socket, socketEntity,'576f8de91a46fbcd071a0b2a');
        });
        socket.on('576fface1a46fbcd071a9dff', function(socketEntity){       
            checkClientStatus(socket, socketEntity,'576fface1a46fbcd071a9dff');    
        });       
        socket.on('5770dc681a46fbcd071b5617', function(socketEntity){        
            checkClientStatus(socket, socketEntity,'5770dc681a46fbcd071b5617');   
        });   
});

//*********************************************************************************************************************
// RANDOM GAME CHALLENGE OYNAMA İSTEKLERİNİN DEVAM KISMI

function checkClientStatus(socket, socketEntity, categoryId){ // 2. kere aynı odaya giremesin diye. yani 
                        // bitirip ciktiği kategorideki yarışmaya tekrar girme ihtimalini yok etmek için.
     
     isClientInOngoingPlayInCategory(socketEntity.userid, categoryId, function(err, game){
        if (err){
            console.log(err);
        }
        else if(game != null)
        {   
            console.log(" (game != null) içi " + game);
            var res = {};
            console.log("Bu kategorideki oyununuz bitmedi")
            socket.emit(categoryId, {"error" : true,"message" : "Bu kategorideki oyununuz bitmedi"}); 
        }
        else if(game == null)
        {   
            console.log("game == null içi ");            
            setRoomAndScoresarraySendQuestions(socket, socketEntity, categoryId);
        }
    });
}

function setRoomAndScoresarraySendQuestions(socket, socketEntity, categoryId){

    console.log("HANDLESCORE İÇİ socketEntity.userid = " + socketEntity.userid + " categoryId = " + categoryId);

       if(categoryId == '575e798ca02edd940875a65a')
             roomObject = roomObject_575e798ca02edd940875a65a;
       else if(categoryId == '575e79a8a02edd940875a65b')
             roomObject = roomObject_575e79a8a02edd940875a65b;  
       else if(categoryId == '575fe940a02edd940875db89')
             roomObject = roomObject_575fe940a02edd940875db89;             
        else if(categoryId == '5762564aa02edd940876305d')
             roomObject = roomObject_5762564aa02edd940876305d;                                    
       else if(categoryId == '5763f85ca02edd9408766a27')
             roomObject = roomObject_5763f85ca02edd9408766a27;
       else if(categoryId == '57678127a02edd940876ec0f')
             roomObject = roomObject_57678127a02edd940876ec0f;        
       else if(categoryId == '5767b67da02edd940877394e')
             roomObject = roomObject_5767b67da02edd940877394e;
       else if(categoryId == '5768f629a02edd9408774101')
             roomObject = roomObject_5768f629a02edd9408774101;
       else if(categoryId == '576edfde1a46fbcd0719e0fa')
             roomObject = roomObject_576edfde1a46fbcd0719e0fa;
       else if(categoryId == '576f8de91a46fbcd071a0b2a')
             roomObject = roomObject_576f8de91a46fbcd071a0b2a;
       else if(categoryId == '576fface1a46fbcd071a9dff')
             roomObject = roomObject_576fface1a46fbcd071a9dff;
       else if(categoryId == '5770dc681a46fbcd071b5617')
             roomObject = roomObject_5770dc681a46fbcd071b5617;  

        console.log("HANDLESCORE İÇİ roomObject.length  = " + roomObject.length);
        console.log("HANDLESCORE İÇİ roomObject.length  = " + roomObject[0] +
        " " + roomObject[1]);
                       
        if(roomObject.length == 0 ){ // There is NOT any availble room so yeni room yarat

            console.log("There is NOT any availble room " + socketEntity.userid);
           
            var timeoutValue = 300;            
            var mycurrentTimeInSeconds = Math.round(new Date().getTime()/1000);
           
            var theRoom = { 
                roomId:socketEntity.userid, // Burdaki roomid sadece username olmamalı çünkü aynı user birden fazla yarışma açabilir.
                                         // Dolayısıyla roomid nin unique olması için client tarafından username yanında o andaki time ile gelmeli.
                currentTimeInSeconds: mycurrentTimeInSeconds,
                categoryId: socketEntity.categoryId,
                numUsers:0
            }

  //         socket.join(theRoom.roomId);
             theRoom.numUsers++;
             connectionIndx = theRoom.numUsers;

             roomObject.push(theRoom);  // roomObject = [ theRoom, Questions ]
             
           //  scoresArray[index][0] = theRoom.roomId;   // ilk kolonu yani roomId kolonunu oluşturyoruz
             scoresArray[index][0] = theRoom; 
             index++;
             scoresArray.push([]);             

          // scoresArray = [ [roomId, infoForRankings1, infoForRankings2, infoForRankings3], [ ], [ ], ..... ]

            var categoryNumber = socketEntity.categoryId;
            console.log("CATEGORY ID   ********** " + categoryNumber );
            var qNumber = 5;
            var response = {};
            var questionData = new Array(qNumber);

            getQuestionsByCategory(categoryNumber, qNumber, function(err, data) {
                if (err)
                {
                    console.log(err);
                    response = {"error" : true,"message" : "There is not any record"};
                }
                else if(data != null && (qNumber > 0))
                {
                    var allQuestions = (data._doc).questions;
                    var numQuestions = (data._doc.questions).length;
                    var rndquestnumbers = new Array(qNumber);
                    
                    rndquestnumbers = _arrayRandom(qNumber, 0, numQuestions, true);
                    for (var i = 0; i < qNumber; i++)
                    {
                        if(allQuestions != null && (qNumber <= numQuestions))
                        {
                            questionData[i] = allQuestions[rndquestnumbers[i]]._doc;
                            response = {"error" : false, "message" : questionData};
                        }
                        else
                        {
                            response = {"error" : true,"message" : "Opps some parameter is wrong"};
                        }
                    }
                }
                else
                {
                    response = {"error" : true,"message" : "There is not any response"};
                }
                // console.log("Response =  " + response);
				console.log("questions emitten once");
				console.log("*************************SORULAR**********************");
			  //  console.log(questionData);
                console.log("***********************socketEntity**********************");
				console.log(socketEntity);
            
                questionsToSent = questionData;
                roomObject[1] = (questionsToSent);

            // roomObject = [ theRoom, Questions ]

              socket.emit(categoryId, {
                      questions: questionData,
                      theRoomId: socketEntity.userid,
                      currentTimeInSeconds: theRoom.currentTimeInSeconds,
                      connectionIndex: connectionIndx 
              });
                
/*                                	
                io.to(theRoom.roomId).emit(categoryId, {
                      questions: questionData,
                      theRoomId: socketEntity.userid,
                      currentTimeInSeconds: theRoom.currentTimeInSeconds,
                      connectionIndex: connectionIndx 
                });
                */
                function getCurrentQuestions(){
                    return questionsToSent;
                }                      
            });             
            console.log("theRoom.roomId = " + theRoom.roomId  );
            console.log("Num of Users = " + theRoom.numUsers );

            var newGame = new RandomChallengedGames();
 
            newGame.roomId = theRoom.roomId;
            newGame.currentTimeInSeconds = theRoom.currentTimeInSeconds;
            newGame.categoryid = theRoom.categoryId;
            newGame.categoryname = socketEntity.categoryName;
            newGame.completed = 0;
            newGame.questionData = questionData;
            newGame.isCurrentViewerDeletedDiv = false;
            newGame.timeoutTime = mycurrentTimeInSeconds + timeoutValue;
             
            // save the user
            newGame.save(function(err) {
            if (err)
            {
                console.log(err);
                throw err;
            }

            console.log('********************* game saved and game ********************* = ');
            console.log(newGame);
            console.log('********************* game saved and game ********************* = ');
                              
            });            
         }
        
         else {   // socketEntity.username !== theRoom.roomId ---> Kullanıcının kendi açtığı odaya 2. kere girmesini önlemek için               
        
            console.log("CATEGORY ID  ELSE !!!++ ********** " + categoryId );
            
            console.log("There is availble room " + socketEntity);

            roomId = getRoomId(roomObject);
            socket.join(roomId);
            console.log("There is availble room, room id is = " + roomId);

            mycurrentTimeInSeconds = getRooomsCurrentTimeInSeconds(roomObject);

            roomObject[0].numUsers++;
            connectionIndx = roomObject[0].numUsers;

            // roomObject = [ theRoom, Questions ]
            
            console.log("Shows all the rooms " + io.sockets.adapter.rooms);
            console.log("Num of Users 2 = " + roomObject[0].numUsers);
            console.log("theRoom.roomId 2 = " + roomObject[0].roomId);

            currentQuestions = roomObject[1];
            console.log("ELSE CURRENT QUESTIONS = " + roomObject[1]);

    // *********************** ÖNEMLİ !!!!!!!!!!!!!!!!!**************************
            // Odaya her yeni biri girdiğinde odadaki herkese soruları tekrar yolluyo verimsiz bir durum bu.
            // Düzelt Bunu sonra
            io.to(roomId).emit(categoryId, {    
                    questions: currentQuestions,
                    theRoomId: roomId,
                    currentTimeInSeconds: mycurrentTimeInSeconds,
                    connectionIndex: connectionIndx 
            });   
  // *********************** ÖNEMLİ !!!!!!!!!!!!!!!!!**************************
          
            if(roomObject[0].numUsers == 3){
                 roomObject.pop();
                 roomObject.pop();
            }

            // roomObject = emptyroomObject(roomObject);
            console.log("There is availble room  = " + roomObject.length);           
         }
}
