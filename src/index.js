import React from 'react';
import ReactDOM from 'react-dom';
import GraphiQL from 'graphiql';
import fetch from 'isomorphic-fetch';

// Parse the search string to get url parameters.
var search = window.location.search;
var parameters = {};
search.substr(1).split('&').forEach(function(entry) {
    var eq = entry.indexOf('=');
    if (eq >= 0) {
        parameters[decodeURIComponent(entry.slice(0, eq))] =
            decodeURIComponent(entry.slice(eq + 1));
    }
});

if (!parameters.apiUrl) {
    parameters.apiUrl = 'http://localhost:1338/api'
}

// if variables was provided, try to format it.
if (parameters.variables) {
    try {
        parameters.variables =
            JSON.stringify(JSON.parse(parameters.variables), null, 2);
    } catch (e) {
        // Do nothing, we want to display the invalid JSON as a string, rather
        // than present an error.
    }
}

// When the query and variables string is edited, update the URL bar so
// that it can be easily shared
function onEditQuery(newQuery) {
    parameters.query = newQuery;
    updateURL();
}

function onEditVariables(newVariables) {
    parameters.variables = newVariables;
    updateURL();
}

function onEditOperationName(newOperationName) {
    parameters.operationName = newOperationName;
    updateURL();
}

function updateURL() {
    var newSearch = '?' + Object.keys(parameters).filter(function(key) {
        return Boolean(parameters[key]);
    }).map(function(key) {
        return encodeURIComponent(key) + '=' +
            encodeURIComponent(parameters[key]);
    }).join('&');
    history.replaceState(null, null, newSearch);
}


console.log(parameters);

// Defines a GraphQL fetcher using the fetch API.
function graphQLFetcher(graphQLParams) {
    return fetch(parameters.apiUrl, {
        method: 'post',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(graphQLParams),
        credentials: 'include',
    }).then(function(response) {
        return response.text();
    }).then(function(responseBody) {
        try {
            return JSON.parse(responseBody);
        } catch (error) {
            return responseBody;
        }
    });
}

document.addEventListener('DOMContentLoaded', () => {
    ReactDOM.render(
        React.createElement(GraphiQL, {
            fetcher: graphQLFetcher,
            /*query: parameters.query,
            variables: parameters.variables,
            operationName: parameters.operationName,
            onEditQuery: onEditQuery,
            onEditVariables: onEditVariables,
            onEditOperationName: onEditOperationName*/
        }),
        document.getElementById('graphiql')
    );
})
