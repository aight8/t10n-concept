interface StoryCollectionEventEmitter {
    on(event: 'fetch-item-progress', listener: ({ current, total }: { current: number, total: number }) => void): void
    emit(event: 'fetch-item-progress', { current, total }: { current: number, total: number }): void
}