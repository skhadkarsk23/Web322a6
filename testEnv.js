// testEnv.js
require('dotenv').config(); // Load environment variables

// Print out the environment variables to the console
console.log('MONGODB:', process.env.MONGODB);
console.log('PGDATABASE:', process.env.PGDATABASE);
console.log('PGUSER:', process.env.PGUSER);
console.log('PGPASSWORD:', process.env.PGPASSWORD);
console.log('PGHOST:', process.env.PGHOST);
console.log('PGPORT:', process.env.PGPORT);
