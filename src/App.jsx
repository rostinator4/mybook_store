import { Route , Routes } from 'react-router-dom'
import { useState, useEffect } from 'react'
import './App.css'
import Header from './components/Header'
import AddBook from './components/AddBook'
import Home from './components/Home'
import About from './components/About'
import EditBook from './components/EditBook'
import BookReader from './components/BookReader'
import { supabase } from './supabaseClient'

function App() {
  useEffect(() => {
    const testConnection = async () => {
      const { data, error } = await supabase.from('Library').select('*').limit(1)
      if (error) {
        console.error("Connection Error:", error.message)
      } else {
        console.log("Supabase Connected! Data:", data)
      }
    }
    testConnection()
  }, [])

  return (
    <div>
      <Header/>
      <main style={{ paddingTop: '100px' }}> {/* Space for the fixed header */}
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/add" element={<AddBook />} />
          <Route path="/about" element={<About />} />
          <Route path="/edit/:id" element={<EditBook />} /> 
          <Route path="/read/:id" element={<BookReader />} />
        </Routes>
      </main>
    </div>
  )
}

export default App
