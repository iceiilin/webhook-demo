// Copyright 2015, EMC, Inc.

import React, { Component, PropTypes } from 'react';
import { Link } from 'react-router';

import merge from 'lodash/merge';

import Messenger from 'src-common/lib/Messenger';
import config from 'src-config';
import RackHDRestAPIv2_0 from 'src-common/messengers/RackHDRestAPIv2_0';
import ProgressEventsMessenger from 'src-common/messengers/ProgressEventsMessenger';
import AppContainer from 'src-common/views/AppContainer';
import GraphProgressTable from './GraphProgressTable';
import {LinearProgress, AppBar} from 'material-ui';
import {
    FlatButton
} from 'material-ui';

export default class App extends Component {

    constructor() {
        super();

        let self = this;

        this.tableHeaderSent = true;

        self.graphProgressCollection = {};

        console.log("Starting to monitor websocket");
        this.events = new Messenger('text', config.MonoRail_WSS);
        this.events.connect();
        this.events.on('message', msg => {

            if(! self.state.hasFirstEvent) {
                self.setState({hasFirstEvent: true});
            }

            console.log('message received: ', msg);

            self.decodeMsg(msg);

            console.log('-----graphProgressCollection', self.graphProgressCollection);

            self.setState(self.graphProgressCollection);
        });

        return this;
    }

    state = {
        hasFirstEvent: false,
        graphProgress : 0,
        graphDesc: '',
        graphName: '',
        graphId: '',
        taskProgress: 0,
        taskName: '',
        taskId: '',
        taskDesc: ''
    }

    static contextTypes = {
        muiTheme: PropTypes.any,
        router: PropTypes.any
    }

    decodeMsg = (msg) => {

        var self = this;

        let graphId = msg.graphId;
        let taskId = msg.taskProgress.taskId;

        // Get graph info
        if (!self.graphProgressCollection.hasOwnProperty(graphId)) {
            self.graphProgressCollection[graphId] = {
                graphId: msg.graphId,
                graphDesc: msg.progress.description,
                graphName: msg.graphName,
                graphProgress: parseInt(msg.progress.percentage),
                tasks: {}
            };
        }
        else {
            self.graphProgressCollection[graphId].graphProgress =
                parseInt(msg.progress.percentage);
        }

        if (self.graphProgressCollection[graphId].graphProgress < 100) {
            self.graphProgressCollection[graphId].graphStatus = "running";
        }
        else {
            self.graphProgressCollection[graphId].graphStatus = "succeeded";
        }

        if (!self.graphProgressCollection[graphId].tasks.hasOwnProperty(taskId)) {
            self.graphProgressCollection[graphId].tasks[taskId] = {
                taskName: msg.taskProgress.taskName,
                taskProgress: parseInt(msg.taskProgress.progress.percentage),
                taskDesc: msg.taskProgress.progress.description
            };
        }
        else {
            self.graphProgressCollection[graphId].tasks[taskId].taskProgress =
                parseInt(msg.taskProgress.progress.percentage);
        }

        if (self.graphProgressCollection[graphId].tasks[taskId].taskProgress < 100) {
            self.graphProgressCollection[graphId].tasks[taskId].taskStatus = "running";
        }
        else {
            self.graphProgressCollection[graphId].tasks[taskId].taskStatus = "succeeded";
        }
    }

    renderHeader = () => {
        return (
            <AppBar
                title="Tools for demo event webhook"
            />
        )
    }
    renderContent = () => {
        var self = this;

        if(! self.state.hasFirstEvent) {
            return (
                <div>
                    <FlatButton label="No notification arrive yet"/>
                </div>
            )
        }

        let graphProgressElements = [];

        let showHeader = true;

        Object.keys(self.graphProgressCollection).forEach(function(graphId){

            let graphState = self.state[graphId];

            graphProgressElements.push(
                <div>
                    <GraphProgressTable
                        key={graphId}
                        showHeader={showHeader}
                        graphData={graphState}
                    />
                </div>
            )

            showHeader = false;
        });

        return (
            <div>
                {graphProgressElements}
            </div>
        )
    }

    render(){
        return (
            <AppContainer key="app">
                {this.renderHeader()}
                {this.renderContent()}
            </AppContainer>
        )
    }
};

