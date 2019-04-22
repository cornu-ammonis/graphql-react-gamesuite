const express = require('express')
const bodyParser = require('body-parser')
const { graphqlExpress, graphiqlExpress, ApolloServer, gql } = require('apollo-server-express')
const { makeExecutableSchema } = require('graphql-tools')
const { execute, subscribe } = require('graphql')
const { createServer } = require('http')

const database = require('./database')

const PORT = process.env.PORT || 3001
const HOST = process.env.HOST || 'localhost'

const typeDefs = gql`
  type Coinflip { id: Int!, isFlipped: Boolean!, heads: Boolean }
  type Query { newCoinflip: Coinflip }
`

const resolvers = {
  Query: {
    newCoinflip: async () => {
      const result = await database('coinflip').insert({ isFlipped: false }).returning(['id', 'isFlipped'])
      const { id, isFlipped } = result[0] ;
      return { id, isFlipped} ;
    },
  }
}

const server = new ApolloServer({ typeDefs, resolvers });
const app = express();
server.applyMiddleware({ app });


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

app.listen({ port: PORT }, () =>
  console.log(`🚀 Server ready at http://localhost:3001${server.graphqlPath}`)
)
  
