'use client';

import Link from 'next/link';
import { ArrowRight, Zap, Image as ImageIcon, Code2, Palette } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 to-slate-900">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b border-slate-800 bg-slate-950/80 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Palette className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold text-white">UIBuilder</span>
          </div>
          <Link href="/editor">
            <Button className="bg-white text-slate-900 hover:bg-slate-100">
              Start Building
            </Button>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden px-4 sm:px-6 lg:px-8 py-20 sm:py-32">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-block mb-6 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20">
            <span className="text-blue-300 text-sm font-medium">AI-Powered UI Design</span>
          </div>
          
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight text-balance">
            Design Web Interfaces in Seconds
          </h1>
          
          <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto text-pretty">
            Upload an image, let AI detect UI components, drag and drop to customize, then export clean HTML. No coding required.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Link href="/editor">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white h-12 px-6 text-base">
                Launch Editor
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
            <a href="#how-it-works">
              <Button variant="outline" className="h-12 px-6 text-base border-slate-600 text-white hover:bg-slate-800">
                See How It Works
              </Button>
            </a>
          </div>

          {/* Hero Image Placeholder */}
          <div className="relative rounded-lg border border-slate-700 bg-slate-800/50 p-8 backdrop-blur">
            <div className="aspect-video bg-gradient-to-br from-slate-700 to-slate-900 rounded-lg flex items-center justify-center border border-slate-600">
              <div className="text-center">
                <Code2 className="w-12 h-12 text-slate-500 mx-auto mb-4" />
                <p className="text-slate-400">Canvas Preview</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="px-4 sm:px-6 lg:px-8 py-20 border-t border-slate-800">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-white text-center mb-16">
            Powerful Features for Modern Design
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="p-6 rounded-lg border border-slate-700 bg-slate-800/30 hover:bg-slate-800/50 transition">
              <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center mb-4">
                <ImageIcon className="w-6 h-6 text-blue-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">AI Image Recognition</h3>
              <p className="text-slate-400">
                Upload design mockups or wireframes. Our AI automatically detects buttons, inputs, cards, and more.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-6 rounded-lg border border-slate-700 bg-slate-800/30 hover:bg-slate-800/50 transition">
              <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center mb-4">
                <Palette className="w-6 h-6 text-purple-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Drag & Drop Editor</h3>
              <p className="text-slate-400">
                Customize every element. Adjust colors, sizes, text, and styling with an intuitive properties panel.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-6 rounded-lg border border-slate-700 bg-slate-800/30 hover:bg-slate-800/50 transition">
              <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center mb-4">
                <Zap className="w-6 h-6 text-green-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Export HTML</h3>
              <p className="text-slate-400">
                Download clean, production-ready HTML with inline styles. Use it immediately in your projects.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="px-4 sm:px-6 lg:px-8 py-20 border-t border-slate-800">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-white text-center mb-16">
            Simple 3-Step Process
          </h2>

          <div className="space-y-8">
            {/* Step 1 */}
            <div className="flex gap-6">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-blue-600 text-white font-bold">
                  1
                </div>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white mb-2">Upload Your Design Image</h3>
                <p className="text-slate-400">
                  Take a screenshot of a mockup, wireframe, or design. Upload it to the editor.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex gap-6">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-purple-600 text-white font-bold">
                  2
                </div>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white mb-2">AI Analyzes & Creates Components</h3>
                <p className="text-slate-400">
                  Our system detects UI elements and generates drag-droppable components on the canvas.
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex gap-6">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-green-600 text-white font-bold">
                  3
                </div>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white mb-2">Customize & Export</h3>
                <p className="text-slate-400">
                  Edit colors, text, spacing, and styling. Download clean HTML or share your design.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-4 sm:px-6 lg:px-8 py-20 border-t border-slate-800">
        <div className="max-w-4xl mx-auto bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-12 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Ready to Build?
          </h2>
          <p className="text-blue-50 mb-8 text-lg">
            Start designing your web interface with AI assistance right now.
          </p>
          <Link href="/editor">
            <Button className="bg-white text-blue-600 hover:bg-slate-100 h-12 px-8 text-base font-semibold">
              Launch Editor Now
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800 px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col sm:flex-row items-center justify-between">
            <div className="flex items-center gap-2 mb-4 sm:mb-0">
              <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg"></div>
              <span className="font-semibold text-white">UIBuilder</span>
            </div>
            <p className="text-slate-400 text-sm">
              © 2026 UIBuilder. Design smarter, code faster.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
