import React from 'react'
import DashLinks from '../helper-components/DashLinks'
import DashNav from '../helper-components/DashNav'
const ApplyJobs = () => {
  return (
    <div>
      <DashNav />
      <div className="grid grid-cols-[18%_auto] w-full h-[90vh]">
        <div className="bg-amber-300 ">
          <DashLinks/>
        </div>
        <div className="bg-amber-700 ">

        </div>
      </div>
    </div>
  )
}

export default ApplyJobs