import { Link } from 'react-router'
import { useLanguage } from '@/i18n/LanguageContext'
import { motion } from 'framer-motion'
import { ChevronRight, type LucideIcon } from 'lucide-react'
import type { BiText } from '@/data/content'

interface PageHeroProps {
  icon: LucideIcon
  kicker: BiText
  title: BiText
  subtitle: BiText
  image?: string
  tint?: string
}

export default function PageHero({ icon: Icon, kicker, title, subtitle, image, tint = 'from-slate-950/80 via-slate-950/50 to-slate-950' }: PageHeroProps) {
  const { t } = useLanguage()

  return (
    <div className="relative overflow-hidden bg-slate-950 pt-16">
      {image && (
        <>
          <img src={image} alt="" className="absolute inset-0 w-full h-full object-cover opacity-35" />
          <div className={`absolute inset-0 bg-gradient-to-b ${tint}`} />
        </>
      )}
      {!image && (
        <>
          <div className="absolute -top-24 -left-24 w-80 h-80 bg-red-600/20 rounded-full blur-3xl" />
          <div className="absolute top-10 right-0 w-80 h-80 bg-indigo-600/20 rounded-full blur-3xl" />
        </>
      )}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <nav className="flex items-center gap-1.5 text-sm text-slate-400 mb-6">
            <Link to="/" className="hover:text-orange-300 transition-colors">
              {t({ en: 'Home', zh: '首页' })}
            </Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-slate-200 font-medium">{t(kicker)}</span>
          </nav>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center shadow-lg shadow-red-500/30">
              <Icon className="w-5 h-5 text-white" />
            </div>
            <span className="text-sm font-semibold text-orange-300 uppercase tracking-wider">{t(kicker)}</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight max-w-3xl">
            {t(title)}
          </h1>
          <p className="mt-4 text-slate-300 max-w-2xl leading-relaxed">
            {t(subtitle)}
          </p>
        </motion.div>
      </div>
    </div>
  )
}
