/** @jsx React.DOM */
; (function ($, Rx, React, undefined) {
    
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

    var Tags = React.createClass({displayName: 'Tags',
        render: function () {
            return React.DOM.div(null, this.props.items.map(function (x) { return '[' + x + ']'; }).join(' '));
        }
    });

    var Update = React.createClass({displayName: 'Update',
        render: function () {
            var parseDate = function (seconds) {
                var d = new Date(1970, 0, 1);
                d.setSeconds(seconds);
                return d;
            };

            var item = this.props.item;

            return (
                React.DOM.div({className: "update"}, 
                    React.DOM.a({href: item.url}, unescape(item.titleEncodedFancy)), 
                    React.DOM.span({style: {margin: "0 0 0 5px"}}, React.DOM.b(null, "[", item.apiSiteParameter, "]")), 
                    React.DOM.div(null, React.DOM.small(null, parseDate(item.lastActivityDate).toISOString())), 
                    Tags({items: item.tags})
                )
            );
                
        }
    });

    var Updates = React.createClass({displayName: 'Updates',
        render: function () {
            var createUpdate = function (data) {
                return React.DOM.li({key: data.id}, Update({item: data}));
            };

            return (
                React.DOM.ul({className: "list-unstyled"}, this.props.updates.map(createUpdate))
            );
        }
    })

    var Filter = React.createClass({displayName: 'Filter',
        render: function () {
            return (
                React.DOM.form({onSubmit: this.props.onFilter}, 
                    React.DOM.input({type: "text", placeholder: "Tags", value: this.props.filterTags})
                )
            );
        }
    });

    var App = React.createClass({displayName: 'App',
        render: function () {
            return (
                React.DOM.div({style: { margin: 10}}, 
                    React.DOM.button({type: "button", className: "btn btn-primary", onClick: this.props.clear}, "Clear"), 
                    Filter({onFilter: this.props.filter}), 
                    React.DOM.h3(null, "Latest Updates"), 
                    Updates({updates: this.props.data})
                )
            );
        }   
    });

    var updates = [];

    function renderUI(data) {
        React.renderComponent(App({data: data, clear: clearUpdates, filter: filterUpdates}), document.getElementById('main'));
    }

    function filterUpdates() {

    }

    function clearUpdates() {
        updates = [];

        renderUI(updates);
    }

    // rx stuff
    

    // web socket stuff
    function fromWebSocket(address, onOpen) {
        var ws = new WebSocket(address);

        // Handle the data
        var observable = Rx.Observable.create(function (obs) {
            // Handle messages  
            ws.onmessage = obs.onNext.bind(obs);
            ws.onerror = obs.onError.bind(obs);
            ws.onclose = obs.onCompleted.bind(obs);

            // Return way to unsubscribe
            return ws.close.bind(ws);
        });

        var observer = Rx.Observer.create(function (data) {
            if (ws.readyState === WebSocket.OPEN) { 
                ws.send(data); 
            }
        });

        ws.onopen = onOpen;

        return Rx.Subject.create(observer, observable);
    }

    var uri = "wss://qa.sockets.stackexchange.com";
    var defaultStream = "155-questions-active";
    var status = document.getElementById("socketStatus");

    function writeStatus(s) {
        status.innerHTML = "<p>" + s + "</p>";
    }

    

    var wsSubject = fromWebSocket(uri, function () {
        writeStatus("web socket connection opened");

        wsSubject.onNext(defaultStream);
    });

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

}.call(this, jQuery, Rx, React));
