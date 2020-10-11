const blogsRouter = require('express').Router()
const Blog = require('../models/blog')
const { initialBlogs } = require('../tests/test_helper')

blogsRouter.get('/', async (request, response) => {
	const blogs = await Blog.find({})
	response.json(blogs)
})

blogsRouter.get('/:id', (request, response, next) => {
	Blog.findById(request.params.id)
		.then(blog => {
			if (blog) {
				response.json(blog)
			} else {
				response.status(404).end()
			}
		})
		.catch(error => next(error))
})

blogsRouter.post('/', async (request, response) => {
	const body = request.body
	const blog = new Blog({
		title: body.title,
		author: body.author,
		url: body.url,
		likes: body.likes
	})
	const savedBlog = await blog.save()
	response.json(savedBlog.toJSON())
		
})

blogsRouter.delete('/:id', async(request, response) => {
	await Blog.findByIdAndRemove(request.params.id)
  	response.status(204).end()
})

blogsRouter.put('/:id', async(request, response) => {
	const body = request.body
	const blog = {
		title: body.title,
		author: body.author,
		url: body.url,
		likes: body.likes
	}

	const updatedBlog = await Blog.findByIdAndUpdate(request.params.id,blog)
    response.json(updatedBlog.toJSON())
})

module.exports = blogsRouter