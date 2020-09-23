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

module.exports = {
	dummy,
	totalLikes,
	favouriteBlog
}