'use client';

import { useState } from 'react';
import { Card } from '@/components/ui';

const CONTACT_EMAIL = 'xav.robart@gmail.com';

const SUBJECTS: Record<string, string> = {
  suggestion: "Suggestion d'amélioration",
  bug: 'Signaler un problème',
  content: 'Contenu incorrect ou manquant',
  partnership: 'Partenariat',
  other: 'Autre',
};

/**
 * Formulaire de contact sans backend : à l'envoi, il ouvre la messagerie de
 * l'utilisateur avec un e-mail prérempli (mailto:). L'ancien formulaire
 * affichait « Message envoyé ! » sans rien envoyer.
 */
export default function ContactForm() {
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [opened, setOpened] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const mailtoHref = () => {
    const subject = `[SécuCitoyen] ${SUBJECTS[formData.subject] ?? 'Contact'}`;
    const body = `${formData.message}\n\n— ${formData.name}${formData.email ? ` (${formData.email})` : ''}`;
    return `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    window.location.href = mailtoHref();
    setOpened(true);
  };

  const inputClass =
    'w-full px-3 py-2 min-h-11 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-primary focus:border-transparent transition-colors';

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Card>
        <div className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Nom complet *
            </label>
            <input type="text" id="name" name="name" required autoComplete="name" value={formData.name} onChange={handleChange} className={inputClass} placeholder="Votre nom" />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Adresse e-mail *
            </label>
            <input type="email" id="email" name="email" required autoComplete="email" value={formData.email} onChange={handleChange} className={inputClass} placeholder="votre@email.com" />
          </div>

          <div>
            <label htmlFor="subject" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Sujet *
            </label>
            <select id="subject" name="subject" required value={formData.subject} onChange={handleChange} className={inputClass}>
              <option value="">Sélectionnez un sujet</option>
              {Object.entries(SUBJECTS).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="message" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Message *
            </label>
            <textarea id="message" name="message" required rows={5} value={formData.message} onChange={handleChange} className={`${inputClass} resize-none`} placeholder="Décrivez votre demande..." />
          </div>
        </div>
      </Card>

      <button
        type="submit"
        className="w-full py-3 min-h-11 bg-primary hover:bg-primary/90 text-white font-medium rounded-xl transition-colors flex items-center justify-center gap-2"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
        Ouvrir dans ma messagerie
      </button>

      <p className="text-xs text-gray-500 dark:text-gray-400" aria-live="polite">
        {opened
          ? "Votre messagerie s'est ouverte avec le message prérempli. Si ce n'est pas le cas, écrivez directement à "
          : 'Le message est envoyé depuis votre propre messagerie (aucune donnée ne transite par nos serveurs). Sans messagerie configurée, écrivez à '}
        <a href={`mailto:${CONTACT_EMAIL}`} className="text-primary dark:text-blue-400 underline">{CONTACT_EMAIL}</a>.
      </p>
    </form>
  );
}
