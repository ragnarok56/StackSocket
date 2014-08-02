
    var uri = "wss://qa.sockets.stackexchange.com";
    var defaultStream = "155-questions-active";

    var ws = new WebSocket(uri); 

    ws.onopen = function () { 
        console.log("connection opened");

        websocket.send(defaultStream);
    }; 
    
    ws.onmessage = function (x) { 
        console.log(JSON.parse(x.data)); 
    }

    ws.onclose = function () {
        console.log("connection closed");
    }
