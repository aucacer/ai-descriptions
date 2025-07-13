"use client"

import { Button } from "@/components/ui/button"
import { ArrowLeft, Sparkles } from "lucide-react"

export default function Terms() {
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
                <p className="text-sm text-gray-600">Terms of Service</p>
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
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Terms of Service</h1>
        
        <div className="bg-white rounded-lg shadow-lg p-8">
          <p className="text-gray-600 mb-6">Last updated: {new Date().toLocaleDateString()}</p>
          
          <h2 className="text-2xl font-semibold mb-4">Acceptance of Terms</h2>
          <p className="text-gray-700 mb-6">
            By using our AI Description Generator service, you agree to be bound by these Terms of 
            Service and our Privacy Policy.
          </p>
          
          <h2 className="text-2xl font-semibold mb-4">Description of Service</h2>
          <p className="text-gray-700 mb-6">
            Our service provides AI-generated product descriptions for eBay listings and other 
            e-commerce platforms. The service includes research capabilities and HTML formatting.
          </p>
          
          <h2 className="text-2xl font-semibold mb-4">User Responsibilities</h2>
          <p className="text-gray-700 mb-6">You agree to:</p>
          <ul className="list-disc list-inside text-gray-700 mb-6 space-y-1">
            <li>Provide accurate product information</li>
            <li>Use generated content responsibly and ethically</li>
            <li>Comply with eBay and other platform policies</li>
            <li>Not use our service for illegal or harmful purposes</li>
            <li>Respect intellectual property rights</li>
          </ul>
          
          <h2 className="text-2xl font-semibold mb-4">Content Ownership</h2>
          <p className="text-gray-700 mb-6">
            You retain ownership of the product information you provide. Generated descriptions are 
            provided to you for your use. You are responsible for ensuring all content complies with 
            applicable laws and platform policies.
          </p>
          
          <h2 className="text-2xl font-semibold mb-4">Disclaimer of Warranties</h2>
          <p className="text-gray-700 mb-6">
            Our service is provided "as is" without warranties of any kind. We do not guarantee the 
            accuracy, completeness, or effectiveness of generated content.
          </p>
          
          <h2 className="text-2xl font-semibold mb-4">Limitation of Liability</h2>
          <p className="text-gray-700 mb-6">
            We shall not be liable for any direct, indirect, incidental, special, or consequential 
            damages resulting from your use of our service.
          </p>
          
          <h2 className="text-2xl font-semibold mb-4">Modifications</h2>
          <p className="text-gray-700 mb-6">
            We reserve the right to modify these terms at any time. Continued use of our service 
            constitutes acceptance of modified terms.
          </p>
          
          <h2 className="text-2xl font-semibold mb-4">Contact Information</h2>
          <p className="text-gray-700">
            For questions about these Terms of Service, please contact us through our website.
          </p>
        </div>
      </div>
    </div>
  )
}