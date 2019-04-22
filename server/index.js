require("dotenv").config();

const express = require('express')
const bodyParser = require('body-parser')
const { graphqlExpress, graphiqlExpress, ApolloServer, gql } = require('apollo-server-express')
const { makeExecutableSchema } = require('graphql-tools')
const { execute, subscribe } = require('graphql')
const { createServer } = require('http')
const { PostgresPubSub } = require("graphql-postgres-subscriptions");



const database = require('./database')

const pubsub = new PostgresPubSub({
  user: process.env.USER,
  host: process.env.PGHOST,
  database: process.env.PGDATABASE,
  password: process.env.PGPASSWORD,
  port: process.env.PGPORT,
})

const PORT = process.env.PORT || 3001
const HOST = process.env.HOST || 'localhost'

const typeDefs = gql`
  type Coinflip { id: Int!, isFlipped: Boolean!, heads: Boolean }
  type Query { newCoinflip: Coinflip }
  type Mutation { flipCoin(id: Int!): Boolean }
  type Subscription { coinFlipGame(id: Int!): Coinflip }
`

const resolvers = {
  Query: {
    newCoinflip: async () => {
      const result = await database('coinflip').insert({ isFlipped: false }).returning(['id', 'isFlipped'])
      const { id, isFlipped } = result[0] ;
      console.log(process.env.PGDATABASE)
      return { id, isFlipped} ;
    },
  },
  Mutation: {
    flipCoin: async (id) => {
      const heads = Math.random() >= 0.5;
      const [result] = await database('coinflip').where({id}).returning("heads").insert({ heads, isFlipped: true });
      
      pubsub.publish(`coinFlipped${id}`, { id: 1, heads: heads, isFlipped: true} );

      return result;
    }
  },
  Subscription: {
    coinFlipGame: {
      subscribe: (id) => pubsub.asyncIterator(`coinFlipped${id}`),
      resolve: payload => {
        console.log(payload) // Shows following object:
        /* {
             id: 'cjnpwktwb008t0897dw5i78wt',
             createdAt: '2018-10-26T10:58:05.531Z',
           }
        */
        return payload
      }
    },
    
  }
}

const server = new ApolloServer({ typeDefs, resolvers });
const app = express();
server.applyMiddleware({ app });

const httpServer = createServer(app);
server.installSubscriptionHandlers(httpServer);

/*
const schema = makeExecutableSchema({
  typeDefs,
  resolvers,
})
const server = express()

server.use('/graphql', bodyParser.json(), graphqlExpress({ schema }))

server.use(
  '/graphiql',
  graphiqlExpress({
    endpointURL: '/graphql',
    subscriptionsEndpoint: `ws://${HOST}:${PORT}/subscriptions`,
  })
) */

httpServer.listen({ port: 8000 }, () => {
  console.log('Apollo Server on http://localhost:8000/graphql');
});

//app.listen({ port: PORT }, () =>
//  console.log(`🚀 Server ready at http://localhost:3001${server.graphqlPath}`)
//)
  
