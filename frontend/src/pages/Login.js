import { useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useNavigate } from 'react-router-dom'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isRegistering, setIsRegistering] = useState(false)
  const navigate = useNavigate()

  const handleAuth = async (e) => {
    e.preventDefault()
    const { error } = isRegistering 
      ? await supabase.auth.signUp({ email, password })
      : await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      alert(error.message)
    } else {
      if (isRegistering) alert('Check your email for a confirmation link!')
      else navigate('/dashboard')
    }
  }

  return (
    <div style={{ padding: '2rem' }}>
      <h1>{isRegistering ? 'Create Account' : 'Welcome Back'}</h1>
      <form onSubmit={handleAuth}>
        <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <br /><br />
        <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        <br /><br />
        <button type="submit">{isRegistering ? 'Sign Up' : 'Login'}</button>
      </form>
      <p onClick={() => setIsRegistering(!isRegistering)} style={{ cursor: 'pointer', color: 'blue' }}>
        {isRegistering ? 'Already have an account? Login' : 'Need an account? Sign Up'}
      </p>
    </div>
  )
}