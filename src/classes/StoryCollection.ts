import * as EventEmitter from 'events'
import * as async from 'async'
import * as autobind from 'autobind-decorator'
import Story from './Story'
import now from '../helper/now'
import HackerNewsAPI from '../api/HackerNewsAPI'

const CONCURRENT_ITEM_API_REQUESTS = 500

/**
 * Mutable, API-load-aware array-subclass
 */
export default class StoryCollection {
    private stories = new Map<number, Story>()

    public readonly events: EventEmitter & StoryCollectionEventEmitter = new EventEmitter()

    constructor(...items: Story[]) {
        this.stories = StoryCollection.storyArrayToMap(items)
    }

    @autobind
    private static storyArrayToMap(stories: Story[]): Map<number, Story> {
        return stories.reduce((aku, val, idx) => {
            aku.set(val.id, val)
            return aku
        }, new Map<number, Story>())
    }

    /**
     * API: Loads all the given ids from the API and merges them into the local store
     */
    @autobind
    public async loadItemsById(...ids: number[]): Promise<void> {
        type StoryAsyncFactory = AsyncFunction<Story | undefined, Error | undefined>
        type StoryAsyncFactoryCreator = (id: number) => StoryAsyncFactory

        let cnt = 0
        let tasks: StoryAsyncFactory[] = ids.map((id => cb => {
            Story.findById(id).then(story => {
                cb(undefined, story)
                this.events.emit('fetch-item-progress', { current: cnt++, total: ids.length })
            }).catch(cb)
        }) as StoryAsyncFactoryCreator)

        const loadedStories = await new Promise<Story[]>((resolve, reject) => {
            async.parallelLimit<Story, Error>(
                tasks,
                CONCURRENT_ITEM_API_REQUESTS,
                (err, results) => {
                    if (err) {
                        reject(err)
                        return
                    }
                    resolve(results as any[])
                }
            )
        })

        console.log('loadItemsById loadedStories length', loadedStories.length)
        this.merge(...loadedStories)
    }

    /**
     * API: Reloads all stories in the local store
     */
    @autobind
    public async refreshAll(): Promise<void> {
        await this.loadItemsById(...this.stories.keys())
    }

    /**
     * API: Loads the newest stories which are not in the local store and merges them
     * into the local store.
     * Remove stories which are not in the newest stories.
     */
    @autobind
    public async mergeWithCurrentNewestStories(): Promise<void> {
        let newestStoryIds = await HackerNewsAPI.getNewestStoryIds()
        if (!newestStoryIds) {
            return
        }

        const currentStoryIds = Array.from(this.stories.keys())
        const idsToAdd = newestStoryIds.filter(x => currentStoryIds.indexOf(x) < 0)
        const idsToRemove = currentStoryIds.filter(x => !currentStoryIds.includes(x))

        console.info(`Items to add: ${idsToAdd.length}`)
        console.error(`Items to remove: ${idsToRemove.length}`)

        // load missing story items
        await this.loadItemsById(...idsToAdd)
        // remove story items which are not in the list anymore
        //this.removeItemsById(...idsToRemove)
    }

    /**
     * LOCAL: Merges the given stories into the local store
     * Instead of just overwrite the whole object this function reset each field and
     * append a new PointsTime entry to it
     */
    @autobind
    public merge(...mergeStories: Story[]) {
        //console.log(this.stories)
        for (let mergeStory of mergeStories) {
            const localStory = this.stories.get(mergeStory.id)
            if (localStory) {
                localStory.merge(mergeStory)
            } else {
                this.stories.set(mergeStory.id, mergeStory)
            }
        }
    }

    /**
     * LOCAL: Remove the given ids from the local store
     */
    @autobind
    public removeItemsById(...idsToRemove: number[]): void {
        for (let i of this.stories.keys()) {
            this.stories.delete(i)
        }
    }

    @autobind
    public getSortedByGrowthRate(): Story[] {
        const sortedStories = Array.from(this.stories.values())

        sortedStories.sort((storyA, storyB) => {
            const b = storyA.growthRate
            const a = storyB.growthRate
            return (a < b ? -1 : (a > b ? 1 : 0))
        })

        for (let index in sortedStories) {
            sortedStories[index].lastSortPosition = parseInt(index)
        }

        return sortedStories
    }
}
