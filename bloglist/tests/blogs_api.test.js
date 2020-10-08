const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const api = supertest(app)
const helper = require('./test_helper')

const Blog = require('../models/blog')
const test_helper = require('./test_helper')
const { response } = require('express')

beforeEach(async()=> {
    await Blog.deleteMany({})
    const blogObjects = helper.initialBlogs.map(blog=> new Blog (blog))
    const promiseArray = blogObjects.map(blog => blog.save())
    await Promise.all(promiseArray)
})

test('blogs are returned as json', async() => {
    await api.get('/api/blogs')
        .expect(200)
        .expect('Content-Type', /application\/json/)
})

test ('unique identifier property of the blog posts is named id', async() => {
    const response = await api.get('/api/blogs')
    const ids= response.body.map(blog => blog.id)
    expect(ids).toBeDefined()
})

afterAll(() => {
    mongoose.connection.close()
})