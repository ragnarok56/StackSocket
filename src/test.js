import React from 'react';
import Rx from 'rxjs';
import {render} from 'react-dom';
    
/*
siteBaseHostAddress: stackoverflow.com
id: 25105700
titleEncodedFancy: How can I fetch pictures from a directory into an array?
bodySummary: I am looking for a php function to grab images from a directory and load them into an array so that I can output them automatically For example instead of creating such an array on my own: $pics = ...
tags: php
lastActivityDate: 1407080235
url: http://stackoverflow.com/questions/25105700/how-can-i-fetch-pictures-from-a-directory-into-an-array
ownerUrl: http://stackoverflow.com/users/3386046/user3386046
ownerDisplayName: user3386046
apiSiteParameter: stackoverflow
*/

// react stuff
//var Tag = React.createClass({
//    render: function () {
//        return <a href="#"
//    }
//});

var Tags = React.createClass({
    render: function () {
        return <div>{this.props.items.map(function (x) { return '[' + x + ']'; }).join(' ')}</div>;
    }
});

var Update = React.createClass({
    render: function () {
        var parseDate = function (seconds) {
            var d = new Date(1970, 0, 1);
            d.setSeconds(seconds);
            return d;
        };

        var item = this.props.item;

        return (
            <div className="update">
                <a href={item.url}>{unescape(item.titleEncodedFancy)}</a>
                <span style={{margin: "0 0 0 5px"}}><b>[{item.apiSiteParameter}]</b></span>
                <div><small>{parseDate(item.lastActivityDate).toISOString()}</small></div>
                <Tags items={item.tags}/>
            </div>
        );
            
    }
});

var Updates = React.createClass({
    render: function () {
        var createUpdate = function (data) {
            return <li key={data.id}><Update item={data}/></li>;
        };

        return (
            <ul className="list-unstyled">{this.props.updates.map(createUpdate)}</ul>
        );
    }
})

var Filter = React.createClass({
    render: function () {
        return (
            <form onSubmit={this.props.onFilter}>
                <input type="text" placeholder="Tags" value={this.props.filterTags}/>
            </form>
        );
    }
});

var App = React.createClass({
    render: function () {
        return (
            <div style={{ margin: 10 }}>
                <button type="button" className="btn btn-primary" onClick={this.props.clear}>Clear</button>
                <Filter onFilter={this.props.filter}/>
                <h3>Latest Updates</h3>
                <Updates updates={this.props.data}/>
            </div>
        );
    }   
});

var updates = [];

function renderUI(data) {
    render(<App data={data} clear={clearUpdates} filter={filterUpdates}/>, document.getElementById('main'));
}

function filterUpdates() {

}

function clearUpdates() {
    updates = [];

    renderUI(updates);
}

// rx stuff


// web socket stuff
function fromWebSocket(address) {
    var ws = new WebSocket(address);

    // Handle the data
    var observable = Rx.Observable.create(function (obs) {
        // Handle messages  
        ws.onmessage = obs.next.bind(obs);
        ws.onerror = obs.error.bind(obs);
        ws.onclose = obs.complete.bind(obs);

        // Return way to unsubscribe
        return ws.close.bind(ws);
    });

    let observer = {
        next: (data) => {
            if (ws.readyState === WebSocket.OPEN) {
                ws.send(JSON.stringify(data));
            }
        },
    };

    return Rx.Subject.create(observer, observable);
}

var uri = "wss://qa.sockets.stackexchange.com";
var defaultStream = "155-questions-active";
var status = document.getElementById("socketStatus");

function writeStatus(s) {
    status.innerHTML = "<p>" + s + "</p>";
}

var wsSubject = fromWebSocket(uri);

wsSubject.subscribe(function(x) {
    console.log("Received Message: " + x.data);

    var update = JSON.parse(JSON.parse(x.data).data);

    updates = [update].concat(updates);

    renderUI(updates);
});


// this rx stuff doesnt work really :\

//var observableUpdates = wsSubject
//    .map(function (x) {
//        console.log("Received Message");
//        return JSON.parse(x.data);
//    })
//    .where(function (x) {
//        return true;
//    })
//    .reduce(function (previous, current) {
//        var update = JSON.parse(current.data);

//        return [update].concat(previous);
//    }, updates);


//observableUpdates.subscribe(
//    function (data) {
//        console.log(data);
//        updates = data;
//        //updates = [d.data].concat(updates).map(JSON.parse);

//        renderUI(updates);
//    }, 
//    function (error) {
//        writeStatus("web socket connection error: " + error);
//    },
//    function () {
//        writeStatus("web socket connection closed");
//    }
//);

renderUI(updates);
