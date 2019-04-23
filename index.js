require("dotenv").config();

const express = require('express')
const bodyParser = require('body-parser')
const { graphqlExpress, graphiqlExpress, ApolloServer, gql } = require('apollo-server-express')
const { makeExecutableSchema } = require('graphql-tools')
const { execute, subscribe } = require('graphql')
const { createServer } = require('http')
const { PostgresPubSub } = require("graphql-postgres-subscriptions");
const path = require('path');



const database = require('./database')
const argsForPubSub = (process.env.NODE_ENV && process.env.NODE_ENV === 'production ') ?
  { connectionString: process.env.DATABASE_URL } :
  {
    user: process.env.USER,
    host: process.env.PGHOST,
    database: process.env.PGDATABASE,
    password: process.env.PGPASSWORD,
    port: process.env.PGPORT,
  };

console.log(argsForPubSub)
const pubsub = new PostgresPubSub(argsForPubSub);

const PORT = process.env.PORT || 8000
const HOST = process.env.HOST || 'localhost'

const typeDefs = gql`
  type Coinflip { id: Int!, isFlipped: Boolean!, heads: Boolean }
  type Query { newCoinflipSession: Coinflip }
  type Mutation { flipCoin(id: Int!): Boolean }
  type Subscription { coinFlipGame(id: Int!): Coinflip }
`

const resolvers = {
  Query: {
    newCoinflipSession: async () => {
      const result = await database('coinflip').insert({ isFlipped: false }).returning(['id', 'isFlipped'])
      const { id, isFlipped } = result[0] ;
      return { id, isFlipped} ;
    },
  },
  Mutation: {
    flipCoin: async (id) => {
      const heads = Math.random() >= 0.5;
      const [result] = await database('coinflip').where({id}).returning("heads").insert({ heads, isFlipped: true });
      console.log('made it to publish');
      pubsub.publish(`coinFlipped${id}`, { id: 1, heads: heads, isFlipped: true} );

      return result;
    }
  },
  Subscription: {
    coinFlipGame: {
      subscribe: (id) => pubsub.asyncIterator(`coinFlipped${id}`),
      resolve: cf => {
        console.log(cf)
        return cf
      }
    },
    
  }
}

const server = new ApolloServer({ typeDefs, resolvers, subscriptions: { keepAlive: 10000 } });
const app = express();

app.use(express.static(path.join(__dirname, '/client/build')));

server.applyMiddleware({ app });

const httpServer = createServer(app);
server.installSubscriptionHandlers(httpServer);
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname+'/client/build/index.html'));
});

httpServer.listen({ port: PORT }, () => {
  console.log('Apollo Server on http://localhost:8000/graphql');
});

