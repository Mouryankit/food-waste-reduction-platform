const bcrypt = require('bcrypt');
async function plainToHashPassword(plainTextPassword) {
    // 12 rounds is the current recommended balance for production security and speed
    const saltRounds = 12; 
    
    // Generates salt and hashes the password in one clean asynchronous step
    const hashedPassword = await bcrypt.hash(plainTextPassword, saltRounds);
    // console.log(hashedPassword); 
    return hashedPassword;
}

module.exports = plainToHashPassword; 