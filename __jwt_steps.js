/**
 * install json web token
 * jwt.sign(payload , secret , {expireIn} )
 * token client
 *
 *
 */

/**
 * How to store token in the client side
 * 1. Memory --> ok type
 * 2. local storage --> ok type(xss)
 * 3. cookies : http only
 */
/**
 * set cookies with http only
 * for development secure:false in the production secure:true
 * cor
 * app.use(
  cors({
    origin: ['http://localhost:5173/'], // change in the production
    credentials: true,
  })
);
 * client side axios setting
 * in axios set usercredential : true
 */
