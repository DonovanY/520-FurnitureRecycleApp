// import axios from 'axios'
// import { supabase } from '../lib/supabaseClient'

// const api = axios.create({
//   baseURL: 'http://localhost:8000/api/v1'
// })

// // Request interceptor to add the JWT to every call
// api.interceptors.request.use(async (config) => {
//   const { data: { session } } = await supabase.auth.getSession()
//   if (session) {
//     config.headers.Authorization = `Bearer ${session.access_token}`
//   }
//   return config
// })

// export default api

import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8000/api/v1",
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;