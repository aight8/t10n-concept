import Story from '../classes/Story'
import StoryCollection from '../classes/StoryCollection'

const numberFormat = Intl.NumberFormat('de-CH')

export function storyCollectionToTopRows(stories: StoryCollection) {
	const headerRow = [
		'Pos.',
		'Title',
		'Lifetime',
		'Points',
		'Author',
		'Growth rate [points/m]',
		'Refresh time ago [s]',
	]
	const dataRows = stories.getSortedByGrowthRate().slice(0, 10).map((story, index) => {
		let posChangeStr = ''

		if (story.lastSortPosition) {
			let posChang = story.lastSortPosition - index
			let color = posChang > 0 ? 'green' : posChang < 0 ? 'red' : 'grey'
			let plus = posChang > 0 ? '+' : ''
			posChangeStr = `{${color}-fg}${plus}${posChang}{/${color}-fg}`
		}

		return [
			`#${index + 1} ${posChangeStr}`,
			story.title,
			story.lifetime + '',
			story.points + '',
			story.author,
			numberFormat.format(story.growthRate * 60),
			story.lastRefreshTimeAgo + ''
		]
	})
	return {
		headerRow,
		dataRows
	}
}

