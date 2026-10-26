'use client'

import { useEffect, useRef, useState } from 'react'
import { CONTACT_ENDPOINT } from '@/lib/site'

type RequestType = 'general' | 'implementation' | 'demo'

export default function ContactForm() {
  const [requestType, setRequestType] = useState<RequestType>('general')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [company, setCompany] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  // When the form appeared. The contact endpoint quietly drops posts sent
  // faster than a person could type them.
  const shownAt = useRef(0)

  useEffect(() => {
    shownAt.current = performance.now()
  }, [])

  const typeLabel: Record<RequestType, string> = {
    general: 'General',
    implementation: 'Implementation Support',
    demo: 'Demo Request',
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')
    setSuccess(false)

    if (!name.trim() || !email.trim()) {
      setError('Name and email are required.')
      return
    }

    setLoading(true)
    try {
      const formData = new FormData(e.currentTarget)
      const companyWebsite = typeof formData.get('company_website') === 'string'
        ? String(formData.get('company_website'))
        : ''

      const normalizedRequestLabel = typeLabel[requestType]
      const normalizedCompany = company.trim()

      const composedMessage = [
        `Request Type: ${normalizedRequestLabel}`,
        normalizedCompany ? `Company: ${normalizedCompany}` : '',
        '',
        message.trim(),
      ]
        .filter(Boolean)
        .join('\n')

      const res = await fetch(CONTACT_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          message: composedMessage,
          company_website: companyWebsite,
          form_elapsed_ms: shownAt.current ? Math.round(performance.now() - shownAt.current) : undefined,
        }),
      })

      const body = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(body.error || 'Failed to submit form')

      setSuccess(true)
      shownAt.current = performance.now()
      setName('')
      setEmail('')
      setCompany('')
      setMessage('')
      setRequestType('general')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit form')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="mb-20 border border-stone-800 bg-stone-950/80 p-6 sm:mb-24 sm:p-7 md:mb-32 md:p-8 lg:mb-36">
      <div className="mb-6">
        <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-stone-500">Contact Form</p>
        <h2 className="mt-2 font-sans text-2xl font-semibold tracking-tight text-white">Send a request</h2>
        <p className="mt-2 max-w-3xl text-sm text-stone-400">
          Choose a request type and share details. This template routes to the tenant-scoped backend endpoint.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <input
          name="company_website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          className="hidden"
          aria-hidden="true"
        />
        <div>
          <label className="mb-2 block font-mono text-[11px] uppercase tracking-[0.2em] text-stone-500">
            Request Type
          </label>
          <div className="inline-flex border border-stone-800 bg-stone-950/50 p-1">
            {(['general', 'implementation', 'demo'] as RequestType[]).map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setRequestType(type)}
                className={`px-3 py-2 text-xs font-medium transition-colors ${
                  requestType === type ? 'bg-white text-black' : 'text-stone-300 hover:text-white'
                }`}
              >
                {typeLabel[type]}
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-2 block font-mono text-[11px] uppercase tracking-[0.2em] text-stone-500">Name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="Your name"
              className="w-full border border-stone-700 bg-stone-900/60 px-4 py-3 text-[14px] text-stone-100 placeholder:text-stone-600 transition-all focus:border-stone-500 focus:outline-none focus:ring-1 focus:ring-stone-600"
            />
          </div>
          <div>
            <label className="mb-2 block font-mono text-[11px] uppercase tracking-[0.2em] text-stone-500">Email</label>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              type="email"
              placeholder="you@company.com"
              className="w-full border border-stone-700 bg-stone-900/60 px-4 py-3 text-[14px] text-stone-100 placeholder:text-stone-600 transition-all focus:border-stone-500 focus:outline-none focus:ring-1 focus:ring-stone-600"
            />
          </div>
        </div>

        <div>
          <label className="mb-2 block font-mono text-[11px] uppercase tracking-[0.2em] text-stone-500">
            Company (Optional)
          </label>
          <input
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            placeholder="Company or organization"
            className="w-full border border-stone-700 bg-stone-900/60 px-4 py-3 text-[14px] text-stone-100 placeholder:text-stone-600 transition-all focus:border-stone-500 focus:outline-none focus:ring-1 focus:ring-stone-600"
          />
        </div>

        <div>
          <label className="mb-2 block font-mono text-[11px] uppercase tracking-[0.2em] text-stone-500">Message</label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={6}
            placeholder="Share a brief overview of your request..."
            className="w-full border border-stone-700 bg-stone-900/60 px-4 py-3 text-[14px] text-stone-100 placeholder:text-stone-600 transition-all focus:border-stone-500 focus:outline-none focus:ring-1 focus:ring-stone-600"
          />
        </div>

        {error && <p className="text-[13px] text-red-400">{error}</p>}
        {success && <p className="text-[13px] text-emerald-400">Message sent. We will follow up shortly.</p>}

        <div className="flex justify-end">
          <button type="submit" disabled={loading} className="btn-invert-light px-5 py-2.5 text-sm font-semibold disabled:opacity-50">
            {loading ? 'Sending...' : 'Submit Request'}
          </button>
        </div>
      </form>
    </section>
  )
}
