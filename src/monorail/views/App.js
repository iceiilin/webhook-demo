// Copyright 2015, EMC, Inc.

import React, { Component, PropTypes } from 'react';
// import { Link } from 'react-router';

import merge from 'lodash/merge';

import config from 'src-config';
import Messenger from 'src-common/lib/Messenger';
import AppContainer from 'src-common/views/AppContainer';
import {
    AppBar,
    FlatButton,
    Badge,
    Table,
    TableHeaderColumn,
    TableRow,
    TableHeader,
    TableRowColumn,
    TableBody,
    Divider
} from 'material-ui';

export default class App extends Component {

    constructor() {
        super();

        let self = this;

        self.eventRecords= {};
        self.newEventId = 1;

        console.log("Starting to monitor websocket");
        this.events = new Messenger('text', config.MonoRail_WSS);
        this.events.connect();
        this.events.on('message', msg => {

            console.log('message received: ', msg);

            let eventRecord = msg;
            eventRecord.createdAt = new Date();
            // eventRecord.data = msg;

            self.eventRecords[self.newEventId] = eventRecord;

            self.newEventId += 1;

            self.setState({eventRecords: self.eventRecords});
        });

        return this;
    }

    state = {
        eventRecords: {}
    }

    // static contextTypes = {
    //     muiTheme: PropTypes.any,
    //     router: PropTypes.any
    // }

    renderBar = () => {
        return (
            <AppBar
                title="Tools for event webhook demonstration"
            />
        );
    }
    renderTableHeader = () => {
            return (
                <TableHeader
                    displaySelectAll={false}
                    enableSelectAll={false}
                    adjustForCheckbox={false}
                >
                    <TableRow>
                        <TableHeaderColumn>Id</TableHeaderColumn>
                        <TableHeaderColumn>CreatedAt</TableHeaderColumn>
                        <TableHeaderColumn>Type</TableHeaderColumn>
                        <TableHeaderColumn>Type Id</TableHeaderColumn>
                        <TableHeaderColumn>Action</TableHeaderColumn>
                        <TableHeaderColumn>NodeId</TableHeaderColumn>
                        <TableHeaderColumn>Message</TableHeaderColumn>
                    </TableRow>
                </TableHeader>
            );
    }
    renderTableContent = () => {
        var self = this;
        let eventRecordElements = [];
        let eventRecords = self.state.eventRecords;
        // let eventRecords = {"1": {"time": "dafd", "message": "dafdaf"}};

        console.log(eventRecords);

        Object.keys(eventRecords).forEach(function(eventId){

            let eventRecord = eventRecords[eventId];
            let data = JSON.stringify(eventRecord, undefined, 2);
            let createdAt = JSON.stringify(eventRecord.createdAt);
            let type = eventRecord.type || '';
            let typeId = eventRecord.typeId || '';
            let action = eventRecord.action || '';
            let nodeId = eventRecord.nodeId || '';
            console.log('eventRecord', eventRecord);

            eventRecordElements.push(
            <TableRow key={eventId}>
                <TableRowColumn>{eventId}</TableRowColumn>
                <TableRowColumn>{createdAt}</TableRowColumn>
                <TableRowColumn>{type}</TableRowColumn>
                <TableRowColumn>{typeId}</TableRowColumn>
                <TableRowColumn>{action}</TableRowColumn>
                <TableRowColumn>{nodeId}</TableRowColumn>
                <TableRowColumn>
                    <pre>
                        {data}
                    </pre>
                </TableRowColumn>
            </TableRow>
            );
        });

        return (
            <TableBody displayRowCheckbox={false}>
                {eventRecordElements}
            </TableBody>
        )
    }

    render(){
        return (
            <AppContainer key="app">
                {this.renderBar()}
                <Table fixedHeader={false} style={{tableLayout: 'auto', align: 'left'}}>
                    {this.renderTableHeader()}
                    {this.renderTableContent()}
                </Table>
                <Divider />
            </AppContainer>
        )
    }
};

