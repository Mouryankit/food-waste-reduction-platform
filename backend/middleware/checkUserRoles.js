
const checkAdmin = (req, res, next) => {
    if (req.user.role !== "admin") {
        return res.status(403).json({
            "message": "Access Denied: Not authorized to access this page"
        });
    }
    next();
}

const checkNgo = (req, res, next) => {
    if (req.user.role !== "ngo") {
        return res.status(403).json({
            "message": "Access Denied: Not authorized to access this page"
        });
    }
    next();
}

const checkRestaurant = (req, res, next) => {
    if (req.user.role !== "restaurant") {
        return res.status(403).json({
            "message": "Access Denied: Not authorized to access this page"
        });
    }
    next();
}

module.exports = { checkAdmin, checkNgo, checkRestaurant };

