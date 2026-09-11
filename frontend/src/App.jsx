import React from 'react'
import JobApplicationForm from './components/JobApplicationForm'

function Header(){
  return (
    <header className="bg-white border-b">
      <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded flex items-center justify-center text-white font-bold">3PL</div>
          <h1 className="text-lg font-semibold">Workforce Recruitment</h1>
        </div>
        <nav className="text-sm text-gray-600">Dashboard / Applications</nav>
      </div>
    </header>
  )
}

export default function App() {
  return (
    <div className="min-h-screen">
      <Header />
      <main className="max-w-6xl mx-auto p-6">
        <div className="mb-6">
          <h2 className="text-2xl font-semibold">Apply for a role</h2>
          <p className="text-gray-600">Complete the application to be considered for courier, rider, warehouse and other logistics roles.</p>
        </div>
        <JobApplicationForm hubs={[]} />
      </main>
    </div>
  )
}
