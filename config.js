exports.DATABASE_URL =
    process.env.MONGODB_URI ||
    global.DATABASE_URL ||
    'mongodb://localhost/social-quotes';
exports.PORT = process.env.PORT || 8080;
exports.JWT_SECRET = process.env.JWT_SECRET;
exports.JWT_EXPIRY = process.env.JWT_EXPIRY || '7d';
exports.CLIENT_ORIGIN = "https://social-quote.netlify.com";
exports.TEST_DATABASE_URL = 'mongodb://localhost/jwt-auth-demo-test';


