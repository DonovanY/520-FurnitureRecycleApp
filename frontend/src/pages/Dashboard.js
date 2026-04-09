import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabaseClient'
import api from '../api/axios'

export default function Dashboard() {
  const { user } = useAuth()
  const [backendData, setBackendData] = useState(null)

  useEffect(() => {
    const getSecretData = async () => {
      try {
        // This call automatically sends the JWT thanks to our axios.js interceptor
        const response = await api.get('/user/me')
        setBackendData(response.data)
      } catch (err) {
        console.error("Backend fetch failed", err)
      }
    }

    if (user) getSecretData()
  }, [user])

  const handleLogout = async () => {
    await supabase.auth.signOut()
  }

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Dashboard</h1>
      <p>Welcome, <strong>{user?.email}</strong></p>
      
      <div className="dashboard">
        <h1>Available Items</h1>
        <p>Dashboard - List of items would go here</p>
      </div>

      <button onClick={handleLogout} style={{ marginTop: '2rem' }}>Logout</button>
    </div>
  )
}