import * as express from 'express'
import StoryCollection from './classes/StoryCollection'
import Story from './classes/Story'

const app = express()

function storyToStoryResult(story: Story) {
    const { id, title, points, author, totalComments, createdAt, growthRate } = story
    return {
        id,
        title,
        points,
        author,
        totalComments,
        createdAt,
        growthRate
    }
}

app.get('/api/get_newcomer_stories', async (req, res) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');

    try {
        let stories = new StoryCollection()
        await stories.mergeWithCurrentNewestStories()
        const topStories = stories.getSortedByGrowthRate().slice(0, 10)
        const topStoryResults = topStories.map(storyToStoryResult)

        res.json({
            stories: topStoryResults
        })
    } catch (err) {
        res.json({
            error: err.message
        })
    }
})

app.listen(10600)