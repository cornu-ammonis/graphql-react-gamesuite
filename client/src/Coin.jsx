import React from 'react';
import gql from "graphql-tag";
import { ApolloProvider, Query, Mutation, Subscription } from "react-apollo";
import { ApolloClient } from "apollo-client";
import { InMemoryCache } from "apollo-cache-inmemory";
import { HttpLink } from "apollo-link-http";
import { onError } from "apollo-link-error";
import { ApolloLink } from "apollo-link";

const COINFLIP_SUBSCRIPTION = gql`
    subscription CoinflipGameSubscription($id: Int!) {
      coinFlipGame(id: $id) {
        heads
        isFlipped
      }
    }
  `

const DO_COINFLIP_MUTATION = gql`
    mutation DoCoinflipMutation($id: Int!) {
      flipCoin(id: $id)
    }
`

const FlipCoin = ({id}) => {
  return (
    <Mutation mutation={DO_COINFLIP_MUTATION} variables={ {id} }>
      {(flip) => (
        <div>
          <button onClick={() => flip()}>
            Flip Coin
          </button>
        </div>
      )}
    </Mutation>
  );
}

const CoinflipSubscription = ({id}) => (
  <Subscription
    subscription={COINFLIP_SUBSCRIPTION}
    variables={{ id }}
  >
    {({ data, loading }) => (
      <div>
        {loading && <span>waiting to flip....</span>}
        {!loading && <span>{`result: ${data.coinFlipGame.heads ? 'heads' : 'tails'}`}</span>}
      </div>
    )}
  </Subscription>
);
const Coin = props => {


  const { id } = props;
  
  console.log(id);


  return (
    <span>
      <CoinflipSubscription id={id}/>
      <FlipCoin id={id}/>
    </span>
  );
};

export default Coin;