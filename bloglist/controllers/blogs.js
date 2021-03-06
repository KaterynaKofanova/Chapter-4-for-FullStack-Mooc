const blogsRouter = require('express').Router()
const Blog = require('../models/blog')
const { initialBlogs } = require('../tests/test_helper')
const User = require('../models/user')
const jwt = require('jsonwebtoken')

/*const getTokenFrom = request => {
	const authorization = request.get('authorization')
	if (authorization && authorization.toLowerCase().startsWith('bearer')){
		return authorization.substring(7)
	}
	return null
}*/

blogsRouter.get('/', async (request, response) => {
	const blogs = await Blog.find({}).populate('user', {username:1, name:1})
	response.json(blogs.map(b => b.toJSON()))
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
	const token = request.token
	if(!token){
		return response.status(401).json({
			error:'token is missing'
		})
	}

	const decodedToken = jwt.verify(token, process.env.SECRET)
	if(!decodedToken.id){
		return response.status(401).json({
			error:'token is invalid'
		})
	}
	const user = await User.findById(decodedToken.id)
	const blog = new Blog({
		title: body.title,
		author: body.author,
		url: body.url,
		likes: body.likes,
		user: user._id
	})
	const savedBlog = await blog.save()
	user.blogs = user.blogs.concat(savedBlog._id)
	await user.save()
	response.json(savedBlog.toJSON())
		
})

blogsRouter.post('/:id/comments', async(request, response) => {
	const body = request.body
	const commentedBlog = await Blog.findByIdAndUpdate(request.params.id, {$push: {"comments": body.comment}},{new: true})
	response.json(commentedBlog.toJSON())
})

blogsRouter.delete('/:id', async(request, response) => {
	const decodedToken = jwt.verify(request.token, process.env.SECRET)
	if(!request.token || !decodedToken.id){
		return response.status(401).json({
			error:'token is missing or invalid'
		})
	} 
	const blog = await Blog.findById(request.params.id)
	if (blog.user.toString() === decodedToken.id.toString()){
		await Blog.findByIdAndRemove(request.params.id)
  		return response.status(204).end()
	}
	if (blog.user.toString() !== decodedToken.id.toString()){
  		return response.status(401).json({
			  error: 'blog was created by another user'
		  })
	}
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