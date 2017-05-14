import * as fetch from 'isomorphic-fetch'

/**
 * Some endpoints of the HackerNews API inclusive typings
 */
export default class HackerNewsAPI {
    /**
     * The base API URL to HackerNews API (with trailing slash)
     */
    private static apiBaseUrl = 'https://hacker-news.firebaseio.com/v0/'

    /**
     * Calls the given API endpoint (prepended by the base API URL) and returns the JSON as object
     */
    private static async fetchJsonEndpoint(endpoint: string) {
        try {
            const endpointUrl = `${this.apiBaseUrl}${endpoint}`
            const response = await fetch(endpointUrl)
            return await response.json()
        } catch (err) {
            console.error(err)
        }
    }

    /**
     * Checks if the given value is an object which represents an item
     */
    private static isItemObject(value: any): boolean {
        return value instanceof Object && 'id' in value
    }

	/**
	 * Fetch details about the item with the given id
     * 
     * @example https://hacker-news.firebaseio.com/v0/item/1.json?print=pretty
	 */
    public static async getItem<R extends HackerNewsAPI.Item>(id: number): Promise<R | undefined> {
        const obj = await this.fetchJsonEndpoint(`item/${id}.json`)
        if (!HackerNewsAPI.isItemObject(obj)) {
            throw new Error(`The item with the ID "${id}" doesn't exists.`)
        }
        return obj
    }

	/**
	 * Fetch the newest 500 story IDs
     * 
     * @example https://hacker-news.firebaseio.com/v0/newstories.json?print=pretty
	 */
    public static getNewestStoryIds(): Promise<number[] | undefined> {
        return this.fetchJsonEndpoint('newstories.json')
    }
}

