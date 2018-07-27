/*
 Spacecraft.js simulates a small spacecraft generating telemetry.
*/

function Spacecraft() {
    this.state = {
        "prop.fuel": 69,
        "prop.thrusters": "OFF",
        "comms.recd": 0,
        "comms.sent": 0,
        "pwr.temp": 245,
        "pwr.c": 8.15,
        "pwr.v": 30,
        "GPS.long": 0,
        "GPS.lat": 0,
        "GPScordinates.values.longitude": 9,
        "hum.data": 0, 
        "presh.data":0,
        "atm.data":0,
        "gps.alt":0,
        

    };
    this.history = {};
    this.listeners = [];
    Object.keys(this.state).forEach(function (k) {
        this.history[k] = [];
    }, this);

    setInterval(function () {
        this.updateState();
        this.generateTelemetry();
    }.bind(this), 1000);

    console.log("Example spacecraft launched!");
    console.log("Press Enter 'thruster 1' to turn on thruster. \nPress Enter 'thruster 0' to turn off thruster. ");

    process.stdin.setEncoding('utf8');
    process.stdin.on('readable', function() {
      var chunk = process.stdin.read();

   
      if (chunk !== null){
        // process.stdin.resume();
        if (chunk.trim() === "thruster 1") {
          if (this.state['prop.thrusters'] === "ON")
          {
            console.log("Thrusters already ON");
          }else {
          this.state['prop.thrusters'] = "ON";
          this.state['comms.recd'] += 32;
          console.log("Thrusters " + this.state["prop.thrusters"]);
          // console.log("ARIEL TEST");
          // process.stdout.write('data: aslkjdfhalksdfhlaksdf');
          this.generateTelemetry();
          }
        } else if (chunk.trim() === "thruster 0") {
          if (this.state['prop.thrusters'] === "OFF")
          {
            console.log("Thrusters already off");
          }else {
            this.state['prop.thrusters'] = "OFF" ;
            this.state['comms.recd'] += 32;
            console.log("Thrusters " + this.state["prop.thrusters"]);
            this.generateTelemetry();
          }
        } else {
            process.stdout.write('end: ' + chunk);
        }
    //
    //       // console.log("ARIEL TEST");
    //       // process.stdout.write('data: aslkjdfhalksdfhlaksdf');
    //
    //     }
  }
    }.bind(this));
   
//     process.stdin.on('end',function() {
//         process.stdout.write('end: aslkjdfhalksdfhlaksdf');
// });

    // process.stdin.on('data', function () {
    //     this.state['prop.thrusters'] = (this.state['prop.thrusters'] === "OFF") ? "ON" : "OFF";
    //     this.state['comms.recd'] += 32;
    //     console.log("Thrusters " + this.state["prop.thrusters"]);
    //     this.generateTelemetry();
    // }.bind(this));
};

Spacecraft.prototype.updateState = function () {
    this.state["prop.fuel"] = Math.max(
        0,
        this.state["prop.fuel"] -
            (this.state["prop.thrusters"] === "ON" ? 0.5 : 0)
    );
    this.state["pwr.temp"] = this.state["pwr.temp"] * 0.985
        + Math.random() * 0.25 + Math.sin(Date.now());
    if (this.state["prop.thrusters"] === "ON") {
        this.state["pwr.c"] = 8.15;
    } else {
        this.state["pwr.c"] = this.state["pwr.c"] * 0.985;
    }
    this.state["pwr.v"] = 30 + Math.pow(Math.random(), 3);
    this.state["GPS.long"] = 0 + Math.pow(Math.random(), 3);
    this.state["GPS.lat"] = 1 + Math.pow(Math.random(), 6);
    this.state["hum.data"] = 0 + Math.pow(Math.random(), 3);
    this.state["presh.data"] = 0 + Math.pow(Math.random(), 3);
    this.state["gps.alt"] = 1000 + Math.pow(Math.random(), 3);
    // this.state["GPS.loc"] = 0 + Math.pow(Math.random(), 4);
    // this.state["GPS.loc.vluvalue2"] = 0 + Math.pow(Math.random(), 4);

    // this.state["GPScordinates.values.longitude"] = 555;
};

/**
 * Takes a measurement of spacecraft state, stores in history, and notifies
 * listeners.
 */
Spacecraft.prototype.generateTelemetry = function () {
    var timestamp = Date.now(), sent = 0;
    Object.keys(this.state).forEach(function (id) {
        var state = { timestamp: timestamp, value: this.state[id], id: id};
        process.stdout.write('debug: ' + state.id + ': '+state.value+ '\n');

        this.notify(state);
        this.history[id].push(state);
        this.state["comms.sent"] += JSON.stringify(state).length;
    }, this);
};


// Spacecraft.prototype.generateGPS= function () {
//     var GPS = Location.now(), sent = 0;
//     Object.keys(this.state).forEach(function (id) {
//         var state = { GPS: GPS, value: this.state[id], id: id};

//          this.notify(state);
//         this.history[id].push(state);
//     }, this);
// };



Spacecraft.prototype.notify = function (point) {
    this.listeners.forEach(function (l) {
        l(point);
    });
};

Spacecraft.prototype.listen = function (listener) {
    this.listeners.push(listener);
    return function () {
        this.listeners = this.listeners.filter(function (l) {
            return l !== listener;
        });
    }.bind(this);
};

module.exports = function () {
    return new Spacecraft()
};

