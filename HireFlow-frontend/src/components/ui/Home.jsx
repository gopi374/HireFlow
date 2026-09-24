import Navbar from "./Navbar"
import Footer from './Footer'
import Scroller from "./Scroller"

const Home = () => {

  return (
    <div className="bg-white text-gray-900">
      <Navbar/>

      <section id="hero" className="bg-gradient-to-br from-green-50 via-white to-blue-50">
        <div className="max-w-7xl mx-auto px-1 py-3 lg:py-3">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div>
              <span className="inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-800">
                Smart hiring starts here
              </span>

              <h1 className="mt-6 text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl lg:text-6xl">
                Find the right talent.
                <span className="block text-green-700">Hire with confidence.</span>
              </h1>

              <p className="mt-6 max-w-xl text-lg text-gray-600">
                HireFlow connects companies with top candidates faster through intelligent
                matching, streamlined hiring, and a smoother recruitment experience.
              </p>

              <div className="mt-8 flex flex-wrap gap-4">
                <a
                  href="/signup"
                  className="rounded-xl bg-green-700 px-6 py-3 text-base font-semibold text-white shadow-sm transition hover:bg-green-800"
                >
                  Post a Job
                </a>
                <a
                  href="/services"
                  className="rounded-xl border border-gray-300 bg-white px-6 py-3 text-base font-semibold text-gray-800 transition hover:bg-gray-100"
                >
                  Explore Candidates
                </a>
              </div>

              <div className="mt-10 flex flex-wrap items-center gap-8 text-sm text-gray-500">
                <div>
                  <p className="text-2xl font-bold text-gray-900">10k+</p>
                  <p>Jobs Posted</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">45k+</p>
                  <p>Active Candidates</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">96%</p>
                  <p>Hiring Success</p>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="absolute -top-6 -left-6 h-40 w-40 rounded-full bg-green-200 blur-3xl"></div>
              <div className="absolute -bottom-8 -right-8 h-40 w-40 rounded-full bg-blue-200 blur-3xl"></div>

              <div className="relative overflow-hidden rounded-3xl border border-gray-200 bg-white p-6 shadow-xl">
                <div className="rounded-2xl bg-gradient-to-br from-green-100 to-blue-100 p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Hiring Dashboard</p>
                      <h3 className="mt-2 text-2xl font-bold text-gray-900">Talent Pipeline</h3>
                    </div>
                    <div className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-green-700">
                      Live
                    </div>
                  </div>

                  <div className="mt-8 space-y-4">
                    <div className="rounded-xl bg-white p-4 shadow-sm">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-500">Frontend Developer</p>
                          <p className="mt-1 font-semibold text-gray-900">Senior React Engineer</p>
                        </div>
                        <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-700">
                          Shortlisted
                        </span>
                      </div>
                    </div>

                    <div className="rounded-xl bg-white p-4 shadow-sm">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-500">Product Manager</p>
                          <p className="mt-1 font-semibold text-gray-900">Growth Strategist</p>
                        </div>
                        <span className="rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-700">
                          Interview
                        </span>
                      </div>
                    </div>

                    <div className="rounded-xl bg-white p-4 shadow-sm">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-500">Designer</p>
                          <p className="mt-1 font-semibold text-gray-900">UI/UX Specialist</p>
                        </div>
                        <span className="rounded-full bg-yellow-100 px-2 py-1 text-xs font-medium text-yellow-700">
                          Review
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>


      <section id="working" className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-green-700">
            Why companies choose HireFlow
          </p>
          <h2 className="mt-4 text-3xl font-bold text-gray-900 sm:text-4xl">
            Hiring made faster, smarter, and simpler
          </h2>
        </div>

        <div className="mt-12 grid gap-8 md:grid-cols-3">
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-green-100 text-2xl">
              ⚡
            </div>
            <h3 className="text-xl font-semibold text-gray-900">Smart Matching</h3>
            <p className="mt-3 text-gray-600">
              Quickly connect with candidates whose skills and experience best match your role.
            </p>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-2xl">
              🎯
            </div>
            <h3 className="text-xl font-semibold text-gray-900">Top Talent</h3>
            <p className="mt-3 text-gray-600">
              Access a curated pool of qualified professionals ready for real opportunities.
            </p>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-yellow-100 text-2xl">
              📈
            </div>
            <h3 className="text-xl font-semibold text-gray-900">Fast Hiring</h3>
            <p className="mt-3 text-gray-600">
              Reduce time-to-hire with streamlined workflows, reviews, and candidate tracking.
            </p>
          </div>
        </div>
      </section>
      <Scroller/>


      <section id="services" className="bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-green-700">
              Our Services
            </p>
            <h2 className="mt-4 text-3xl font-bold text-gray-900 sm:text-4xl">
              Built to support every step of hiring
            </h2>
          </div>

          <div className="mt-12 grid gap-8 md:grid-cols-3">
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-green-100 text-2xl">
                🔎
              </div>
              <h3 className="text-xl font-semibold text-gray-900">Talent Search</h3>
              <p className="mt-3 text-gray-600">
                Find qualified professionals across multiple industries with smart, targeted talent discovery.
              </p>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-2xl">
                ✅
              </div>
              <h3 className="text-xl font-semibold text-gray-900">Candidate Screening</h3>
              <p className="mt-3 text-gray-600">
                Evaluate skills, experience, and fit faster with structured assessments and better screening tools.
              </p>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-yellow-100 text-2xl">
                🤝
              </div>
              <h3 className="text-xl font-semibold text-gray-900">Hiring Support</h3>
              <p className="mt-3 text-gray-600">
                Get hands-on support in interviewing, shortlisting, and onboarding the right candidates for your team.
              </p>
            </div>
          </div>
        </div>
      </section>

      <Footer/>
    </div>
  )
}

export default Home