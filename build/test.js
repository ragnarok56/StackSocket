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
    var Tags = React.createClass({displayName: 'Tags',
        render: function () {

            return React.DOM.div(null, this.props.items.map(function (x) { return '[' + x + ']'; }).join(' '));
        }
    });

    var Question = React.createClass({displayName: 'Question',
        render: function () {
            var item = JSON.parse(this.props.item);

            var parseDate = function (seconds) {
                var d = new Date(1970, 0, 1);
                d.setSeconds(seconds);
                return d;
            };

            return React.DOM.div({class: "question", key: item.id}, 
                    React.DOM.a({href: item.url}, unescape(item.titleEncodedFancy)), 
                    React.DOM.span({style: {margin: "0 0 0 5px"}}, React.DOM.b(null, "[", item.apiSiteParameter, "]")), 
                    React.DOM.div(null, React.DOM.small(null, parseDate(item.lastActivityDate).toISOString())), 
                    Tags({items: item.tags})
                );
                
        }
    });

    var Questions = React.createClass({displayName: 'Questions',
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
                return Question({item: data});
            };

            return React.DOM.div({class: "items"}, 
                    React.DOM.button({class: "clear", onClick: this.handleClear}, "clear"), 
                    React.DOM.h3(null, "Questions (latest updates)"), 
                    React.DOM.ul(null, this.state.questions.map(createQuestion))
                );
        }
    })

    var App = React.createClass({displayName: 'App',
        render: function () {
            return React.DOM.div({style: { margin: "10px"}}, 
                    Questions({source: this.props.source})
                )
        }
    })

    React.renderComponent(App({source: ws}), document.getElementById('mount'));

}.call(this, jQuery, Rx, React));
