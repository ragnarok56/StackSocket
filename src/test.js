/** @jsx React.DOM */
; (function ($, Rx, React, undefined) {
    var uri = "wss://qa.sockets.stackexchange.com";
    var defaultStream = "155-questions-active";

    var ws = new WebSocket(uri);

    var status = document.getElementById("socketStatus");

    ws.onopen = function () { 
        writeStatus("web socket connection opened");

        ws.send(defaultStream);
    }; 

    ws.onclose = function () {
        writeStatus("web socket connection closed");
    }

    ws.onerror = function () {
        writeStatus("web socket connection error");
    }

    function writeStatus(s) {
        status.innerHTML = "<p>" + s + "</p>";
    }


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
    var Tags = React.createClass({
        render: function () {

            return <div>{this.props.items.map(function (x) { return '[' + x + ']'; }).join(' ')}</div>;
        }
    });

    var Question = React.createClass({
        render: function () {
            var item = JSON.parse(this.props.item);

            var parseDate = function (seconds) {
                var d = new Date(1970, 0, 1);
                d.setSeconds(seconds);
                return d;
            };

            return <div class="question" key={item.id}>
                    <a href={item.url}>{unescape(item.titleEncodedFancy)}</a>
                    <span style={{margin: "0 0 0 5px"}}><b>[{item.apiSiteParameter}]</b></span>
                    <div><small>{parseDate(item.lastActivityDate).toISOString()}</small></div>
                    <Tags items={item.tags}/>
                </div>;
                
        }
    });

    var Questions = React.createClass({
        getInitialState: function () {
            return { questions: [] };
        },
        handleClear: function () {
            this.setState(this.getInitialState());
        },
        componentDidMount: function() {
            var component = this;

            this.props.source.onmessage = function (x) {
                var d = JSON.parse(x.data)

                var state = { 
                    questions: [d.data].concat(component.state.questions)
                };

                component.setState(state);
            }
        },
        render: function () {
            var createQuestion = function (data) {
                return <Question item={data}/>;
            };

            return <div class="items">
                    <button class="clear" onClick={this.handleClear}>clear</button>
                    <h3>Questions (latest updates)</h3>
                    <ul>{this.state.questions.map(createQuestion)}</ul>
                </div>;
        }
    })

    var App = React.createClass({
        render: function () {
            return <div style={{ margin: "10px" }} > 
                    <Questions source={this.props.source}/>
                </div>
        }
    })

    React.renderComponent(<App source={ws}/>, document.getElementById('mount'));

}.call(this, jQuery, Rx, React));
