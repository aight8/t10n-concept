export default now

/**
 * Helper function which always returns the unix timestamp in seconds
 */
function now() {
    return Math.round(Date.now() / 1000)
}
