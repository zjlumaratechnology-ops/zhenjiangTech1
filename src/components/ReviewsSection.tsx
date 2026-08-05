import { useState } from 'react'
import { useLanguage } from '@/i18n/LanguageContext'
import { useAuth } from '@/hooks/useAuth'
import { trpc } from '@/providers/trpc'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { toast } from 'sonner'
import { Star, Trash2, MessageSquare } from 'lucide-react'
import { useNavigate } from 'react-router'

function Stars({ value, onChange, size = 'w-4 h-4' }: { value: number; onChange?: (v: number) => void; size?: string }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <button
          key={s}
          type="button"
          disabled={!onChange}
          onClick={() => onChange?.(s)}
          className={onChange ? 'cursor-pointer hover:scale-110 transition-transform' : 'cursor-default'}
        >
          <Star
            className={`${size} ${s <= value ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`}
          />
        </button>
      ))}
    </div>
  )
}

export default function ReviewsSection({ eventId }: { eventId: number }) {
  const { ui, lang } = useLanguage()
  const { isAuthenticated, user } = useAuth()
  const navigate = useNavigate()
  const utils = trpc.useUtils()

  const reviewsQuery = trpc.reviews.list.useQuery({ eventId })
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')
  const [open, setOpen] = useState(false)

  const createReview = trpc.reviews.create.useMutation({
    onSuccess: () => {
      utils.reviews.list.invalidate({ eventId })
      setComment('')
      setRating(5)
      setOpen(false)
      toast.success(lang === 'zh' ? '评价已提交！' : 'Review submitted!')
    },
    onError: (err) => toast.error(err.message),
  })

  const removeReview = trpc.reviews.remove.useMutation({
    onSuccess: () => {
      utils.reviews.list.invalidate({ eventId })
      toast.success(lang === 'zh' ? '评价已删除' : 'Review deleted')
    },
    onError: (err) => toast.error(err.message),
  })

  const reviews = reviewsQuery.data ?? []
  const avg = reviews.length
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : null

  const fmtDate = (d: Date | string) =>
    new Intl.DateTimeFormat(lang === 'zh' ? 'zh-CN' : lang, { month: 'short', day: 'numeric' }).format(
      d instanceof Date ? d : new Date(d),
    )

  return (
    <div className="border-t border-slate-100 px-5 py-4 bg-slate-50/50">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-slate-400" />
          <span className="text-sm font-bold text-slate-700">{ui('events.reviews')}</span>
          {avg && (
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-600">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              {avg} ({reviews.length})
            </span>
          )}
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={() => (isAuthenticated ? setOpen(!open) : navigate('/login'))}
        >
          {ui('events.writereview')}
        </Button>
      </div>

      {open && (
        <form
          onSubmit={(e) => {
            e.preventDefault()
            createReview.mutate({ eventId, rating, comment: comment.trim() })
          }}
          className="mb-4 rounded-xl bg-white border border-slate-200 p-4 space-y-3"
        >
          <div>
            <p className="text-xs font-semibold text-slate-500 mb-1.5">{ui('events.yourrating')}</p>
            <Stars value={rating} onChange={setRating} size="w-6 h-6" />
          </div>
          <Textarea
            required
            minLength={3}
            rows={2}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder={ui('events.yourcomment')}
          />
          <Button
            type="submit"
            size="sm"
            disabled={createReview.isPending}
            className="bg-gradient-to-r from-red-500 to-orange-500 text-white"
          >
            {createReview.isPending ? ui('common.loading') : ui('events.submit')}
          </Button>
        </form>
      )}

      {reviewsQuery.isLoading ? (
        <p className="text-xs text-slate-400">{ui('common.loading')}</p>
      ) : reviews.length === 0 ? (
        <p className="text-xs text-slate-400">{ui('events.noreviews')}</p>
      ) : (
        <div className="space-y-3">
          {reviews.map((r) => (
            <div key={r.id} className="flex gap-3">
              <Avatar className="w-8 h-8 shrink-0">
                <AvatarImage src={r.userAvatar ?? undefined} />
                <AvatarFallback className="bg-slate-200 text-slate-600 text-xs font-bold">
                  {(r.userName ?? 'U').slice(0, 1).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-slate-800">{r.userName ?? 'User'}</span>
                  <Stars value={r.rating} size="w-3.5 h-3.5" />
                  <span className="text-xs text-slate-400">{fmtDate(r.createdAt)}</span>
                  {user?.id === r.userId && (
                    <button
                      onClick={() => removeReview.mutate({ id: r.id })}
                      className="ml-auto p-1 text-slate-300 hover:text-red-500 transition-colors"
                      title={ui('common.delete')}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
                <p className="text-sm text-slate-600 mt-0.5 leading-relaxed">{r.comment}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
