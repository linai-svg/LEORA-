"use client"

import { useMascot } from "@/context/MascotContext"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

interface MascotSettingsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function MascotSettingsDialog({ open, onOpenChange }: MascotSettingsDialogProps) {
  const { settings, updateSettings } = useMascot()

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Mascot Settings</DialogTitle>
          <DialogDescription>
            Customize how Leora the leopard interacts with you
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Enable/Disable */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="mascot-enabled">Enable Mascot</Label>
              <p className="text-sm text-muted-foreground">
                Show Leora throughout the app
              </p>
            </div>
            <Switch
              id="mascot-enabled"
              checked={settings.enabled}
              onCheckedChange={(checked) => updateSettings({ enabled: checked })}
            />
          </div>

          {/* Tone Selection */}
          <div className="space-y-3">
            <Label>Tone</Label>
            <RadioGroup
              value={settings.tone}
              onValueChange={(value) => updateSettings({ tone: value as 'soft' | 'normal' | 'energetic' })}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="soft" id="tone-soft" />
                <Label htmlFor="tone-soft" className="font-normal cursor-pointer">
                  <div>
                    <div className="font-medium">Soft</div>
                    <div className="text-sm text-muted-foreground">Gentle and calming messages</div>
                  </div>
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="normal" id="tone-normal" />
                <Label htmlFor="tone-normal" className="font-normal cursor-pointer">
                  <div>
                    <div className="font-medium">Normal</div>
                    <div className="text-sm text-muted-foreground">Balanced and encouraging</div>
                  </div>
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="energetic" id="tone-energetic" />
                <Label htmlFor="tone-energetic" className="font-normal cursor-pointer">
                  <div>
                    <div className="font-medium">Energetic</div>
                    <div className="text-sm text-muted-foreground">Enthusiastic and motivating</div>
                  </div>
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Frequency Selection */}
          <div className="space-y-3">
            <Label>Appearance Frequency</Label>
            <RadioGroup
              value={settings.frequency}
              onValueChange={(value) => updateSettings({ frequency: value as 'minimal' | 'normal' | 'frequent' })}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="minimal" id="freq-minimal" />
                <Label htmlFor="freq-minimal" className="font-normal cursor-pointer">
                  <div>
                    <div className="font-medium">Minimal</div>
                    <div className="text-sm text-muted-foreground">Only for major achievements</div>
                  </div>
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="normal" id="freq-normal" />
                <Label htmlFor="freq-normal" className="font-normal cursor-pointer">
                  <div>
                    <div className="font-medium">Normal</div>
                    <div className="text-sm text-muted-foreground">Balanced appearance</div>
                  </div>
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="frequent" id="freq-frequent" />
                <Label htmlFor="freq-frequent" className="font-normal cursor-pointer">
                  <div>
                    <div className="font-medium">Frequent</div>
                    <div className="text-sm text-muted-foreground">Regular encouragement</div>
                  </div>
                </Label>
              </div>
            </RadioGroup>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
