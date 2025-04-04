import jwt from 'jsonwebtoken'
const secretkey = process.env.SECRET_KEY

const authenticateToken = (req, res, next) => {
    const token = req.headers.authorization

    if (!token) {
        return res.status(401).json({message: 'Token não fornecido'})
    }

    jwt.verify(token, secretkey, (error, decoded) => {
        if (error) {
            return res.status(401).json({message: 'Token Inválido'})
        }

        req.user = decoded
        next()
    })
} 

export default authenticateToken
