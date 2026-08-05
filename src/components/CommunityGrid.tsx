import { useLanguage } from '@/i18n/LanguageContext'
import { communities } from '@/data/content'
import FadeIn from '@/components/FadeIn'
import {
  Users, GraduationCap, Briefcase, MessageCircle, type LucideIcon,
} from 'lucide-react'

const iconMap: Record<string, LucideIcon> = {
  GraduationCap, Briefcase, Users, MessageCircle,
}

export default function CommunityGrid() {
  const { t } = useLanguage()

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
      {communities.map((c, i) => {
        const Icon = iconMap[c.icon] ?? Users
        return (
          <FadeIn key={c.name.en} delay={i * 0.08}>
            <div className="h-full rounded-2xl bg-white border border-slate-200 p-6 hover:shadow-xl hover:shadow-red-500/10 hover:-translate-y-1 transition-all flex gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center shrink-0 shadow-lg shadow-red-500/25">
                <Icon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900">{t(c.name)}</h3>
                <p className="mt-1.5 text-sm text-slate-600 leading-relaxed">{t(c.desc)}</p>
              </div>
            </div>
          </FadeIn>
        )
      })}
    </div>
  )
}
