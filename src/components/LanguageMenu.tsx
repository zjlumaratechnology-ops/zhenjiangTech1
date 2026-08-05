import { useLanguage } from '@/i18n/LanguageContext'
import { LANGS, type Lang } from '@/i18n/translations'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Globe, Check } from 'lucide-react'

export default function LanguageMenu() {
  const { lang, setLang, ui } = useLanguage()
  const current = LANGS.find((l) => l.code === lang)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-red-500 to-orange-500 text-white text-sm font-semibold shadow-md shadow-red-500/25 hover:shadow-lg hover:scale-105 transition-all"
          title={ui('common.language')}
        >
          <Globe className="w-4 h-4" />
          <span className="max-w-16 truncate">{current?.native ?? 'EN'}</span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="max-h-80 overflow-y-auto w-48">
        {LANGS.map((l) => (
          <DropdownMenuItem
            key={l.code}
            onClick={() => setLang(l.code as Lang)}
            className="flex items-center justify-between gap-2 cursor-pointer"
          >
            <span className="flex items-center gap-2">
              <span>{l.flag}</span>
              <span className="font-medium">{l.native}</span>
            </span>
            {lang === l.code && <Check className="w-4 h-4 text-red-500" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
