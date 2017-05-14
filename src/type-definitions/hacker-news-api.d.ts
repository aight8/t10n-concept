declare module HackerNewsAPI {
	interface AbstractItem {
		/** The item's unique id. */
		id: number

		/** If the item is deleted. */
		deleted: boolean

		/** The type of item */
		type: 'job' | 'story' | 'comment' | 'poll' | 'pollopt'

		/** The username of the item's author. */
		by: string

		/** Creation date of the item, in Unix Time. */
		time: number

		/** true if the item is dead. */
		dead: boolean
	}

	interface DescendantsAware {
		/** In the case of stories or polls, the total comment count. */
		descendants: number
	}

	interface ScoreAware {
		score: number
	}

	interface TextAware {
		/** The comment, story or poll text. HTML. */
		text: string
	}

	interface TitleAware {
		title: string
	}

	interface JobItem extends AbstractItem, TitleAware {
		type: 'job'
	}

	interface StoryItem extends AbstractItem, DescendantsAware, ScoreAware, TextAware, TitleAware {
		type: 'story'

		/** The URL of the story. */
		url: string
	}

	interface CommentItem extends AbstractItem, TextAware {
		type: 'comment'

		/** The comment's parent: either another comment or the relevant story. */
		parent?: number

		/** The ids of the item's comments, in ranked display order. */
		kids?: number[]
	}

	interface PollItem extends AbstractItem, DescendantsAware, TextAware, TitleAware {
		type: 'poll'

		/** A list of related pollopts, in display order. */
		parts: number[]
	}

	interface PolloptItem extends AbstractItem, ScoreAware {
		type: 'pollopt'

		/** The pollopt's associated poll. */
		poll?: number
	}

	type Item = StoryItem | StoryItem | CommentItem | PollItem | PolloptItem
}


