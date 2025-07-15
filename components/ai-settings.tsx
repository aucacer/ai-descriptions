"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Settings, Key, Sparkles } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { DescriptionRequest } from "@/lib/ai-service"

interface AISettingsProps {
  onSettingsChange: (settings: {
    provider: string
    style: DescriptionRequest['style']
    tone: DescriptionRequest['tone']
    includeFeatures: boolean
    includeShipping: boolean
    includeGuarantee: boolean
  }) => void
}

export function AISettings({ onSettingsChange }: AISettingsProps) {
  const [selectedProvider, setSelectedProvider] = useState("openai")
  const [style, setStyle] = useState<DescriptionRequest['style']>("professional")
  const [tone, setTone] = useState<DescriptionRequest['tone']>("friendly")
  const [includeFeatures, setIncludeFeatures] = useState(true)
  const [includeShipping, setIncludeShipping] = useState(true)
  const [includeGuarantee, setIncludeGuarantee] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const handleProviderChange = (provider: string) => {
    setSelectedProvider(provider)
    
    onSettingsChange({
      provider,
      style,
      tone,
      includeFeatures,
      includeShipping,
      includeGuarantee,
    })
  }

  const handleSettingsChange = () => {
    onSettingsChange({
      provider: selectedProvider,
      style,
      tone,
      includeFeatures,
      includeShipping,
      includeGuarantee,
    })
  }

  // OpenAI is now automatically configured - no user input needed

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="flex items-center gap-2">
          <Settings className="h-4 w-4" />
          AI Settings
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            AI Configuration
          </DialogTitle>
          <DialogDescription>
            Configure your AI provider and description generation preferences
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* AI Provider Status */}
          <Card>
            <CardHeader>
              <CardTitle>AI Provider</CardTitle>
              <CardDescription>Advanced AI-powered product research and description generation</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Provider Status</Label>
                  <p className="text-sm text-gray-500">OpenAI GPT powered research and generation</p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-green-600 font-medium">Active</span>
                </div>
              </div>
              <p className="text-xs text-gray-500">
                Automatically configured for accurate product research and SEO-optimized descriptions
              </p>
            </CardContent>
          </Card>

          {/* Description Style Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Description Style</CardTitle>
              <CardDescription>Customize the tone and style of generated descriptions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="style">Style</Label>
                  <Select value={style} onValueChange={(value: string) => {
                    setStyle(value as DescriptionRequest['style'])
                    handleSettingsChange()
                  }}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="professional">Professional</SelectItem>
                      <SelectItem value="casual">Casual</SelectItem>
                      <SelectItem value="luxury">Luxury</SelectItem>
                      <SelectItem value="technical">Technical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tone">Tone</Label>
                  <Select value={tone} onValueChange={(value: string) => {
                    setTone(value as DescriptionRequest['tone'])
                    handleSettingsChange()
                  }}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="friendly">Friendly</SelectItem>
                      <SelectItem value="formal">Formal</SelectItem>
                      <SelectItem value="enthusiastic">Enthusiastic</SelectItem>
                      <SelectItem value="trustworthy">Trustworthy</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Content Options */}
          <Card>
            <CardHeader>
              <CardTitle>Content Options</CardTitle>
              <CardDescription>Choose what to include in your descriptions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Include Features</Label>
                  <p className="text-sm text-gray-500">Add product features and benefits</p>
                </div>
                <Switch
                  checked={includeFeatures}
                  onCheckedChange={(checked) => {
                    setIncludeFeatures(checked)
                    handleSettingsChange()
                  }}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Include Shipping</Label>
                  <p className="text-sm text-gray-500">Add shipping and delivery information</p>
                </div>
                <Switch
                  checked={includeShipping}
                  onCheckedChange={(checked) => {
                    setIncludeShipping(checked)
                    handleSettingsChange()
                  }}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Include Guarantee</Label>
                  <p className="text-sm text-gray-500">Add satisfaction guarantee</p>
                </div>
                <Switch
                  checked={includeGuarantee}
                  onCheckedChange={(checked) => {
                    setIncludeGuarantee(checked)
                    handleSettingsChange()
                  }}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  )
} 