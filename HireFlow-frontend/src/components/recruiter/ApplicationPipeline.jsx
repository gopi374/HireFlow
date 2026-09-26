import React from 'react'
import DashLinks from '../helper-components/DashLinks'
import DashNav from '../helper-components/DashNav'
const ApplicationPipeline = () => {
  return (
    <div>
      <DashNav />

      <div className="grid min-h-[90vh] w-full grid-cols-[18%_auto]">
        <DashLinks role="recruiter" />
      </div>
    </div>
  )
}

export default ApplicationPipeline