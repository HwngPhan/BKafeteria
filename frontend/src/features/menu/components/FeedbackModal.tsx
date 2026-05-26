'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Star, Loader2 } from 'lucide-react'
import { useLanguage } from '@/providers/LanguageProvider'
import { useCreateFeedback, useUpdateFeedback } from '../data-access/feedback.queries'
import { FeedbackDto } from '../config/feedback.types'
import { toast } from 'sonner'

interface FeedbackModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  menuItemId: string
  itemName: string
  existingFeedback?: FeedbackDto | null
}

export function FeedbackModal({
  open,
  onOpenChange,
  menuItemId,
  itemName,
  existingFeedback,
}: FeedbackModalProps) {
  const { t } = useLanguage()
  const [rating, setRating] = useState<number>(5)
  const [hoverRating, setHoverRating] = useState<number | null>(null)
  const [comment, setComment] = useState<string>('')

  const createFeedback = useCreateFeedback()
  const updateFeedback = useUpdateFeedback()

  // Initialize values when modal opens or existingFeedback changes
  useEffect(() => {
    if (open) {
      if (existingFeedback) {
        setRating(existingFeedback.rating)
        setComment(existingFeedback.comment || '')
      } else {
        setRating(5)
        setComment('')
      }
    }
  }, [open, existingFeedback])

  const isPending = createFeedback.isPending || updateFeedback.isPending

  const handleSubmit = async () => {
    try {
      if (existingFeedback) {
        await updateFeedback.mutateAsync({
          id: existingFeedback.feedbackId,
          data: { rating, comment },
        })
        toast.success(t('feedback.toast_update_success'))
      } else {
        await createFeedback.mutateAsync({
          menuItemId,
          rating,
          comment,
        })
        toast.success(t('feedback.toast_success'))
      }
      onOpenChange(false)
    } catch (error: unknown) {
      toast.error(error?.message || t('feedback.toast_error'))
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[450px] rounded-[2rem] border-none bg-white p-8 shadow-2xl animate-in fade-in duration-300">
        <DialogHeader className="space-y-3">
          <DialogTitle className="text-2xl font-black tracking-tight text-primary">
            {existingFeedback ? t('feedback.dialog_edit_title') : t('feedback.dialog_title')}
          </DialogTitle>
          <DialogDescription className="text-sm font-medium text-muted-foreground">
            {t('feedback.dialog_desc')}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-6">
          {/* Item name banner */}
          <div className="bg-secondary/5 rounded-2xl p-4 border border-secondary/10 flex items-center justify-center">
            <span className="font-black text-primary text-center text-base">{itemName}</span>
          </div>

          {/* Star Rating Selectors */}
          <div className="flex flex-col items-center justify-center space-y-2">
            <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              {t('feedback.rating_label')}
            </Label>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => {
                const isHighlighted = hoverRating !== null ? star <= hoverRating : star <= rating
                return (
                  <button
                    key={star}
                    type="button"
                    disabled={isPending}
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(null)}
                    className="p-1 rounded-full hover:scale-125 hover:bg-secondary/5 active:scale-95 transition-all duration-150 outline-none cursor-pointer focus-visible:ring-2 focus-visible:ring-primary/20"
                  >
                    <Star
                      size={36}
                      className={`transition-all duration-200 ${
                        isHighlighted
                          ? 'text-amber-400 fill-amber-400 drop-shadow-md'
                          : 'text-muted-foreground/30 fill-transparent'
                      }`}
                    />
                  </button>
                )
              })}
            </div>
            {rating > 0 && (
              <span className="text-sm font-black text-amber-500 mt-1">
                {rating} / 5.0
              </span>
            )}
          </div>

          {/* Comment text area */}
          <div className="space-y-2">
            <Label htmlFor="comment" className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              {t('feedback.comment_label')}
            </Label>
            <Textarea
              id="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder={t('feedback.comment_placeholder')}
              disabled={isPending}
              className="min-h-[100px] max-h-[180px] rounded-2xl border-secondary/20 p-4 resize-none transition-all duration-200 focus-visible:ring-primary focus-visible:border-primary"
            />
          </div>
        </div>

        <DialogFooter className="flex items-center gap-3 sm:justify-end">
          <Button
            type="button"
            variant="ghost"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
            className="rounded-xl h-12 font-bold px-6 border-none hover:bg-secondary/5"
          >
            {t('common.cancel')}
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={isPending}
            className="rounded-xl h-12 font-bold px-8 bg-primary hover:bg-primary/95 text-white shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
          >
            {isPending ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                {existingFeedback ? t('feedback.updating') : t('feedback.submitting')}
              </>
            ) : (
              existingFeedback ? t('feedback.update') : t('feedback.submit')
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
