/**
 * Because the properties of an item, received from the HackerNews API have multiple meanings depending
 * on the type of the item, this interface represents a more meaningfull representation of them for a story
 */
interface IStory {
    /**
     * The ID of the story (HackerNews Item)
     * 
     * @field item.id
     */
    id: number

    /**
     * The submission title
     * 
     * @field item.title
     */
    title: string

    /**
     * number of points
     * 
     * @field item.score
     */
    points: number

    /**
     * The username of the author
     * 
     * @field item.by
     */
    author: string

    /**
     * Number of comments
     * 
     * @field item.descendants
     */
    totalComments: number

    /**
     * Creation date
     * 
     * @field item.time
     */
    createdAt: number
}

export default IStory
