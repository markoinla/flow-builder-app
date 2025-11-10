import { createFileRoute, Link } from '@tanstack/react-router'
import {
  Zap,
  Server,
  Route as RouteIcon,
  Shield,
  Waves,
  Sparkles,
} from 'lucide-react'

export const Route = createFileRoute('/')({ component: App })

function App() {
  const features = [
    {
      icon: <Zap className="w-12 h-12 text-cyan-400" />,
      title: 'Interactive Flow Builder',
      description:
        'Create beautiful diagrams with drag-and-drop nodes and connections. Intuitive and powerful.',
    },
    {
      icon: <Server className="w-12 h-12 text-cyan-400" />,
      title: 'Real-time Updates',
      description:
        'See changes instantly as you build. Smooth animations and responsive interactions.',
    },
    {
      icon: <RouteIcon className="w-12 h-12 text-cyan-400" />,
      title: 'Custom Styling',
      description:
        'Customize nodes, edges, and layouts. Make your diagrams uniquely yours.',
    },
    {
      icon: <Shield className="w-12 h-12 text-cyan-400" />,
      title: 'Export & Share',
      description:
        'Save your work and share with others. Multiple export formats supported.',
    },
    {
      icon: <Waves className="w-12 h-12 text-cyan-400" />,
      title: 'Powered by React Flow',
      description:
        'Built on the industry-leading React Flow library for maximum performance.',
    },
    {
      icon: <Sparkles className="w-12 h-12 text-cyan-400" />,
      title: 'Modern Tech Stack',
      description:
        'TanStack Start, Cloudflare Workers, and cutting-edge web technologies.',
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
      <section className="relative py-20 px-6 text-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 via-blue-500/10 to-purple-500/10"></div>
        <div className="relative max-w-5xl mx-auto">
          <h1 className="text-6xl md:text-7xl font-black text-white mb-6 [letter-spacing:-0.02em]">
            <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
              Flow Builder
            </span>
          </h1>
          <p className="text-2xl md:text-3xl text-gray-300 mb-4 font-light">
            Build, style, and save beautiful diagrams
          </p>
          <p className="text-lg text-gray-400 max-w-3xl mx-auto mb-8">
            A powerful diagram builder powered by React Flow and TanStack Start.
            Create flows with an intuitive drag-and-drop interface.
          </p>
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <Link
              to="/flows"
              className="px-8 py-3 bg-cyan-500 hover:bg-cyan-600 text-white font-semibold rounded-lg transition-colors shadow-lg shadow-cyan-500/50"
            >
              My Workflows
            </Link>
            <Link
              to="/builder"
              className="px-8 py-3 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-lg transition-colors"
            >
              Open Builder
            </Link>
          </div>
        </div>
      </section>

      <section className="py-16 px-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6 hover:border-cyan-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/10"
            >
              <div className="mb-4">{feature.icon}</div>
              <h3 className="text-xl font-semibold text-white mb-3">
                {feature.title}
              </h3>
              <p className="text-gray-400 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
