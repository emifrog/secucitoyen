'use client';

import { useState } from 'react';
import { Card } from '@/components/ui';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simuler l'envoi du formulaire
    setSubmitted(true);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="p-4 space-y-5">
      {/* Header */}
      <section>
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">Contact</h2>
        <p className="text-gray-600 dark:text-gray-400">
          Une question, une suggestion ? Contactez-nous.
        </p>
      </section>

      {/* Alerte importante */}
      <section className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
        <div className="flex gap-3">
          <div className="text-2xl">🚨</div>
          <div>
            <p className="text-sm text-red-800 dark:text-red-300 font-semibold mb-1">
              Ce formulaire n&apos;est pas un service d&apos;urgence
            </p>
            <p className="text-sm text-red-700 dark:text-red-400">
              En cas d&apos;urgence, appelez le{' '}
              <a href="tel:15" className="font-bold underline">15</a>,{' '}
              <a href="tel:17" className="font-bold underline">17</a>,{' '}
              <a href="tel:18" className="font-bold underline">18</a> ou{' '}
              <a href="tel:112" className="font-bold underline">112</a>.
            </p>
          </div>
        </div>
      </section>

      {submitted ? (
        /* Message de confirmation */
        <Card className="text-center py-8">
          <div className="text-5xl mb-4">✅</div>
          <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-2">
            Message envoyé !
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Merci pour votre message. Nous vous répondrons dans les plus brefs délais.
          </p>
          <button
            onClick={() => {
              setSubmitted(false);
              setFormData({ name: '', email: '', subject: '', message: '' });
            }}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
          >
            Envoyer un autre message
          </button>
        </Card>
      ) : (
        /* Formulaire de contact */
        <form onSubmit={handleSubmit} className="space-y-4">
          <Card>
            <div className="space-y-4">
              {/* Nom */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Nom complet *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
                  placeholder="Votre nom"
                />
              </div>

              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Adresse email *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
                  placeholder="votre@email.com"
                />
              </div>

              {/* Sujet */}
              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Sujet *
                </label>
                <select
                  id="subject"
                  name="subject"
                  required
                  value={formData.subject}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
                >
                  <option value="">Sélectionnez un sujet</option>
                  <option value="suggestion">Suggestion d&apos;amélioration</option>
                  <option value="bug">Signaler un problème</option>
                  <option value="content">Contenu incorrect ou manquant</option>
                  <option value="partnership">Partenariat</option>
                  <option value="other">Autre</option>
                </select>
              </div>

              {/* Message */}
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Message *
                </label>
                <textarea
                  id="message"
                  name="message"
                  required
                  rows={5}
                  value={formData.message}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-primary focus:border-transparent transition-colors resize-none"
                  placeholder="Décrivez votre demande..."
                />
              </div>
            </div>
          </Card>

          {/* Bouton envoyer */}
          <button
            type="submit"
            className="w-full py-3 bg-primary hover:bg-primary/90 text-white font-medium rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            Envoyer le message
          </button>
        </form>
      )}

      {/* Autres moyens de contact */}
      <section className="space-y-3">
        <h3 className="font-semibold text-gray-800 dark:text-gray-100">Autres moyens de contact</h3>

        <Card>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center text-2xl">
              📧
            </div>
            <div>
              <p className="font-medium text-gray-800 dark:text-gray-100">Email</p>
              <a
                href="mailto:contact@secucitoyen.fr"
                className="text-sm text-primary dark:text-blue-400 hover:underline"
              >
                contact@secucitoyen.fr
              </a>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gray-100 dark:bg-slate-700 rounded-xl flex items-center justify-center text-2xl">
              🐙
            </div>
            <div>
              <p className="font-medium text-gray-800 dark:text-gray-100">GitHub</p>
              <a
                href="https://github.com/secucitoyen"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-primary dark:text-blue-400 hover:underline"
              >
                Signaler un bug ou contribuer
              </a>
            </div>
          </div>
        </Card>
      </section>

      {/* Info RGPD */}
      <section className="bg-gray-50 dark:bg-slate-800/50 border border-gray-100 dark:border-slate-700 rounded-xl p-4">
        <div className="flex gap-3">
          <div className="text-xl">🔒</div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Vos données sont traitées conformément au RGPD. Elles ne sont utilisées que pour répondre à votre demande et ne sont jamais partagées avec des tiers.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
