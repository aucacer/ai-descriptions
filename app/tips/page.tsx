"use client"

import { Button } from "@/components/ui/button"
import { ArrowLeft, Sparkles } from "lucide-react"

export default function Tips() {
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
                <p className="text-sm text-gray-600">eBay Tips & Best Practices</p>
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
        <h1 className="text-4xl font-bold text-gray-900 mb-8">eBay Listing Tips & Best Practices</h1>
        
        <div className="space-y-8">
          <article className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-semibold mb-4">10 Essential Tips for Writing Winning eBay Descriptions</h2>
            <p className="text-gray-700 mb-4">
              Creating compelling product descriptions is crucial for eBay success. Here are proven strategies 
              to boost your sales and improve your search rankings.
            </p>
            
            <h3 className="text-xl font-medium mt-6 mb-3">1. Use Keyword-Rich Titles</h3>
            <p className="text-gray-700 mb-4">
              Include relevant keywords that buyers search for. Think about brand names, model numbers, 
              colors, sizes, and key features. Avoid keyword stuffing but be descriptive.
            </p>
            
            <h3 className="text-xl font-medium mt-6 mb-3">2. Write Detailed Descriptions</h3>
            <p className="text-gray-700 mb-4">
              Provide comprehensive information about condition, dimensions, features, and benefits. 
              The more details you include, the more confident buyers feel about purchasing.
            </p>
            
            <h3 className="text-xl font-medium mt-6 mb-3">3. Use High-Quality Images</h3>
            <p className="text-gray-700 mb-4">
              Clear, well-lit photos from multiple angles increase buyer confidence. Include close-ups 
              of any flaws or unique features.
            </p>
            
            <h3 className="text-xl font-medium mt-6 mb-3">4. Include Shipping Information</h3>
            <p className="text-gray-700 mb-4">
              Be transparent about shipping costs and timeframes. Buyers appreciate knowing exactly 
              what to expect before they purchase.
            </p>
            
            <h3 className="text-xl font-medium mt-6 mb-3">5. Format for Mobile</h3>
            <p className="text-gray-700 mb-4">
              Most eBay traffic comes from mobile devices. Ensure your descriptions are easy to read 
              on smartphones with proper formatting and responsive design.
            </p>
          </article>
          
          <article className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-semibold mb-4">SEO Strategies for eBay Listings</h2>
            <p className="text-gray-700 mb-4">
              Search engine optimization isn't just for websites - it's crucial for eBay success too.
            </p>
            
            <h3 className="text-xl font-medium mt-6 mb-3">Research Popular Keywords</h3>
            <p className="text-gray-700 mb-4">
              Use eBay's search suggestions and tools like Terapeak to find what buyers are actually 
              searching for in your category.
            </p>
            
            <h3 className="text-xl font-medium mt-6 mb-3">Optimize Item Specifics</h3>
            <p className="text-gray-700 mb-4">
              Fill out all relevant item specifics. eBay uses this data to match your items with buyer 
              searches and filter preferences.
            </p>
          </article>
          
          <article className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-semibold mb-4">Common eBay Listing Mistakes to Avoid</h2>
            <ul className="list-disc list-inside text-gray-700 space-y-2">
              <li>Using poor quality or insufficient photos</li>
              <li>Writing vague or incomplete descriptions</li>
              <li>Ignoring mobile optimization</li>
              <li>Not including important keywords</li>
              <li>Setting unrealistic shipping costs</li>
              <li>Forgetting to mention item condition clearly</li>
              <li>Not responding to buyer questions promptly</li>
            </ul>
          </article>
        </div>
      </div>
    </div>
  )
}