const mongoose = require('mongoose');

mongoose.set('strictQuery',true);

mongoose.connect(process.env.DATABASE_URL)
.then(()=> {
   console.log('MONGO DB IS connected');
})
.catch((error)=> {
    console.log('Filed to connect DB' + error);
})