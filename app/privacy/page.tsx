"use client"

import { Button } from "@/components/ui/button"
import { ArrowLeft, Sparkles } from "lucide-react"

export default function Privacy() {
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
                <p className="text-sm text-gray-600">Privacy Policy</p>
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
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Privacy Policy</h1>
        
        <div className="bg-white rounded-lg shadow-lg p-8">
          <p className="text-gray-600 mb-6">Last updated: {new Date().toLocaleDateString()}</p>
          
          <h2 className="text-2xl font-semibold mb-4">Information We Collect</h2>
          <p className="text-gray-700 mb-6">
            We collect information you provide directly to us, such as when you use our AI description 
            generator tool. This may include product titles and any text you input into our system.
          </p>
          
          <h2 className="text-2xl font-semibold mb-4">How We Use Your Information</h2>
          <p className="text-gray-700 mb-6">
            We use the information we collect to:
          </p>
          <ul className="list-disc list-inside text-gray-700 mb-6 space-y-1">
            <li>Provide and improve our AI description generation service</li>
            <li>Process your requests and generate product descriptions</li>
            <li>Analyze usage patterns to enhance our algorithms</li>
            <li>Communicate with you about our services</li>
          </ul>
          
          <h2 className="text-2xl font-semibold mb-4">Information Sharing</h2>
          <p className="text-gray-700 mb-6">
            We do not sell, trade, or otherwise transfer your personal information to third parties 
            without your consent, except as described in this policy or as required by law.
          </p>
          
          <h2 className="text-2xl font-semibold mb-4">Data Security</h2>
          <p className="text-gray-700 mb-6">
            We implement appropriate security measures to protect your personal information against 
            unauthorized access, alteration, disclosure, or destruction.
          </p>
          
          <h2 className="text-2xl font-semibold mb-4">Cookies and Tracking</h2>
          <p className="text-gray-700 mb-6">
            Our website may use cookies to enhance user experience and analyze site traffic. You can 
            choose to disable cookies through your browser settings.
          </p>
          
          <h2 className="text-2xl font-semibold mb-4">Third-Party Services</h2>
          <p className="text-gray-700 mb-6">
            We may use third-party services like Google Analytics and AI providers to improve our 
            service. These services have their own privacy policies governing their use of information.
          </p>
          
          <h2 className="text-2xl font-semibold mb-4">Your Rights</h2>
          <p className="text-gray-700 mb-6">
            You have the right to access, update, or delete your personal information. Contact us 
            if you wish to exercise these rights.
          </p>
          
          <h2 className="text-2xl font-semibold mb-4">Contact Us</h2>
          <p className="text-gray-700">
            If you have any questions about this Privacy Policy, please contact us through our website.
          </p>
        </div>
      </div>
    </div>
  )
}