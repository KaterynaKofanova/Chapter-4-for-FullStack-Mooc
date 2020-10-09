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

test('making a POST request successfully creates a new blog post', async() => {
    const newBlog = {
		title: 'Go To Statement Considered Harmful',
		author: 'Edsger W. Dijkstra',
		url: 'http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html',
		likes: 5
    }
    
    await api
        .post('/api/blogs')
        .send(newBlog)
        .expect(200)
        .expect('Content-Type', /application\/json/)

    const blogsAtEnd = await helper.blogsInDb()
    expect(blogsAtEnd.length).toBe(helper.initialBlogs.length + 1)
    
})

afterAll(() => {
    mongoose.connection.close()
})