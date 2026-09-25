const BASE_URL = "http://localhost:5000/api/v1";
import axios from 'axios'
async function get() {
    try{
    const res = await axios.get(BASE_URL);
    console.log(res)
    }
    catch(err){
        console.log(err)
    }
}

get();