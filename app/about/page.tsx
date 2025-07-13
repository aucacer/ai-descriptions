"use client"

import { Button } from "@/components/ui/button"
import { ArrowLeft, Sparkles } from "lucide-react"

export default function About() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header with Back Button */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-2 rounded-lg">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">AI Description Generator</h1>
                <p className="text-sm text-gray-600">About Our Service</p>
              </div>
            </div>
            <Button 
              onClick={() => window.location.href = '/'}
              variant="outline" 
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Generator
            </Button>
          </div>
        </div>
      </header>
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">About AI Description Generator</h1>
        
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-semibold mb-4">Our Mission</h2>
          <p className="text-gray-700 mb-6">
            AI Description Generator was created to help eBay sellers, entrepreneurs, and online merchants 
            create professional, SEO-optimized product descriptions in minutes instead of hours. We believe 
            that powerful AI tools should be accessible to everyone, regardless of technical expertise.
          </p>
          
          <h2 className="text-2xl font-semibold mb-4">How It Works</h2>
          <p className="text-gray-700 mb-6">
            Our advanced AI system researches your product across multiple data sources, analyzes market 
            trends, and generates compelling descriptions that are optimized for search engines and designed 
            to convert browsers into buyers. The tool automatically formats your descriptions into clean, 
            professional HTML that's ready to paste directly into your eBay listings.
          </p>
          
          <h2 className="text-2xl font-semibold mb-4">Why Choose Us</h2>
          <ul className="list-disc list-inside text-gray-700 space-y-2 mb-6">
            <li>AI-powered research from multiple sources</li>
            <li>SEO optimization built-in</li>
            <li>Professional HTML formatting</li>
            <li>Mobile-responsive designs</li>
            <li>Time-saving automation</li>
            <li>No technical skills required</li>
          </ul>
          
          <h2 className="text-2xl font-semibold mb-4">Our Technology</h2>
          <p className="text-gray-700">
            We leverage cutting-edge artificial intelligence and machine learning technologies to understand 
            product categories, market dynamics, and consumer behavior. Our system continuously learns and 
            improves to deliver better results for our users.
          </p>
        </div>
      </div>
    </div>
  )
}