'use client'

import { useState } from 'react'
import { Calendar, Clock, Video, Loader2, ArrowRight, Diamond } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { useAuthStore } from '@/store/auth-store'
import { toast } from 'sonner'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface TeacherBookingModalProps {
  teacherId: string
  teacherName: string
  isOpen: boolean
  onClose: () => void
}

export function TeacherBookingModal({ teacherId, teacherName, isOpen, onClose }: TeacherBookingModalProps) {
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [duration, setDuration] = useState('60')
  const [notes, setNotes] = useState('')
  const [paymentMethod, setPaymentMethod] = useState<'GEMS' | 'NGN'>('GEMS')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { user } = useAuthStore()

  // Base rate logic (e.g. 500 NGN or 5 Gems per minute)
  const ratePerMinGems = 1
  const ratePerMinNgn = 100
  const durationNum = parseInt(duration)
  const totalGems = durationNum * ratePerMinGems
  const totalNgn = durationNum * ratePerMinNgn

  const handleSubmit = async () => {
    if (!date || !time) {
      toast.error('Please select a date and time')
      return
    }

    if (paymentMethod === 'GEMS' && (user?.gems || 0) < totalGems) {
      toast.error('Not enough Gems!')
      return
    }

    setIsSubmitting(true)

    // Merge date and time string into Date object
    const scheduleDate = new Date(`${date}T${time}`)

    try {
      const res = await fetch('/api/teacher/book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          teacherProfileId: teacherId,
          scheduleDate: scheduleDate.toISOString(),
          durationMinutes: durationNum,
          notes,
          paymentMethod,
          price: paymentMethod === 'GEMS' ? totalGems : totalNgn
        })
      })

      if (res.ok) {
        toast.success('Class booked successfully! Check your messages for the link when accepted.')
        onClose()
      } else {
        const err = await res.json()
        toast.error(err.error || 'Failed to book class')
      }
    } catch {
      toast.error('Network error during booking')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md w-[95%] rounded-2xl overflow-hidden p-0">
        <DialogHeader className="p-6 bg-gradient-to-r from-primary/10 to-blue-500/10 border-b">
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Video className="w-5 h-5 text-primary" />
            Book 1-on-1 Class
          </DialogTitle>
          <DialogDescription>
            Schedule a private tutoring session with {teacherName}.
          </DialogDescription>
        </DialogHeader>

        <div className="p-6 space-y-5 flex-1 overflow-y-auto max-h-[70vh]">
          {/* Scheduling */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="flex items-center gap-1.5 text-xs">
                <Calendar className="w-3.5 h-3.5" /> Date
              </Label>
              <Input 
                type="date" 
                value={date} 
                onChange={(e) => setDate(e.target.value)} 
                min={new Date().toISOString().split('T')[0]} 
                className="rounded-xl h-10"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="flex items-center gap-1.5 text-xs">
                <Clock className="w-3.5 h-3.5" /> Time
              </Label>
              <Input 
                type="time" 
                value={time} 
                onChange={(e) => setTime(e.target.value)} 
                className="rounded-xl h-10"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs">Duration</Label>
            <Select value={duration} onValueChange={setDuration}>
              <SelectTrigger className="w-full rounded-xl h-10">
                <SelectValue placeholder="Select duration" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="30">30 Minutes</SelectItem>
                <SelectItem value="60">1 Hour</SelectItem>
                <SelectItem value="90">1.5 Hours</SelectItem>
                <SelectItem value="120">2 Hours</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs">What do you want to learn? (Optional)</Label>
            <Textarea 
              placeholder="E.g., I need help understanding React hooks..." 
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="rounded-xl min-h-[80px]"
            />
          </div>

          <div className="space-y-3">
            <Label className="text-xs">Pay With</Label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setPaymentMethod('GEMS')}
                className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all ${paymentMethod === 'GEMS' ? 'border-blue-500 bg-blue-500/10' : 'border-border hover:bg-muted'}`}
              >
                <div className="flex items-center gap-1.5 font-bold text-blue-600">
                  <Diamond className="w-4 h-4 fill-blue-500" />
                  {totalGems}
                </div>
                <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Skoolar Gems</span>
              </button>
              
              <button
                onClick={() => setPaymentMethod('NGN')}
                className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all ${paymentMethod === 'NGN' ? 'border-[#008751] bg-[#008751]/10' : 'border-border hover:bg-muted'}`}
              >
                <div className="flex items-center gap-1 font-bold text-[#008751]">
                  ₦{totalNgn.toLocaleString()}
                </div>
                <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Naira Card</span>
              </button>
            </div>
          </div>
        </div>

        <DialogFooter className="p-4 border-t bg-muted/20">
          <Button variant="ghost" onClick={onClose} className="rounded-full">Cancel</Button>
          <Button 
            onClick={handleSubmit} 
            disabled={isSubmitting || !date || !time}
            className="rounded-full bg-primary hover:bg-primary/90 min-w-[120px]"
          >
            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : (
              <>Confirm Booking <ArrowRight className="w-4 h-4 ml-1.5" /></>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
