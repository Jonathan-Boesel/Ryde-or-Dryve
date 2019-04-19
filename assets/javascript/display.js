$(document).ready(function() {

    /* global $ */
    /* global firebase */

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

    var db = firebase.database();

    var startLocation = "";
    var destination = "";
    var mpg = "";
    var startLat;
    var startLng;
    var destLat;
    var destLng;
    var startAddress;
    var endAddress;
    var carYear;
    var userYear;
    var userMPG;
    var classClick;

    var reset = function() {
        startLocation = "";
        destination = "";
        mpg = "";
        startLat = "";
        startLng = "";
        destLat = "";
        destLng = "";
        $("#main").show();
        $("#loading").hide();
        $("#display").hide();
        $("#startLocation").val("");
        $("#destination").val("");
        $("#mpg").val("");
        $("#locationcheck").prop("checked", false);
        $("#startLocationParent").show();
        $("#mpgParent").show();
        $("#dropdownMenu1").text("Car Year");
        $("#dropdownMenu2").text("Car Class");
        userMPG = "";
        $("#carClass").data("click", "unclicked");
        classClick = $("#carClass").data("click");
    };


    $(document).ready(function() {
        $("#carYear li a").click(function() {
            $("#dropdownMenu1").text($(this).text());
        });
    });

    $(document).ready(function() {
        $("#carClass li a").click(function() {
            $("#dropdownMenu2").text($(this).text());
        });
    });


    $(".years").on("click", function() {
        carYear = ($(this).data("year"));
        console.log(carYear);
        // db.ref().once("value", function(snapshot) {
        //     userYear = snapshot.child(carYear).val();
        //     console.log("user chose: " + JSON.stringify(userYear));
        // });
    });
    // db.ref().once("value", function(snapshot) {
    //     var carYears = snapshot.child("2017").val()
    //     console.log(carYears)
    // })

    // db.ref().once("value", function(snapshot) {
    //     var carYears = snapshot.child("2016").val()
    //     console.log(carYears)
    // })

    // db.ref().once("value", function(snapshot) {
    //     var carYears = snapshot.child("2015").val()
    //     console.log(carYears)
    // })
    $(".carClass").on("click", function() {
        var carClass = ($(this).data("class"));
        console.log(carClass);
        $("#carClass").data("click", "clicked");
        classClick = $("#carClass").data("click");
        $("#mpgParent").hide()
        console.log(classClick);
        db.ref().once("value", function(snapshot) {
            userMPG = snapshot.child(JSON.stringify(carYear) + "/" + carClass).val();
            console.log("user chose: " + JSON.stringify(userMPG));
        });
    });

    // $("carClass").on("click", function() {

    //     db.ref().once("value", function(snapshot) {
    //         var carClasses = snapshot.child(userYear + "/" + "light sedan").val()
    //         console.log(carClasses)
    //     })
    // })






    $("#arrow").hide();
    $("#display").hide();
    $("#loading").hide();
    $("#locationcheck").on("click", function() {
        if ($("#locationcheck").prop("checked")) {
            console.log("checked");
            $("#startLocationParent").hide();
        }
        if (!$("#locationcheck").prop("checked")) {
            console.log("unchecked");
            $("#startLocationParent").show();
        }
    });


    $("#submit").on("click", function(event) {
        event.preventDefault();
        startLocation = $("#startLocation").val().trim();
        console.log("start location = " + startLocation)
        destination = $("#destination").val().trim();
        mpg = $("#mpg").val();

        if (((startLocation !== "") || ($("#locationcheck").prop("checked"))) && (destination !== "") && ((mpg !== "")) || (classClick === "clicked")) {

            if (classClick === "clicked") {
                mpg = userMPG;
            }
            // waits for getStartLatLong to finish
            if (!$("#locationcheck").prop("checked")) {
                $("#main").hide();
                $("#loading").show();
                console.log("location check checked")
                getStartLatLong().done(function() {
                    console.log("click: " + startLat + ", " + startLng);
                    getDestLatLong().done(function() {
                        console.log("click: " + destLat + ", " + destLng);
                        console.log("startAddress: " + startAddress + " endAddress: " + endAddress);
                        // uberInfo(startLat, startLng, destLat, destLng);
                        // lyftInfo(startLat, startLng, destLat, destLng);
                        // $("#loading").hide();
                        // $("#display").show();
                        $.when(uberInfo(startLat, startLng, destLat, destLng), lyftInfo(startLat, startLng, destLat, destLng), getDistanceTime(startAddress, endAddress)).done(function() {
                            $("#loading").hide();
                            $("#display").show();
                        });
                    });
                });
            }
            else {
                $("#main").hide();
                $("#loading").show();
                console.log('else happened')
                getLocation(startAddress).done(function() {
                    console.log("click: " + startLat + ", " + startLng);
                    console.log("STARTADDRESS : " + startAddress);
                    getDestLatLong().done(function() {
                        console.log("click: " + destLat + ", " + destLng);
                        console.log("STARTADDRESS: " + startAddress);
                        // uberInfo(startLat, startLng, destLat, destLng);
                        // lyftInfo(startLat, startLng, destLat, destLng);
                        // $("#loading").hide();
                        // $("#display").show();
                        $.when(uberInfo(startLat, startLng, destLat, destLng), lyftInfo(startLat, startLng, destLat, destLng), getDistanceTime(startAddress, endAddress)).done(function() {
                            $("#loading").hide();
                            $("#display").show();
                        });
                    });
                });
            }
        }

        else {
            $("#message").html("Please input all information");
        }

    });

    //--------Geolocation Functions and Google API Calls-------------

    //determines geolocation from browser

    function getLocation() {
        var d1 = new $.Deferred();
        var d2 = new $.Deferred();
        console.log('getLocation started')
        var showPosition = function(position) {
            console.log('showPosition started')
            startLat = position.coords.latitude;
            startLng = position.coords.longitude;

            //Request the formatted address of the users current coordinates and puts them in formatS
            var URL = "https://maps.googleapis.com/maps/api/geocode/json?latlng=" + startLat + "," + startLng + "&key=AIzaSyB6P6KfBWOmNmMk9IRDVgl8OTmVtMmSEQk";
            $.ajax({
                url: URL,
                method: "GET"
            }).done(function(response) {
                console.log("getLocation response: " + response);
                startAddress = response.results["0"].formatted_address;
                console.log("startAddress inside getLocation" + startAddress);
                $("#formatS").html(startAddress);
                console.log(startAddress);
                $("#arrow").show();
                d1.resolve(startAddress)
            }).fail(function() {
                console.log('geoFAIL')
            });


            var tmpLatLng = {
                startLat: startLat,
                startLng: startLng,
                startAddress: startAddress
            };
            d2.resolve(tmpLatLng);
            console.log("my position: " + position.coords.latitude + "," + position.coords.longitude);
        };
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(showPosition, showError);
        }
        else {
            lattitude.innerHTML = "Geolocation is not supported by this browser.";
        }

        function showError(error) {
            switch (error.code) {
                case error.PERMISSION_DENIED:
                    alert("User denied the request for Geolocation, please refresh and try again or use destination.")
                    break;
                case error.POSITION_UNAVAILABLE:
                    alert("Location information is unavailable for your device, please refresh and try again or use destination.")
                    break;
                case error.TIMEOUT:
                    alert("The request to get user location timed out, please refresh and try again or use destination.")
                    break;
                case error.UNKNOWN_ERROR:
                    alert("An unknown error occurred, please refresh and try again or use destination.")
                    break;
            }
        }
        return $.when(d1, d2).done(function() {
            console.log('both tasks in getLocation are done');
        }).promise();
    }
    //console.logs the browser's latitude and longitude

    // function showPosition(position) {
    //     // $("#latreport").innerHTML = "Latitude: " + position.coords.latitude +
    //     //     "<br>Longitude: " + position.coords.longitude;
    //     // console.log("my position: " + position.coords.latitude + "," + position.coords.longitude);
    //     startLat = position.coords.latitude;
    //     startLng = position.coords.longitude;
    // }
    var getStartLatLong = function() {
        //var destinationAddress = $("#destination").val().trim();
        var geoLocURL = "https://maps.googleapis.com/maps/api/geocode/json?address=" + startLocation + "&key=AIzaSyB6P6KfBWOmNmMk9IRDVgl8OTmVtMmSEQk";
        var d = new $.Deferred();
        $.ajax({
            url: geoLocURL,
            method: "GET"
        }).done(function(results) {
            startAddress = results.results["0"].formatted_address;
            console.log("startAdress inside getStartLatLong" + startAddress)
            $("#formatS").html(startAddress); // + ", " + results.results["0"].address_components[3].short_name + ", " + results.results["0"].address_components[6].short_name + " ");
            $("#arrow").show();
            console.log("startLat: " + results.results["0"].geometry.location.lat);
            console.log("startlng: " + results.results["0"].geometry.location.lng);
            startLat = results.results["0"].geometry.location.lat;
            console.log("startLat var: " + startLat);
            startLng = results.results["0"].geometry.location.lng;
            console.log("startLng var: " + startLng);
            // var startAd1 = results.results["0"].address_components["0"].short_name;
            // var startAd2 = results.results["0"].address_components["1"].short_name;
            // startAddress = (startAd1 + " " + startAd2);
            // console.log("starting address: " + startAddress);
            var tmpLatLng = {
                startLat: startLat,
                startLng: startLng,
                startAddress: startAddress
            };
            d.resolve(tmpLatLng);
        });
        return d.promise();

    };
    var getDestLatLong = function() {
        //var destinationAddress = $("#destination").val().trim();
        var geoLocURL = "https://maps.googleapis.com/maps/api/geocode/json?address=" + destination + "&key=AIzaSyB6P6KfBWOmNmMk9IRDVgl8OTmVtMmSEQk";
        var d = new $.Deferred();
        $.ajax({
            url: geoLocURL,
            method: "GET"
        }).done(function(results) {
            endAddress = results.results["0"].formatted_address;
            $("#formatD").text(endAddress);
            console.log("destLat: " + results.results["0"].geometry.location.lat);
            console.log("destLng: " + results.results["0"].geometry.location.lng);
            destLat = results.results["0"].geometry.location.lat;
            console.log("destLat");
            destLng = results.results["0"].geometry.location.lng;
            // var endAd1 = results.results["0"].address_components["0"].short_name;
            // var endAd2 = results.results["0"].address_components["1"].short_name;
            // endAddress = (endAd1 + " " + endAd2);
            // console.log("destination address: " + endAddress);
            var tmpLatLng = {
                destLat: destLat,
                destLng: destLng,
                endAddress: endAddress
            };
            d.resolve(tmpLatLng);
        });
        return d.promise();
    };

    //-----------End Geo Location Functions and Google API calls

    //UBER
    //============================================================================================================

    function uberInfo(y, x, yy, xx) { //starting latitude=x, starting longitude = y, ending latitude = xx, ending longitude = yy

        //This token will need to be updated
        // var token = "KA.eyJ2ZXJzaW9uIjoyLCJpZCI6InlaL3ZIdkJnU05TUkZFeTdiUFZuQVE9PSIsImV4cGlyZXNfYXQiOjE1MTM1NjU1NTQsInBpcGVsaW5lX2tleV9pZCI6Ik1RPT0iLCJwaXBlbGluZV9pZCI6MX0.OiMPjfswSr6QI5IdKzHDro8udDWi4Ok0C5a1oKrO_kQ";
        // var token = "JA.VUNmGAAAAAAAEgASAAAABwAIAAwAAAAAAAAAEgAAAAAAAAG8AAAAFAAAAAAADgAQAAQAAAAIAAwAAAAOAAAAkAAAABwAAAAEAAAAEAAAAHM9yltJLHq46SqyGg2eFrBsAAAAJCGs_7y_cbM6-RpV15RxSV-bFwNAGDP_3s4xBsEWkrdrTKkVo-Z7DvWvcGcmleO4MEb5xACGtsHQg1B7VMRH9S7mt2zNEg6kYZJkmBLTMoFTOCniCxGhhmL1OoQScncw9ZOyRcqT3fOemcGHDAAAAPaZVkD15Hl-OBSbTSQAAABiMGQ4NTgwMy0zOGEwLTQyYjMtODA2ZS03YTRjZjhlMTk2ZWU"
        // var token = "JA.VUNmGAAAAAAAEgASAAAABwAIAAwAAAAAAAAAEgAAAAAAAAG8AAAAFAAAAAAADgAQAAQAAAAIAAwAAAAOAAAAkAAAABwAAAAEAAAAEAAAAO6FE6_EaE0zhdOuP3QoxVxsAAAAImL-9Fy60qTQWLdVFk37_5S8kFKsH56fVb-UmANJHlPAoNkwfhUxoquo3iwvDi-h4UHHxpTWtphttw2F2GVxqz_rvpDIZZrFF5UULU9SgCrcOUULQpKFXNP2_KzEPBq8SvllhXUMQWN8jTzwDAAAANM1CIaHhoBdFdoNaiQAAABiMGQ4NTgwMy0zOGEwLTQyYjMtODA2ZS03YTRjZjhlMTk2ZWU"
        var token = "JA.VUNmGAAAAAAAEgASAAAABwAIAAwAAAAAAAAAEgAAAAAAAAG8AAAAFAAAAAAADgAQAAQAAAAIAAwAAAAOAAAAkAAAABwAAAAEAAAAEAAAAI3t_iySucsl5Fp94lkKoqdsAAAAxt1exARE8HRi9OphB51CL5ePKFDLjXyt2GXNjqBRdcNvoF31IycKM6YjGzoI_CphDDNiQKCyqJeElDbcaXqfXzzZD4Fff-QEFz6nsxb6UyVmZqEwgyHDwZ-K8ky9MmqbJ_Ahx0NtubaYaa-eDAAAALkXrvRPI9qMkSlnhCQAAABiMGQ4NTgwMy0zOGEwLTQyYjMtODA2ZS03YTRjZjhlMTk2ZWU"
        var d1 = new $.Deferred();
        var d2 = new $.Deferred();
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
                    if ("UberX" === uberTimeResults.times[i].display_name) {
                        var uberXindex = i;
                    }
                }
                var minutesTilUber = Math.round(uberTimeResults.times[uberXindex].estimate / 60); //Minutes away of the closest Uber
                console.log("minutes til next uber: " + minutesTilUber);
                if (!minutesTilUber) {
                    $("#uberETA").text(" Currently there are no drivers available.");
                }
                else {
                    $("#uberETABefore").text(" A driver in your area is ");
                    $("#uberETA").text(minutesTilUber + " minutes");
                    $("#uberETAAfter").text(" away!");
                }
                d1.resolve(minutesTilUber);
            },
            error: function() {
                console.log("uber time estimate error 2")
            }
        });

        //AJAX request for Uber's price estimate information.
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
                    if ("UberX" === uberPriceResults.prices[i].display_name) {
                        var uberXindex = i;
                    }
                }
                var uberXprice = uberPriceResults.prices[uberXindex].estimate; //The range of the Uber Price Estimate
                // var uberXdistance = uberPriceResults.prices[uberXindex].distance; // The distance of the trip in miles
                // var uberXduration = Math.round(uberPriceResults.prices[uberXindex].duration / 60); //The minutes the trip will take
                var uberAverageXprice = Math.round((uberPriceResults.prices[uberXindex].high_estimate + uberPriceResults.prices[uberXindex].low_estimate) / 2); //The average of the range of prices in case we want Jim to get his way --- nice
                $("#ubercost").text(uberXprice);

                d2.resolve(uberXprice, uberAverageXprice);
            },
            error: function() {
                $("#ubercost").text("There is no price estimate available.");
                d2.resolve();
            }
        });
        return $.when(d1, d2).done(function() {
            console.log('both tasks in uberInfo are done');
        }).promise();
    }



    //LYFT
    //=============================================================================================================

    function lyftInfo(y, x, yy, xx) {

        var lyftToken;
        // var clientId = '3TY5gGnnFF3h';
        var clientId = 'n_cPRrO1zMdw';
        // var clientSecret = 'BoWG3zPcjYe0HSqOvG4IKuIjFm5dT9hM';
        var clientSecret = 'aqcV17IK560wHaYxTm1sU7PVflpJQ70l';
        var d1 = new $.Deferred();
        var d2 = new $.Deferred();

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
                console.log(lyftToken);

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
                    if (!minutesTilLyft) {
                        $("#lyftETA").text(" Currently there are no drivers available.");
                    }
                    else {
                        // $("#lyftETABefore").text(" A driver in your area is ");
                        $("#lyftETABefore").html("A driver in your area is <span id='lyftETA'>" + minutesTilLyft + " minutes</span> away!");
                        // $("#lyftETAAfter").text(" away!");
                    }
                    d1.resolve(minutesTilLyft);
                }).fail(function() {
                    var minutesTilLyft = 5
                    $("#lyftETABefore").html("A driver in your area is <span id='lyftETA'>" + minutesTilLyft + " minutes</span> away! (simulated)")
                    console.log('display.js lyft eta estimate failed')
                    d1.resolve(minutesTilLyft);
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
                    //If there is a result from the price estimate request
                    if (lyftPriceResults.cost_estimates.length > 0) {
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
                            lyftPrice = "$" + Math.round(lyftPriceResults.cost_estimates[lyftindex].estimated_cost_cents_min / 100);
                        }
                        console.log("Price estimate for lyft: " + lyftPrice);
                        $("#lyftcost").text(lyftPrice);
                        d2.resolve(lyftPrice);
                    }
                    //If there is no price estimate for the given trip request
                    else {
                        $("#lyftcost").text("No price estimate available.");
                    }
                    d2.resolve(lyftPrice);
                }).fail(function() {
                    var lyftPrice = "$25"
                    $("#lyftcost").text('$25 (simulated)')
                    console.log('display.js lyft price estime failed')
                    d2.resolve(lyftPrice)
                });


            }, //ends success
            error: function() {
                console.log('display.js lyft token request failed')
            }
        }); //ends initial AJAX request
        return $.when(d1, d2).done(function() {
            console.log('both tasks in lyftInfo are done');
        }).promise();
    } //ends function

    //reset
    $("#reset").on("click", function() {
        reset();
    });

    //This function will give us the drive distance and time from the Google Directions Service API JavaScript Library. Gas cost is also calculatd here.
    function getDistanceTime(x, y) {
        console.log("getDistanceTime function ran");
        var directionsService = new google.maps.DirectionsService();
        var request = {
            origin: x, // a city, full address, landmark etc
            destination: y,
            travelMode: google.maps.DirectionsTravelMode.DRIVING,
        };

        directionsService.route(request, function(response, status) {
            console.log("****routing****");
            if (status == google.maps.DirectionsStatus.OK) {
                console.log(response);
                var distance = response.routes[0].legs[0].distance.text;
                var duration = response.routes[0].legs[0].duration.text;
                $("#theDistance").text(distance);
                $("#theDuration").text(duration);
                //Drive Cost
                var driveDistance = parseInt(distance);
                console.log("distance: " + distance);
                var gasPrice = 2.50;
                var driveCost = (driveDistance / mpg) * gasPrice;
                console.log("**********************")
                console.log("drivecost: " + driveCost);
                console.log("mpg: " + mpg);
                console.log("***********************")
                $("#gascost").text("$" + driveCost.toFixed(2));

            }
            else {
                alert("getDistanceTime failed")
            }

        });
    }

    console.log("test");

}); //doc.ready
