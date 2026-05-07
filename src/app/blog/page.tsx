import { BookOpen, Calendar, User } from "lucide-react"

export default function BlogPage() {
  const posts = [
    {
      title: "5 Tips for Transitioning Your Loved One to Home Care",
      excerpt: "Moving from a hospital or facility back home can be stressful. Here's how to make it smoother...",
      date: "May 1, 2026",
      author: "Dr. Sarah Levin"
    },
    {
      title: "Understanding Dementia: A Guide for Families",
      excerpt: "Providing care for a family member with dementia requires patience and specific techniques...",
      date: "April 28, 2026",
      author: "Adithya Balu"
    }
  ]

  return (
    <div className="bg-slate-50 min-h-screen py-16">
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="flex items-center gap-4 mb-12">
          <BookOpen className="w-10 h-10 text-primary-600" />
          <div>
            <h1 className="text-4xl font-bold text-slate-900">CareBridge Insights</h1>
            <p className="text-slate-500">Expert advice on home care and family wellness.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {posts.map((post, i) => (
            <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
              <div className="h-48 bg-slate-200 flex items-center justify-center text-slate-400">
                <BookOpen className="w-12 h-12" />
              </div>
              <div className="p-8">
                <div className="flex items-center gap-4 text-xs text-slate-500 mb-4">
                  <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {post.date}</span>
                  <span className="flex items-center gap-1"><User className="w-3 h-3" /> {post.author}</span>
                </div>
                <h2 className="text-2xl font-bold text-slate-900 mb-4 hover:text-primary-600 cursor-pointer">{post.title}</h2>
                <p className="text-slate-600 mb-6 line-clamp-3">{post.excerpt}</p>
                <button className="text-primary-600 font-bold hover:underline">Read More →</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
