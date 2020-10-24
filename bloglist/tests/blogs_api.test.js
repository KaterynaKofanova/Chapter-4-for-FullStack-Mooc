const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const api = supertest(app)
const helper = require('./test_helper')

const Blog = require('../models/blog')
const User = require('../models/user')
const test_helper = require('./test_helper')
const { response } = require('express')

let token 
beforeEach(async()=> {
    await Blog.deleteMany({})
    const blogObjects = helper.initialBlogs.map(blog=> new Blog (blog))
    const promiseArray = blogObjects.map(blog => blog.save())
    await Promise.all(promiseArray)
    //Add user
    await User.deleteMany({})
    await api
        .post('/api/users')
        .send({ username: 'root', password: 'sekret' })
    //Login and save token
    const logged = await api.post("/api/login")
    .send({
      username: "root",
      password: "sekret"
    });
    token = logged.body.token;
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
      .set ('Authorization', `bearer ${token}`)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    const blogsAtEnd = await helper.blogsInDb()
    expect(blogsAtEnd.length).toBe(helper.initialBlogs.length + 1)
    
})

test('adding a blog fails with status code 401 if a token is not provided', async() => {
  const newBlog = {
		title: 'Go To Statement Considered Harmful',
		author: 'Edsger W. Dijkstra',
		url: 'http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html',
		likes: 5
  }
    
  await api
      .post('/api/blogs')
      .send(newBlog)
      .set ('Authorization', 'bearer')
      .expect(401)
    

  const blogsAtEnd = await helper.blogsInDb()
  expect(blogsAtEnd.length).toBe(helper.initialBlogs.length)
})

test('if likes is empty it is set to 0', async() => {
    const newBlog = {
		title: 'Go To Statement Considered Harmful',
		author: 'Edsger W. Dijkstra',
		url: 'http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html'
    }

    await api
        .post('/api/blogs')
        .send(newBlog)
        .set ('Authorization', `bearer ${token}`)
        .expect(200)
        .expect('Content-Type', /application\/json/)

    const blogsAtEnd = await helper.blogsInDb()
    const addedBlog = blogsAtEnd.filter(blog => blog.title === 'Go To Statement Considered Harmful').map(blog => blog.likes)
    expect(addedBlog[0]).toBe(0)

})

test('if title and url are missing the response is 400', async() => {
    const newBlog = {
        author: 'Edsger'
    }

    await api
        .post('/api/blogs')
        .send(newBlog)
        .set ('Authorization', `bearer ${token}`)
        .expect(400)
    
    const blogsAtEnd = await helper.blogsInDb()
    expect(blogsAtEnd.length).toBe(helper.initialBlogs.length)
})

test('delete succeeds with status code 204 if id is valid', async () => {
    const users = await User.find({})
    userID = users[0]._id
    const newBlog = {
      title: 'Go To Statement Considered Harmful',
      author: 'Edsger W. Dijkstra',
      url: 'http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html',
      likes: 5
    }
      
    await api
        .post('/api/blogs')
        .send(newBlog)
        .set ('Authorization', `bearer ${token}`)
    
    const blogsAtStart = await test_helper.blogsInDb()
    const blogToDelete = await Blog.findOne({user: userID})

    await api
      .delete(`/api/blogs/${blogToDelete.id}`)
      .set ('Authorization', `bearer ${token}`)
      .expect(204)

    const blogsAtEnd = await helper.blogsInDb()

    expect(blogsAtEnd).toHaveLength(
      blogsAtStart.length - 1
    )

    const titles = blogsAtEnd.map(blog => blog.title)

    expect(titles).not.toContain(blogToDelete.title)
  })

test('updating likes of a single blogpost is successfull', async() => {
    const updatedBlog = {   
        title: 'TDD harms architecture',
        author: 'Robert C. Martin',
        url: 'http://blog.cleancoder.com/uncle-bob/2017/03/03/TDD-Harms-Architecture.html',
        likes: 11
    }
    const blogsAtStart = await helper.blogsInDb()
    const blogToUpdate = blogsAtStart.filter(blog => blog.title === 'TDD harms architecture')[0]

    await api
        .put(`/api/blogs/${blogToUpdate.id}`)
        .send(updatedBlog)

    const blogsAtEnd = await helper.blogsInDb()
    expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length)

    const likes = blogsAtEnd.filter(blog => blog.title === 'TDD harms architecture')[0].likes
    expect(likes).toBe(11)

})

/*describe('when there is initially one user at db', () => {
    beforeEach(async () => {
      await User.deleteMany({})
      const user = new User({ username: 'root', password: 'sekret' })
      await user.save()
    })

    test('creation succeeds with a fresh username', async () => {
      const usersAtStart = await helper.usersInDb()

      const newUser = {
        username: 'mluukkai',
        name: 'Matti Luukkainen',
        password: 'salainen',
      }

      await api
        .post('/api/users')
        .send(newUser)
        .expect(200)
        .expect('Content-Type', /application\/json/)

      const usersAtEnd = await helper.usersInDb()
      expect(usersAtEnd.length).toBe(usersAtStart.length + 1)

      const usernames = usersAtEnd.map(u => u.username)
      expect(usernames).toContain(newUser.username)
    })

    test('creation fails with proper statuscode and message if username already taken', async () => {
      const usersAtStart = await helper.usersInDb()

      const newUser = {
        username: 'root',
        name: 'Superuser',
        password: 'salainen',
      }

      const result = await api
        .post('/api/users')
        .send(newUser)
        .expect(400)
        .expect('Content-Type', /application\/json/)

      expect(result.body.error).toContain('`username` to be unique')

      const usersAtEnd = await helper.usersInDb()
      expect(usersAtEnd.length).toBe(usersAtStart.length)
    })
})*/
afterAll(() => {
    mongoose.connection.close()
})