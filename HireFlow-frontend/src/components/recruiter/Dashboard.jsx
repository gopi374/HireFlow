import React from 'react'
import DashNav from '../helper-components/DashNav'
import DashLinks from '../helper-components/DashLinks'

const Dashboard = () => {
  return (
    <div>
      <DashNav />

      <div className="grid min-h-[90vh] w-full grid-cols-[18%_auto]">
        <DashLinks role="recruiter" />
      </div>


      
    </div>
  )
}

export default Dashboard