'use client'

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Star, Loader2, MessageSquare, ClipboardList } from 'lucide-react'
import { useLanguage } from '@/providers/LanguageProvider'
import { useFeedbacksByMenuItem } from '../data-access/feedback.queries'
import { cn } from '@/lib/utils'

interface MenuItemFeedbacksModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  menuItemId: string
  itemName: string
  averageRating?: number
}

export function MenuItemFeedbacksModal({
  open,
  onOpenChange,
  menuItemId,
  itemName,
  averageRating = 5.0,
}: MenuItemFeedbacksModalProps) {
  const { t } = useLanguage()
  const { data: feedbacks, isLoading } = useFeedbacksByMenuItem(menuItemId)

  // Calculate actual stats from fetched feedbacks if averageRating is not pre-provided or is 0
  const reviewCount = feedbacks?.length || 0
  const computedAverage = feedbacks && reviewCount > 0
    ? feedbacks.reduce((sum, fb) => sum + fb.rating, 0) / reviewCount
    : averageRating

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[85vh] rounded-[2.5rem] border-none bg-white p-8 shadow-2xl flex flex-col overflow-hidden animate-in fade-in duration-300">
        <DialogHeader className="space-y-2 shrink-0">
          <DialogTitle className="text-2xl font-black tracking-tight text-primary leading-tight">
            {t('feedback.view_reviews')}
          </DialogTitle>
          <DialogDescription className="text-sm font-medium text-muted-foreground line-clamp-1">
            {itemName}
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3 flex-1">
            <Loader2 className="h-12 w-12 text-primary animate-spin" />
            <span className="text-xs font-bold text-muted-foreground">{t('loading.text')}</span>
          </div>
        ) : feedbacks && feedbacks.length > 0 ? (
          <div className="flex flex-col flex-1 overflow-hidden space-y-6 pt-4">
            {/* Rating Summary Header Banner */}
            <div className="bg-secondary/5 border border-secondary/10 rounded-3xl p-6 flex items-center justify-between shrink-0">
              <div className="space-y-1">
                <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                  {t('feedback.avg_rating')}
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-4xl font-black text-primary leading-none">
                    {computedAverage.toFixed(1)}
                  </span>
                  <div className="flex flex-col">
                    <div className="flex items-center">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          size={14}
                          className={cn(
                            star <= Math.round(computedAverage)
                              ? 'text-amber-400 fill-amber-400'
                              : 'text-muted-foreground/20'
                          )}
                        />
                      ))}
                    </div>
                    <span className="text-[10px] font-extrabold text-muted-foreground mt-0.5">
                      {t('feedback.reviews_count').replace('{n}', String(reviewCount))}
                    </span>
                  </div>
                </div>
              </div>

              <div className="h-14 w-14 rounded-2xl bg-amber-400/10 flex items-center justify-center text-amber-500 shrink-0">
                <Star size={28} className="fill-amber-400 text-amber-400" />
              </div>
            </div>

            {/* Scrollable Reviews List */}
            <ScrollArea className="flex-1 pr-2">
              <div className="space-y-4 pb-4">
                {feedbacks.map((review) => (
                  <div
                    key={review.feedbackId}
                    className="p-5 rounded-[1.8rem] border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition duration-200 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex flex-col space-y-0.5">
                        <span className="text-xs font-black text-primary">
                          {review.userId ? `${t('feedback.customer')} #${review.userId.substring(0, 6).toUpperCase()}` : t('feedback.anonymous')}
                        </span>
                        <span className="text-[9px] font-bold text-muted-foreground">
                          {new Date(review.createdAt).toLocaleDateString()}
                        </span>
                      </div>

                      <div className="flex items-center gap-0.5">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            size={12}
                            className={cn(
                              star <= review.rating ? 'text-amber-400 fill-amber-400' : 'text-muted-foreground/20'
                            )}
                          />
                        ))}
                      </div>
                    </div>

                    {review.comment ? (
                      <p className="text-xs text-muted-foreground font-medium leading-relaxed italic bg-white/70 border border-slate-100 p-3 rounded-2xl">
                        "{review.comment}"
                      </p>
                    ) : (
                      <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground/50 font-medium italic pl-1">
                        <MessageSquare size={10} />
                        <span>Không có nhận xét bằng văn bản</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        ) : (
          /* Empty State */
          <div className="flex flex-col items-center justify-center py-20 text-center space-y-6 flex-1">
            <div className="p-8 rounded-full bg-secondary/5">
              <ClipboardList className="h-16 w-16 text-muted-foreground/30" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-bold text-primary">{t('feedback.no_reviews')}</h3>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
