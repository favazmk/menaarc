import { site } from '@/lib/site';

/**
 * A wa.me link that opens a chat with the studio, message already typed.
 *
 * wa.me rather than the api.whatsapp.com form because it is the documented
 * short link, and it hands off to the app on a phone and to WhatsApp Web on a
 * desktop without any detection on our side. The visitor still presses send
 * themselves — nothing leaves their device until they do.
 */
export function whatsappHref(message: string) {
  return `https://wa.me/${site.contact.whatsapp}?text=${encodeURIComponent(message)}`;
}

/**
 * The opening line a visitor sends from each page, written in their voice.
 *
 * Each one says where they came from, so the first thing the studio reads is
 * context rather than "hi" — someone writing from /services wants scoping,
 * someone writing from a case study has a comparable project in mind.
 */
export const openers = {
  home: 'Hi MENAARC, I came across your studio and would like to talk about a project.',
  services:
    "Hi MENAARC, I've been reading about your services and would like to scope a project. The part I need help with is: ",
  studio: `Hi ${site.founder.name.replace(/^Ar\.\s*/, '').split(' ')[0]}, I read about the studio and would like to talk to you about a project.`,
  work: "Hi MENAARC, I've been looking through your work and have a project I'd like to discuss.",
  contact: "Hi MENAARC, I'd like to talk about a project.",
} as const;

export function projectOpener(title: string, location?: string) {
  const where = location ? ` at ${location}` : '';
  return `Hi MENAARC, I saw your ${title} project${where} and have something similar in mind. Could we talk?`;
}
