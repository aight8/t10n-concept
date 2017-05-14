import 'source-map-support/register'
import 'loud-rejection/register'
import Story from './classes/Story'
import StoryCollection from './classes/StoryCollection'
import UI from './ui'
import * as async from 'async'
import { storyCollectionToTopRows } from './helper/formatters'

async function main() {
    const ui = new UI()
    ui.render()

    let stories = new StoryCollection()

    const updateTable = (stories: StoryCollection) => {
        const { headerRow, dataRows } = storyCollectionToTopRows(stories)
        ui.setTableData(headerRow, dataRows)
    }

    stories.events.on('fetch-item-progress', ({ current, total }: { current: number, total: number }) => {
        if ((current % 30) === 0) {
            ui.setProgress(total, current)
        }
    })
    await stories.mergeWithCurrentNewestStories()

    updateTable(stories)

    while (true) {
        await stories.mergeWithCurrentNewestStories()
        await stories.refreshAll()
        updateTable(stories)
    }
}

main()
