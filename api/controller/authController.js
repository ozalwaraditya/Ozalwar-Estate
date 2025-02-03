export const signup = async (req, res, next) => {
    try {
        res.send("working ")
    } catch (error) {
        next(error)
    }
}