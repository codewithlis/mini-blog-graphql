const express = require('express')
const { ApolloServer, gql } = require('apollo-server-express')
const { use } = require('react')
const app = express()

const typeDefs = gql`

enum Roles{
    ADMIN
    AUTHOR
    READER
}

enum PostCategory{
    TECHNOLOGY
    EDUCATION
    LIFESTYLE
}

interface Content{
    id: ID!
    createdAt: String!
    updatedAt: String
}

type User{
    id: ID!
    name: String!
    email: String!
    posts: [Post]
    role: Roles

}

type Post implements Content{
    id: ID!
    createdAt: String!
    updatedAt: String
    title: String!
    body: String!
    author: User!
    category: PostCategory!
    comments: [Comments]
}

type Comment implements Content{
    id: ID!
    createdAt: String!
    updatedAt: String!
    text: String!
    author: User!
    post: Post!
}

input CreateUser{
    name: String!
    email: String!
    role: Role!
}

input CreatePost{
    title: String!
    body: String!
    role: Role!
    category: PostCategory!
    authorID: ID!
}

input CreateComment{
    text: String!
    authorID: ID!
    postID: ID!
}

type Query{
    getUsers: [User]
    getUserById(id: ID!): User
    getPosts(category: PostCategory): [Post]
    getPostById(id: ID!): Post
}

type Mutation{
    createUser(input: CreateUser): User
    createPost(input: CreatePost): Post
    createComment(input: createComment): Comment
}

`

let users = [
    {
        id:'1',
        name:'Dipa',
        email:'dipa@gmail.com',
        role:'AUTHOR'
    },
        {
        id:'1',
        name:'Almo',
        email:'almo@gmail.com',
        role:'READER'
    },
]

let posts = [
    {
        id: '1',
        createdAt: new Date().toISOString(),
        updatedAt: null,
        title: "GraphQl basics",
        body: "This is an introduction",
        authorId: "1",
        category: "TECHNOLOGY"

    }
]
let comments = [
    {
        id: '1',
        createdAt: new Date().toISOString(),
        updatedAt: null,
        text: 'Great article',
        authorId: '2',
        postId: '1'
    }
]

const resolvers = {
    Query:{
        getUsers: () => users,
        getUserById: (_, { id } ) => users.find(u => u.id === id),
        getPosts: (_ , { category }) => {
            return category? posts.filter((p) => p.category === category) : posts
        },
        getPostsById: (_ , { id }) => {
            posts.find((p) => p.id === id)
        }
    },
    Resolvers:{
        addUser:(_ , { input }) => {
            const newUser = { id: String(users.length + 1), ...input }
            users.push(newUser)
            return newUser
        },
        addPost:(_ , { input }) => {
            const newPost = { id: String(posts.length + 1), createdAt: new Date().toISOString() , updatedAt: null, ...input }
            posts.push(newPost)
            return newPost
        },
        addComment:(_ , { input }) => {
            const newComment = { id: String(comments.length + 1), createdAt: new Date().toISOString() , updatedAt: null, ...input }
            comments.push(newComment)
            return newComment
        }
    },
        Content: {
        __resolveType(obj){
            if (obj.title) return "Post"
            if (obj.text) return "Comment"
            return null;
        }
    },

    User:{
        posts: (parent) => posts.filter((p) => p.authorId === p.id)
    },
    Post:{
        author: (parent) => users.find((u) => u.id === parent.authorId),
        comments: (parent) => comments.filter((c) => c.postId === parent.id)
    },
    Comment:{
        author: (parent) => users.find((u) => u.id === parent.authorId),
        post: (parent) => posts.filter((p) => p.id === parent.postId)
    }
    }

    async function startServer(){
        const server = new ApolloServer({
            typeDefs,
            resolvers
        })
        await server.start()
        server.applyMiddleware({app})
        app.listen({port:4000}, () => {
            
        })
    }
    startServer()




