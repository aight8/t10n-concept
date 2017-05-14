import now from '../helper/now'
import HackerNewsAPI from '../api/HackerNewsAPI'
import IStory from '../interface/IStory'

/**
 * Represents a state/snapshot of an amount of points at a certain time
 */
export interface PointsTimeSnapshot {
    time: number
    points: number
}

/**
 * Represents a Story item on HackerNews
 */
export default class Story implements IStory {
    /**
     * @inheritdoc
     */
    public id: number

    /**
     * @inheritdoc
     */
    public title: string

    /**
     * @inheritdoc
     */
    public points: number

    /**
     * @inheritdoc
     */
    public author: string

    /**
     * @inheritdoc
     */
    public totalComments: number

    /**
     * @inheritdoc
     */
    public createdAt: number

    /**
     * All TimePoint snapshots of this story
     */
    public pointsTimeSnapshot: PointsTimeSnapshot[] = []

    public lastSortPosition: number | null | undefined

    constructor(item: IStory) {
        this.setFields(item)
        this.addTimePoints(item.points) // Add the initial TimePoints object
    }

	/**
	 * Async factory method which creates a Story object by fetching it from the API
	 */
    static async findById(id: number): Promise<Story> {
        const item = await HackerNewsAPI.getItem<HackerNewsAPI.StoryItem>(id)
        if (item instanceof Object) {
            return this.createFromApiItemObject(item)
        } else {
            throw new Error(`Story::findById returned not a json object.`)
        }
    }

	/**
	 * Story method to append a current snapshot
	 */
    public async refresh(): Promise<boolean> {
        const item = await HackerNewsAPI.getItem<HackerNewsAPI.StoryItem>(this.id)
        if (!item) {
            return false
        }
        this.merge(Story.transformStoryItemToIStory(item))
        return true
    }

    /**
     * Returns the age of the story in seconds.
     * Prevent rare server time inconsistencies for newly created items by returning 0.
     */
    get lifetime(): number {
        if (this.createdAt > now()) {
            return 0
        }
        return now() - this.createdAt
    }

    get lastRefreshTime(): number {
        return this.pointsTimeSnapshot[this.pointsTimeSnapshot.length - 1].time
    }

    get lastRefreshTimeAgo(): number {
        return now() - this.lastRefreshTime
    }

    /**
     * Returns the growth rate - points per second - since creation
     */
    get growthRate(): number {
        const lastEntry = this.pointsTimeSnapshot[this.pointsTimeSnapshot.length - 1]
        return lastEntry.points / lastEntry.time
        //return this.points / this.lifetime
    }

    /**
     * Merges all fields to the current Story object and append the TimePoints history
     */
    public merge(story: IStory): void {
        this.setFields(story)
        this.addTimePoints(story.points)
    }

    private setFields(item: IStory): void {
        this.id = item.id
        this.title = item.title
        this.points = item.points
        this.author = item.author
        this.totalComments = item.totalComments
        this.createdAt = item.createdAt
    }

	/**
     * Returns the growth rate - points per second - since creation until the given timestamp
     * 
     * @TODO getBecircCurveGrowthRateToRelativeTime
	 */
    /*public getRelativeGrowthRate(untilTimestamp: number) {
        return this.points / (untilTimestamp - this.createdAt)
    }*/

	/**
	 * Helper function
	 * As default the given points are referenced to now
	 */
    public addTimePoints(points: number, time: number = now()) {
        this.pointsTimeSnapshot.push({
            time,
            points
        })
    }

	/**
	 * Creates a Story object by the given plain object
	 */
    static createFromApiItemObject(item: HackerNewsAPI.StoryItem) {
        return new Story(Story.transformStoryItemToIStory(item))
    }

    /**
     * Transforms an Story Item received from the HackerNews API to a more meaningful plain object which also
     * represents the basic story properties of this class
     */
    public static transformStoryItemToIStory(item: HackerNewsAPI.StoryItem): IStory {
        return {
            id: item.id,
            author: item.by,
            createdAt: item.time,
            title: item.title,
            points: item.score,
            totalComments: item.descendants,
        }
    }

    toString() {
        return `${this.id}: ${this.points} "${this.title}" by "${this.author}" - lifetime: ${this.lifetime}`
    }
}
