import React, { useEffect, useState } from 'react'
import axios from 'axios'
import DashNav from '../helper-components/DashNav'
import DashLinks from '../helper-components/DashLinks'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

const FindJobs = () => {
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const token = localStorage.getItem('token')
        const response = await axios.get(`${API_URL}/api/jobs`, {
          headers: {
            Authorization: token ? `Bearer ${token}` : undefined,
          },
        })

        const jobList = Array.isArray(response.data)
          ? response.data
          : response.data?.jobs || response.data?.data || []

        setJobs(jobList)
      } catch (err) {
        console.error('Failed to fetch jobs:', err)
        setError('Unable to load jobs right now.')
      } finally {
        setLoading(false)
      }
    }

    fetchJobs()
  }, [])

  const formatSkills = (job) => {
    if (Array.isArray(job.skills)) return job.skills
    if (Array.isArray(job.tags)) return job.tags

    if (typeof job.skills === 'string') {
      return job.skills.split(',').map((item) => item.trim()).filter(Boolean)
    }

    if (typeof job.tags === 'string') {
      return job.tags.split(',').map((item) => item.trim()).filter(Boolean)
    }

    return ['React', 'Teamwork']
  }

  return (
    <div className="min-h-screen bg-slate-100">
      <DashNav />

      <div className="grid min-h-screen grid-cols-[260px_minmax(0,1fr)]">
        <div className="sticky top-0 h-screen">
          <DashLinks role="candidate" />
        </div>

        <main className="bg-slate-100 p-6 md:p-8">
          <div className="mx-auto max-w-6xl">
            <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-sm font-medium uppercase tracking-[0.2em] text-blue-600">
                  Explore
                </p>
                <h1 className="text-3xl font-bold text-slate-900">Find Jobs</h1>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <input
                  type="text"
                  placeholder="Search jobs, skills, companies"
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 shadow-sm outline-none transition focus:border-blue-500 sm:w-80"
                />
                <button
                  type="button"
                  className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
                >
                  Search
                </button>
              </div>
            </div>

            <div className="mb-8 grid gap-4 md:grid-cols-3">
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-sm text-slate-500">Recommended</p>
                <h3 className="mt-2 text-3xl font-bold text-slate-900">{jobs.length}</h3>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-sm text-slate-500">Saved Jobs</p>
                <h3 className="mt-2 text-3xl font-bold text-slate-900">08</h3>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-sm text-slate-500">Applications</p>
                <h3 className="mt-2 text-3xl font-bold text-slate-900">12</h3>
              </div>
            </div>

            <div className="mb-6 flex flex-wrap gap-3">
              {['All', 'Remote', 'Hybrid', 'Full-time', 'Design', 'Engineering'].map((filter) => (
                <button
                  key={filter}
                  type="button"
                  className={`rounded-full border px-4 py-2 text-sm transition ${
                    filter === 'All'
                      ? 'border-blue-200 bg-blue-50 text-blue-700'
                      : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>

            {loading ? (
              <div className="rounded-2xl border border-slate-200 bg-white p-6 text-slate-600">
                Loading jobs...
              </div>
            ) : error ? (
              <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-600">
                {error}
              </div>
            ) : jobs.length === 0 ? (
              <div className="rounded-2xl border border-slate-200 bg-white p-6 text-slate-600">
                No jobs found.
              </div>
            ) : (
              <div className="space-y-5">
                {jobs.map((job, index) => {
                  const title = job.title || 'Job Title'
                  const company =
                    job.companyName ||
                    job.company ||
                    job.company_name ||
                    job.employer ||
                    'Company Name'
                  const location = job.location || job.workLocation || 'Remote'
                  const type = job.type || job.jobType || 'Full-time'
                  const experience = job.experience || '2+ years'
                  const salary = job.salary || job.salaryRange || 'Competitive'
                  const posted = job.createdAt
                    ? new Date(job.createdAt).toLocaleDateString()
                    : 'Recently'
                  const summary =
                    job.summary ||
                    job.description ||
                    'This role offers a strong opportunity to work with a growing team and build impactful products.'
                  const tags = formatSkills(job)

                  return (
                    <div
                      key={job._id || `${title}-${index}`}
                      className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md"
                    >
                      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                        <div className="flex items-start gap-4">
                          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-100 text-lg font-bold text-blue-700">
                            {String(company).slice(0, 2).toUpperCase()}
                          </div>

                          <div>
                            <h2 className="text-xl font-bold text-slate-900">{title}</h2>
                            <p className="text-sm font-medium text-slate-600">{company}</p>
                            <div className="mt-2 flex flex-wrap gap-2 text-xs text-slate-500">
                              <span>{location}</span>
                              <span>•</span>
                              <span>{type}</span>
                              <span>•</span>
                              <span>{experience}</span>
                              <span>•</span>
                              <span>{salary}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className="text-sm text-slate-500">{posted}</span>
                          <button
                            type="button"
                            className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
                          >
                            Apply Now
                          </button>
                        </div>
                      </div>

                      <p className="mt-4 text-sm leading-6 text-slate-600">{summary}</p>

                      <div className="mt-4 flex flex-wrap gap-2">
                        {tags.map((tag) => (
                          <span
                            key={`${title}-${tag}`}
                            className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}

export default FindJobs