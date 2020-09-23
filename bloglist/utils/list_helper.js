// eslint-disable-next-line no-unused-vars
const dummy = (blogs) => {
	return 1
}

const totalLikes = (blogs) => {
	let total = 0
	blogs.forEach(element => {
		total = total + element.likes
	})
	return total
}

const favouriteBlog = (blogs) => {
	if (blogs.length === 0) {
		return 0
	}
	const maxLike = Math.max.apply(Math, blogs.map(element => element.likes))
	const result = blogs.find(element => element.likes === maxLike)
	return result
}

const _ = require('lodash')
const mostBlogs = (blogs) => {
	const authorArray = blogs.map(el => el.author)
	const mostCommonAuthor = _.chain(authorArray).countBy().toPairs().max(_.last).head().value()
	const count = _.countBy(blogs, function (el) {
		return el.author === mostCommonAuthor
	})
	return  {
		author: mostCommonAuthor,
		blogs: count.true
	}
}

const mostLikes = (blogs) => {
	const authorArray = blogs.map(el => el.author)
	const mostCommonAuthor = _.chain(authorArray).countBy().toPairs().max(_.last).head().value()
	const likesArray = blogs.filter( el => el.author === mostCommonAuthor).map(el => el.likes)
	const likesTotal = likesArray.reduce((sum, likes) => sum + likes,0)
	return {
		author: mostCommonAuthor,
		likes: likesTotal
	}
}
module.exports = {
	dummy,
	totalLikes,
	favouriteBlog,
	mostBlogs,
	mostLikes
}