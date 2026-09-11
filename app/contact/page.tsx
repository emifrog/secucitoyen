import type { Metadata } from 'next';
import { Card } from '@/components/ui';
import ContactForm from '@/components/contact/ContactForm';

export const metadata: Metadata = {
  title: 'Contact',
  description: 'Une question, une suggestion ou un contenu à corriger ? Contactez l’équipe SécuCitoyen.',
  alternates: { canonical: '/contact' },
};

export default function ContactPage() {
  return (
    <div className="p-4 space-y-5">
      {/* Header */}
      <section>
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">Contact</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Une question, une suggestion ? Contactez-nous.
        </p>
      </section>

      {/* Alerte importante */}
      <section className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
        <div className="flex gap-3">
          <div className="text-2xl" aria-hidden="true">🚨</div>
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

      <ContactForm />

      {/* Autres moyens de contact */}
      <section className="space-y-3">
        <h2 className="font-semibold text-gray-800 dark:text-gray-100">Autres moyens de contact</h2>
        <Card>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center text-2xl" aria-hidden="true">
              📧
            </div>
            <div>
              <p className="font-medium text-gray-800 dark:text-gray-100">E-mail</p>
              <a href="mailto:xav.robart@gmail.com" className="text-sm text-primary dark:text-blue-400 hover:underline">
                xav.robart@gmail.com
              </a>
            </div>
          </div>
        </Card>
      </section>

      {/* Info RGPD */}
      <section className="bg-gray-50 dark:bg-slate-800/50 border border-gray-100 dark:border-slate-700 rounded-xl p-4">
        <div className="flex gap-3">
          <div className="text-xl" aria-hidden="true">🔒</div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Le message part de votre propre messagerie : aucune donnée n&apos;est stockée par
            SécuCitoyen. Elle n&apos;est utilisée que pour vous répondre et n&apos;est jamais partagée.
          </p>
        </div>
      </section>
    </div>
  );
}
