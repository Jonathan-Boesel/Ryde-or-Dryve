// Initialize Firebase
var config = {
    apiKey: "AIzaSyAAi7s87SW5XOtn5dKwIBwEIZsY4tBZfkg",
    authDomain: "ryde-or-dryve.firebaseapp.com",
    databaseURL: "https://ryde-or-dryve.firebaseio.com",
    projectId: "ryde-or-dryve",
    storageBucket: "ryde-or-dryve.appspot.com",
    messagingSenderId: "998231386924"
};
firebase.initializeApp(config);

var startLocation = "";
var destination = "";
var mpg = "";


$("#submit").on("click", function(event) {

    var startLat = "37.7752315"; // This will be the starting latitude we get from the Google API (from the users starting address input)
    var startLong = "-122.418075"; // This will be the starting longitude...
    var endLat = "37.7752415"; // This will be the destination lattitude we get from the Google API (from the users destination input)
    var endLong = "-122.518075"; // This wil be the destination longitude...

    event.preventDefault();
    startLocation = $("#startLocation").val(); //Do we need to .trim() this? 
    destination = $("#destination").val(); // Do we need to .trim() this?
    mpg = $("#mpg").val(); // Same... .trim()?

    //if((startLocation !== "") && (destination !== "") && (mpg !== "")){

    // I'm thinking maybe we don't want to empty out the inputs, in case the user wants to go back and change one thing (I know I'm the one who put them in, just rethinking it)
    $("#startLocation").val("");
    $("#destination").val("");
    $("#mpg").val("");
    $("#message").html("");

    uberInfo(startLat, startLong, endLat, endLong); //This will call the function to get the Uber Info, using the coordinate variables created above
    lyftInfo(startLat, startLong, endLat, endLong); //Same for the lyft info function
    // }

    // else{
    //   $("#message").html("Please input all information");
    // }
});


//UBER
//============================================================================================================

function uberInfo(y, x, yy, xx) { //starting latitude=x, starting longitude = y, ending latitude = xx, ending longitude = yy

    //This token will need to be updated
    // var token = "KA.eyJ2ZXJzaW9uIjoyLCJpZCI6InlaL3ZIdkJnU05TUkZFeTdiUFZuQVE9PSIsImV4cGlyZXNfYXQiOjE1MTM1NjU1NTQsInBpcGVsaW5lX2tleV9pZCI6Ik1RPT0iLCJwaXBlbGluZV9pZCI6MX0.OiMPjfswSr6QI5IdKzHDro8udDWi4Ok0C5a1oKrO_kQ";
    var token = "JA.VUNmGAAAAAAAEgASAAAABwAIAAwAAAAAAAAAEgAAAAAAAAG8AAAAFAAAAAAADgAQAAQAAAAIAAwAAAAOAAAAkAAAABwAAAAEAAAAEAAAAHUr1ZBOSaz5yd1o3RrzlFBsAAAAhpYXyTcI8YaDu1b5miURWWkSpGNa7hD_d09Bb8PPH7A_90hQbafzbLBB1RXc4_ZbKPdbdETKEwYmrvg42QWiL73TgqUDHG6vDy_42r9Nh3m6Wx_7Y4kzDtRLhqNZbl3X0euYY7kw4UcmHCm9DAAAADSrvM3jCq3_DTOxwiQAAABiMGQ4NTgwMy0zOGEwLTQyYjMtODA2ZS03YTRjZjhlMTk2ZWU"
    // AJAX request for Uber's time estimate information    
    $.ajax({
        url: "https://api.uber.com/v1.2/estimates/time",
        method: "GET",
        data: {
            start_latitude: y,
            start_longitude: x,
            access_token: token
        },
        success: function(uberTimeResults) {
            console.log(uberTimeResults);
            //This loop will ensure we get the data for uberX, we can easily add another if statement to set a variable in case we want to an estimate for other types of uber
            for (var i = 0; i < uberTimeResults.times.length; i++) {
                if ("uberX" === uberTimeResults.times[i].display_name) {
                    var uberXindex = i;
                }
            }
            var minutesTilUber = Math.round(uberTimeResults.times[uberXindex].estimate / 60); //Minutes away of the closest Uber
            console.log("minutes til next uber: " + minutesTilUber);
        },
        error: function() {
            console.log("Uber lat long error")
        }
    });

    // AJAX request for Uber's price estimate information. This will also give us the distance and duration of the trip.
    $.ajax({
        url: "https://api.uber.com/v1.2/estimates/price",
        method: "GET",
        data: {
            start_latitude: y,
            start_longitude: x,
            end_latitude: yy,
            end_longitude: xx,
            access_token: token
        },
        success: function(uberPriceResults) {
            console.log(uberPriceResults);
            for (var i = 0; i < uberPriceResults.prices.length; i++) {
                if ("uberX" === uberPriceResults.prices[i].display_name) {
                    var uberXindex = i;
                }
            }
            var uberXprice = uberPriceResults.prices[uberXindex].estimate; //The range of the Uber Price Estimate
            var uberXdistance = uberPriceResults.prices[uberXindex].distance; // The distance of the trip in miles
            var uberXduration = Math.round(uberPriceResults.prices[uberXindex].duration / 60); //The minutes the trip will take
            var uberAverageXprice = Math.round((uberPriceResults.prices[uberXindex].high_estimate + uberPriceResults.prices[uberXindex].low_estimate) / 2); //The average of the range of prices in case we want Jim to get his way
            console.log("price range for uber: " + uberXprice);
            console.log("Distance of the trip: " + uberXdistance + " miles");
            console.log("Time the trip takes: " + uberXduration + " minutes");
            console.log("The average of the price range estimate for uber: " + uberAverageXprice);
        },
        error: function() {
            console.log("uber price estimate error")
        }
    });
}



//LYFT
//=============================================================================================================

function lyftInfo(y, x, yy, xx) {

    var lyftToken;
    // var clientId = '3TY5gGnnFF3h';
    var clientId = 'n_cPRrO1zMdw';
    // var clientSecret = 'BoWG3zPcjYe0HSqOvG4IKuIjFm5dT9hM';
    var clientSecret = 'aqcV17IK560wHaYxTm1sU7PVflpJQ70l';

    //Requests a token
    $.ajax({
        url: 'https://api.lyft.com/oauth/token',
        type: 'POST',
        data: {
            grant_type: 'client_credentials',
            scope: 'public'
        },
        beforeSend: function(xhr) {
            xhr.setRequestHeader("Authorization", "Basic " + btoa(clientId + ":" + clientSecret));
        },
        success: function(response) {
            console.log(response);
            lyftToken = response.access_token;
            console.log(lyftToken)

            //Uses token to request driver ETA information
            var lyftETAData = {
                "async": true,
                "crossDomain": true,
                "url": "https://api.lyft.com/v1/eta?lat=" + y + "&lng=" + x,
                "method": "GET",
                "headers": {
                    "authorization": "Bearer " + lyftToken
                }
            };

            $.ajax(lyftETAData).done(function(lyftTimeResults) {
                console.log(lyftTimeResults);
                for (var i = 0; i < lyftTimeResults.eta_estimates.length; i++) {
                    if ("Lyft" === lyftTimeResults.eta_estimates[i].display_name) {
                        var lyftindex = i;
                    }
                }
                var minutesTilLyft = Math.round(lyftTimeResults.eta_estimates[lyftindex].eta_seconds / 60);
                console.log("minutes til next lyft: " + minutesTilLyft);
            }).fail(function() {
                console.log('app.js time estime failed')
            });

            //Uses token to request price estimate
            var lyftPriceData = {
                "async": true,
                "crossDomain": true,
                "url": "https://api.lyft.com/v1/cost?start_lat=" + y + "&start_lng=" + x + "&end_lat=" + yy + "&end_lng=" + xx,
                "method": "GET",
                "headers": {
                    "authorization": "Bearer " + lyftToken
                }
            };

            $.ajax(lyftPriceData).done(function(lyftPriceResults) {
                console.log(lyftPriceResults);
                for (var i = 0; i < lyftPriceResults.cost_estimates.length; i++) {
                    if ("Lyft" === lyftPriceResults.cost_estimates[i].display_name) {
                        var lyftindex = i;
                    }
                }
                var lyftAveragePrice = Math.round((lyftPriceResults.cost_estimates[lyftindex].estimated_cost_cents_min + lyftPriceResults.cost_estimates[lyftindex].estimated_cost_cents_max) / 200);
                console.log("lyft average price: " + lyftAveragePrice);
                if (lyftPriceResults.cost_estimates[lyftindex].estimated_cost_cents_min !== lyftPriceResults.cost_estimates[lyftindex].estimated_cost_cents_max) {
                    var lyftPrice = "$" + Math.round(lyftPriceResults.cost_estimates[lyftindex].estimated_cost_cents_min / 100) + "-" + Math.round(lyftPriceResults.cost_estimates[lyftindex].estimated_cost_cents_max / 100);
                }
                else {
                    var lyftPrice = "$" + Math.round(lyftPriceResults.cost_estimates[lyftindex].estimated_cost_cents_min / 100);
                }
                console.log("Price estimate for lyft: " + lyftPrice);
            });


        }, //ends success
        error: function() {
            console.log('app.js lyft token request failed')
        }

    }); //ends initial AJAX request

} //ends function
