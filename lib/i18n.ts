import { LOCALES, type Locale } from "@/content/default";

export type { Locale };
export { LOCALES };

/** Name des Sprach-Cookies. */
export const LOCALE_COOKIE = "lang";

/** Dauer des Sprach-Cookies (1 Jahr). */
const LOCALE_COOKIE_TTL = 60 * 60 * 24 * 365;

/**
 * Statische UI-Texte, die nicht ueber den Inhalt editierbar sind
 * (Navigation, Formulare, Hinweise). Der eigentliche Seiteninhalt
 * (Titel, Texte, Ablauf, FAQ, ...) liegt pro Sprache im Content-Modell.
 */
export const dict = {
  de: {
    langName: "DE",
    gate: {
      title: "JaWort",
      subtitle: "Bitte gib das Passwort ein, um die Seite zu sehen.",
      password: "Passwort",
      submit: "Eintreten",
      waiting: "Bitte warten...",
      error: "Falsches Passwort.",
      networkError: "Netzwerkfehler. Bitte versuche es erneut.",
    },
    nav: {
      story: "Story",
      gallery: "Galerie",
      schedule: "Ablauf",
      rsvp: "Zu-/Absage",
      map: "Anfahrt",
      faq: "FAQ",
      contact: "Kontakt",
      logout: "Logout",
    },
    hero: { cta: "Zur Zu-/Absage" },
    countdown: { days: "Tage", hours: "Stunden", minutes: "Minuten", seconds: "Sekunden" },
    gallery: { title: "Galerie" },
    map: { iframeTitle: "Karte der Location" },
    contact: { phone: "Telefon", whatsapp: "WhatsApp", email: "E-Mail" },
    rsvp: {
      name: "Vor- und Nachname",
      namePlaceholder: "Vor- und Nachname",
      attending: "Zu- oder Absage",
      attendingPlaceholder: "Bitte waehlen",
      attendingYes: "Ich/Wir kommen gerne",
      attendingNo: "Ich/Wir muessen leider absagen",
      guests: "Personenzahl",
      hasChildren: "Sind Kinder unter den Personen?",
      yes: "Ja",
      no: "Nein",
      childrenAges: "Alter der Kinder",
      childrenAgesPlaceholder: "z. B. 2 und 5 Jahre",
      childrenAgesHint:
        "Bitte gib hier das Alter der Kinder an, damit wir ggf. Hochstuehle und Kindermenues planen koennen.",
      accommodation: "Benoetigt ihr Unterstützung beim Finden einer passenden Unterkunft?",
      note: "Nachricht oder Kontakt (optional)",
      notePlaceholder: "E-Mail oder Telefon fuer Rueckfragen, Essenswuensche, ...",
      submit: "Absenden",
      sending: "Wird gesendet...",
      success: "Vielen Dank!",
      successText: "Deine Antwort wurde gespeichert. Wir freuen uns auf euch!",
      error: "Etwas ist schiefgelaufen. Bitte versuche es erneut.",
      networkError: "Netzwerkfehler. Bitte versuche es erneut.",
    },
  },
  ko: {
    langName: "한국어",
    gate: {
      title: "JaWort",
      subtitle: "비밀번호를 입력해 주세요.",
      password: "비밀번호",
      submit: "입장",
      waiting: "잠시만 기다려 주세요...",
      error: "비밀번호가 올바르지 않습니다.",
      networkError: "네트워크 오류입니다. 다시 시도해 주세요.",
    },
    nav: {
      story: "이야기",
      gallery: "갤러리",
      schedule: "일정",
      rsvp: "참석 여부",
      map: "오시는 길",
      faq: "FAQ",
      contact: "연락처",
      logout: "로그아웃",
    },
    hero: { cta: "참석 여부로" },
    countdown: { days: "일", hours: "시간", minutes: "분", seconds: "초" },
    gallery: { title: "갤러리" },
    map: { iframeTitle: "행사장 지도" },
    contact: { phone: "전화", whatsapp: "WhatsApp", email: "이메일" },
    rsvp: {
      name: "성함",
      namePlaceholder: "성함",
      attending: "참석 여부",
      attendingPlaceholder: "선택해 주세요",
      attendingYes: "참석합니다",
      attendingNo: "아쉽지만 참석하지 못합니다",
      guests: "인원 수",
      hasChildren: "어린이(미성년자)가 포함되어 있나요?",
      yes: "네",
      no: "아니요",
      childrenAges: "어린이 나이",
      childrenAgesPlaceholder: "예: 2살, 5살",
      childrenAgesHint: "유아용 의자와 어린이 메뉴를 준비하기 위해 어린이의 나이를 적어 주세요.",
      accommodation: "숙소를 찾는 데 도움이 필요하신가요?",
      note: "메시지 또는 연락처 (선택)",
      notePlaceholder: "연락처나 식사 관련 요청사항 등",
      submit: "제출",
      sending: "전송 중...",
      success: "감사합니다!",
      successText: "답변이 저장되었습니다. 만나서 반가울 거예요!",
      error: "문제가 발생했습니다. 다시 시도해 주세요.",
      networkError: "네트워크 오류입니다. 다시 시도해 주세요.",
    },
  },
} as const;

export type Dictionary = (typeof dict)[Locale];

/** Liefert das Dictionary fuer eine Sprache. */
export function getDictionary(locale: Locale): Dictionary {
  return dict[locale];
}

/** Dauer des Sprach-Cookies (fuer Route Handler exportiert). */
export function localeCookieTtl(): number {
  return LOCALE_COOKIE_TTL;
}
