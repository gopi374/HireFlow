
import { Link } from "react-router-dom"
import DashNav from "../helper-components/DashNav"
import DashLinks from "../helper-components/DashLinks"

const Dashboard = () => {
  return (
    <div>
      <DashNav />
      <div className="grid grid-cols-[18%_auto] w-full h-[90vh]">
        <div className="bg-blue-100 ">
          <DashLinks/>
        </div>
        <div className="bg-amber-700 ">

        </div>
      </div>
    </div>
  )
}

export default Dashboard