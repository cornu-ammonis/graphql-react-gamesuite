import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import Coin from './Coin';
import gql from "graphql-tag";

import { ApolloProvider, Query, Mutation } from "react-apollo";
import { ApolloClient } from "apollo-client";
import { InMemoryCache } from "apollo-cache-inmemory";
import { HttpLink } from "apollo-link-http";
import { onError } from "apollo-link-error";
import { ApolloLink } from "apollo-link";
import { WebSocketLink } from "apollo-link-ws";

const host = process.env.REACT_APP_HOST || 'http://localhost:3001';
const wshost = process.env.REACT_APP_WS_HOST || 'ws://localhost:3001'

const wsLink = new WebSocketLink({
  uri: `${wshost}/graphql`,
  options: {
    reconnect: true
  }
});

const client = new ApolloClient({
  link: ApolloLink.from([
    onError(({ graphQLErrors, networkError }) => {
      if (graphQLErrors)
        graphQLErrors.map(({ message, locations, path }) =>
          console.log(
            `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`
          )
        );
      if (networkError) console.log(`[Network error]: ${networkError}`);
    }),
    wsLink,
    new HttpLink({
      uri: "http://localhost:3001/graphql",
      credentials: "same-origin"
    })
  ]),
  cache: new InMemoryCache()
});

const GET_COINFLIP_QUERY = gql`
  {
    newCoinflipSession {
      id
    }
  }
  `;

const GetCoinflipQuery = ({children}) => (
  <Query query={GET_COINFLIP_QUERY}>
    {({ loading, error, data }) => {
      if (loading)
        return (
          <div style={{ paddingTop: 20 }}>
            <div>Loading...</div>
          </div>
        );
      if (error) return <p>Error :(</p>;
      
        console.log(data)
    
      return children(data.newCoinflipSession.id)
    }}
  </Query>
);

class App extends Component {
  
  render() {
    const route = window.location.pathname.split('/')[1];

    if (route === 'coin')
      return (
        <ApolloProvider client={client}>
          <div className="App">
            <Coin/>
          </div>
        </ApolloProvider>
      );

    if (route === 'newCoin') {
     return( 
      <ApolloProvider client={client}>
        <GetCoinflipQuery>{id => <Coin id={id}/>}</GetCoinflipQuery>
      </ApolloProvider>
     );
    }

    return (
      <ApolloProvider client={client}>
        <div className="App">
          <header className="App-header">
            <img src={logo} className="App-logo" alt="logo" />
            <p>
              Edit <code>src/App.js</code> and save to reload.
            </p>
            <a
              className="App-link"
              href="https://reactjs.org"
              target="_blank"
              rel="noopener noreferrer"
            >
              Learn React
            </a>
          </header>
          <a href='/newCoin'> New Coinflip Game </a>
        </div>
      </ApolloProvider>
    );
  }
}

export default App;
