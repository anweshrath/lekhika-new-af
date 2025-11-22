import React, { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'

const Levels = () => {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      console.log('🔍 Fetching level_access table...')
      
      const { data, error } = await supabase
        .from('level_access')
        .select('*')
      
      console.log('📊 Query result:', { data, error })
      
      if (error) {
        console.error('❌ Error:', error)
        alert('Error: ' + error.message)
        return
      }
      
      setData(data || [])
      console.log('✅ Data loaded:', data)
      
    } catch (error) {
      console.error('❌ Catch error:', error)
      alert('Catch error: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Level Access Table</h1>
      
      <div className="mb-4">
        <button 
          onClick={fetchData}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Refresh Data
        </button>
      </div>
      
      <div className="bg-white rounded shadow">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2 text-left">Feature Name</th>
              <th className="p-2 text-left">Category</th>
              <th className="p-2 text-left">Description</th>
              <th className="p-2 text-left">Hobby</th>
              <th className="p-2 text-left">Pro</th>
              <th className="p-2 text-left">MacDaddy</th>
              <th className="p-2 text-left">BYOK</th>
              <th className="p-2 text-left">Active</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row) => (
              <tr key={row.id} className="border-b">
                <td className="p-2">{row.feature_name}</td>
                <td className="p-2">{row.feature_category}</td>
                <td className="p-2">{row.feature_description}</td>
                <td className="p-2">{row.hobby_access ? '✅' : '❌'}</td>
                <td className="p-2">{row.pro_access ? '✅' : '❌'}</td>
                <td className="p-2">{row.macdaddy_access ? '✅' : '❌'}</td>
                <td className="p-2">{row.byok_access ? '✅' : '❌'}</td>
                <td className="p-2">{row.is_active ? '✅' : '❌'}</td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {data.length === 0 && (
          <div className="p-8 text-center text-gray-500">
            No data found in level_access table
          </div>
        )}
      </div>
      
      <div className="mt-4 text-sm text-gray-600">
        Total rows: {data.length}
      </div>
    </div>
  )
}

export default Levels