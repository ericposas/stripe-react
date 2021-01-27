export const isGoogleAccount = (user) => {
    if (user === null) {
        return false
    }
    if (user.sub) {
        let matches = user.sub.match(/google/gi)
        if (matches === null) {
            return false
        } else {
            return true
        }
    }
    return 'please include a "user" param'
}