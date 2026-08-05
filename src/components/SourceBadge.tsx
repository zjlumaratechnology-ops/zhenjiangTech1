import { useLanguage } from '@/i18n/LanguageContext'
import type { SourceRef } from '@/data/content'
import { trustLevels } from '@/data/content'
import {
  Popover, PopoverContent, PopoverTrigger,
} from '@/components/ui/popover'
import { BadgeCheck, FileSearch, HelpCircle, ExternalLink, CalendarClock } from 'lucide-react'

const levelIcons = {
  claimed: HelpCircle,
  source: FileSearch,
  confirmed: BadgeCheck,
}

export default function SourceBadge({ source, compact }: { source: SourceRef; compact?: boolean }) {
  const { t } = useLanguage()
  const level = trustLevels.find((l) => l.key === source.level) ?? trustLevels[0]
  const Icon = levelIcons[source.level]

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-semibold transition-transform hover:scale-105 ${level.chipColor}`}
        >
          <Icon className="w-3 h-3" />
          {t(level.name)}
          {!compact && (
            <span className="opacity-60 font-normal">· {source.lastChecked}</span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-72" align="start">
        <div className="space-y-3">
          <div>
            <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-bold ${level.chipColor}`}>
              <Icon className="w-3.5 h-3.5" />
              {t(level.name)}
            </span>
            <p className="mt-2 text-xs text-slate-600 leading-relaxed">{t(level.desc)}</p>
          </div>
          <div className="border-t border-slate-100 pt-2.5 space-y-1.5">
            <p className="text-xs text-slate-500 flex items-center gap-1.5">
              <FileSearch className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="font-medium text-slate-700">{t({ en: 'Source', zh: '来源' })}:</span>
              {source.url ? (
                <a
                  href={source.url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-blue-600 hover:underline truncate"
                >
                  {source.name}
                  <ExternalLink className="w-3 h-3 shrink-0" />
                </a>
              ) : (
                <span className="truncate">{source.name}</span>
              )}
            </p>
            <p className="text-xs text-slate-500 flex items-center gap-1.5">
              <CalendarClock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="font-medium text-slate-700">{t({ en: 'Last checked', zh: '核查时间' })}:</span>
              {source.lastChecked}
            </p>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
