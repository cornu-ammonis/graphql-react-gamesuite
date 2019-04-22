const express = require('express')
const bodyParser = require('body-parser')
const { graphqlExpress, graphiqlExpress } = require('apollo-server-express')
const { makeExecutableSchema } = require('graphql-tools')
const { execute, subscribe } = require('graphql')
const { createServer } = require('http')

const database = require('./database')

const PORT = process.env.PORT || 3000
const HOST = process.env.HOST || 'localhost'
