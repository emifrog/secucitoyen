import React, { useState } from 'react';
import { Shield, Heart, AlertTriangle, Phone, Flame, Droplets, Zap, Wind, Search, ChevronRight, ArrowLeft, Home, BookOpen, Bell, Menu, Check, MapPin, Clock, Star } from 'lucide-react';

const SecuCitoyenMockup = () => {
  const [currentScreen, setCurrentScreen] = useState('home');
  const [activeTab, setActiveTab] = useState('home');

  // Couleurs inspirées pompiers mais modernisées
  const colors = {
    primary: '#1E3A5F',      // Bleu marine profond
    accent: '#F97316',       // Orange vif
    danger: '#DC2626',       // Rouge urgence
    success: '#059669',      // Vert validation
    warning: '#FBBF24',      // Jaune alerte
    background: '#F8FAFC',   // Gris très clair
    card: '#FFFFFF',
    text: '#1E293B',
    textMuted: '#64748B',
  };

  // Composant téléphone
  const PhoneFrame = ({ children }) => (
    <div className="relative mx-auto" style={{ width: '375px', height: '812px' }}>
      {/* Cadre du téléphone */}
      <div 
        className="absolute inset-0 rounded-[3rem] shadow-2xl"
        style={{ 
          background: 'linear-gradient(145deg, #1a1a1a 0%, #2d2d2d 100%)',
          padding: '12px'
        }}
      >
        {/* Écran */}
        <div 
          className="relative w-full h-full rounded-[2.5rem] overflow-hidden"
          style={{ backgroundColor: colors.background }}
        >
          {/* Notch */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-7 bg-black rounded-b-2xl z-50" />
          
          {/* Contenu */}
          <div className="h-full pt-8 pb-0 flex flex-col">
            {children}
          </div>
        </div>
      </div>
    </div>
  );

  // Header
  const Header = ({ title, showBack, onBack }) => (
    <div 
      className="px-5 py-4 flex items-center gap-3"
      style={{ backgroundColor: colors.primary }}
    >
      {showBack && (
        <button onClick={onBack} className="p-1 -ml-1 text-white/80 hover:text-white">
          <ArrowLeft size={24} />
        </button>
      )}
      <h1 className="text-xl font-bold text-white flex-1">{title}</h1>
      {!showBack && (
        <div className="flex items-center gap-2">
          <Shield size={28} className="text-orange-400" />
        </div>
      )}
    </div>
  );

  // Bottom Navigation
  const BottomNav = () => (
    <div 
      className="flex items-center justify-around py-3 px-2 border-t"
      style={{ backgroundColor: colors.card, borderColor: '#E2E8F0' }}
    >
      {[
        { id: 'home', icon: Home, label: 'Accueil' },
        { id: 'prevention', icon: Shield, label: 'Prévention' },
        { id: 'secours', icon: Heart, label: 'Secours' },
        { id: 'alertes', icon: Bell, label: 'Alertes' },
      ].map(({ id, icon: Icon, label }) => (
        <button
          key={id}
          onClick={() => {
            setActiveTab(id);
            setCurrentScreen(id);
          }}
          className="flex flex-col items-center gap-1 px-3 py-1 rounded-xl transition-all"
          style={{
            color: activeTab === id ? colors.accent : colors.textMuted,
            backgroundColor: activeTab === id ? `${colors.accent}15` : 'transparent',
          }}
        >
          <Icon size={24} strokeWidth={activeTab === id ? 2.5 : 2} />
          <span className="text-xs font-medium">{label}</span>
        </button>
      ))}
    </div>
  );

  // Écran Accueil
  const HomeScreen = () => (
    <>
      <Header title="SécuCitoyen" />
      <div className="flex-1 overflow-y-auto">
        {/* Hero Section */}
        <div 
          className="mx-4 mt-4 p-5 rounded-2xl relative overflow-hidden"
          style={{ 
            background: `linear-gradient(135deg, ${colors.primary} 0%, #2d5a87 100%)`,
          }}
        >
          <div className="relative z-10">
            <p className="text-orange-300 text-sm font-semibold mb-1">Bienvenue</p>
            <h2 className="text-white text-2xl font-bold mb-2">
              Votre sécurité au quotidien
            </h2>
            <p className="text-white/70 text-sm">
              Prévention, premiers secours et alertes en temps réel
            </p>
          </div>
          {/* Décoration */}
          <div 
            className="absolute -right-8 -bottom-8 w-32 h-32 rounded-full opacity-10"
            style={{ backgroundColor: colors.accent }}
          />
          <Shield className="absolute right-4 bottom-4 text-white/20" size={64} />
        </div>

        {/* Quick Actions */}
        <div className="px-4 mt-6">
          <h3 className="text-lg font-bold mb-3" style={{ color: colors.text }}>
            Accès rapide
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {[
              { icon: Phone, label: 'Urgences', sublabel: '15 · 17 · 18 · 112', color: colors.danger, screen: 'urgences' },
              { icon: Heart, label: 'RCP', sublabel: 'Massage cardiaque', color: colors.accent, screen: 'rcp' },
              { icon: Flame, label: 'Incendie', sublabel: 'Que faire ?', color: '#EF4444', screen: 'incendie' },
              { icon: AlertTriangle, label: 'PLS', sublabel: 'Position sécurité', color: colors.success, screen: 'pls' },
            ].map(({ icon: Icon, label, sublabel, color, screen }) => (
              <button
                key={label}
                onClick={() => setCurrentScreen(screen)}
                className="p-4 rounded-2xl text-left transition-transform hover:scale-[1.02] active:scale-[0.98]"
                style={{ backgroundColor: colors.card, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}
              >
                <div 
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-3"
                  style={{ backgroundColor: `${color}15` }}
                >
                  <Icon size={24} style={{ color }} />
                </div>
                <p className="font-semibold" style={{ color: colors.text }}>{label}</p>
                <p className="text-xs mt-0.5" style={{ color: colors.textMuted }}>{sublabel}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Alerte en cours (exemple) */}
        <div className="px-4 mt-6 mb-4">
          <div 
            className="p-4 rounded-2xl border-l-4"
            style={{ 
              backgroundColor: `${colors.warning}15`,
              borderColor: colors.warning 
            }}
          >
            <div className="flex items-start gap-3">
              <div 
                className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: colors.warning }}
              >
                <Wind size={20} className="text-white" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-sm" style={{ color: colors.text }}>
                  Vigilance jaune - Vent
                </p>
                <p className="text-xs mt-1" style={{ color: colors.textMuted }}>
                  Alpes-Maritimes · Rafales jusqu'à 80 km/h attendues
                </p>
                <p className="text-xs mt-2 font-medium" style={{ color: colors.warning }}>
                  Voir les consignes →
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Conseils saisonniers */}
        <div className="px-4 mb-6">
          <h3 className="text-lg font-bold mb-3" style={{ color: colors.text }}>
            Conseils de saison
          </h3>
          <div 
            className="p-4 rounded-2xl flex items-center gap-4"
            style={{ backgroundColor: colors.card, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}
          >
            <div 
              className="w-14 h-14 rounded-2xl flex items-center justify-center"
              style={{ backgroundColor: `${colors.primary}10` }}
            >
              <Flame size={28} style={{ color: colors.primary }} />
            </div>
            <div className="flex-1">
              <p className="font-semibold" style={{ color: colors.text }}>
                Chauffage & Monoxyde
              </p>
              <p className="text-sm mt-0.5" style={{ color: colors.textMuted }}>
                5 gestes pour éviter l'intoxication
              </p>
            </div>
            <ChevronRight size={20} style={{ color: colors.textMuted }} />
          </div>
        </div>
      </div>
      <BottomNav />
    </>
  );

  // Écran Prévention
  const PreventionScreen = () => (
    <>
      <Header title="Prévention" />
      <div className="flex-1 overflow-y-auto">
        {/* Barre de recherche */}
        <div className="px-4 py-3">
          <div 
            className="flex items-center gap-3 px-4 py-3 rounded-xl"
            style={{ backgroundColor: colors.card, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}
          >
            <Search size={20} style={{ color: colors.textMuted }} />
            <span style={{ color: colors.textMuted }} className="text-sm">Rechercher un risque...</span>
          </div>
        </div>

        {/* Check-list maison */}
        <div className="px-4 mb-4">
          <div 
            className="p-4 rounded-2xl"
            style={{ 
              background: `linear-gradient(135deg, ${colors.accent} 0%, #ea580c 100%)`,
            }}
          >
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <p className="text-white/80 text-sm font-medium">Nouveau</p>
                <p className="text-white text-lg font-bold mt-1">
                  Audit sécurité maison
                </p>
                <p className="text-white/70 text-sm mt-1">
                  Vérifiez votre domicile pièce par pièce
                </p>
                <button className="mt-3 px-4 py-2 bg-white rounded-lg text-sm font-semibold" style={{ color: colors.accent }}>
                  Commencer →
                </button>
              </div>
              <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center">
                <Home size={32} className="text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Catégories de risques */}
        <div className="px-4">
          <h3 className="text-lg font-bold mb-3" style={{ color: colors.text }}>
            Types de risques
          </h3>
          <div className="space-y-3">
            {[
              { icon: Flame, label: 'Incendies', count: '12 fiches', color: '#EF4444' },
              { icon: Droplets, label: 'Noyades', count: '8 fiches', color: '#3B82F6' },
              { icon: Zap, label: 'Électrocutions', count: '6 fiches', color: '#FBBF24' },
              { icon: AlertTriangle, label: 'Chutes', count: '10 fiches', color: '#8B5CF6' },
              { icon: Wind, label: 'Intoxications', count: '9 fiches', color: '#10B981' },
            ].map(({ icon: Icon, label, count, color }) => (
              <button
                key={label}
                className="w-full p-4 rounded-2xl flex items-center gap-4 transition-transform hover:scale-[1.01] active:scale-[0.99]"
                style={{ backgroundColor: colors.card, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}
              >
                <div 
                  className="w-12 h-12 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: `${color}15` }}
                >
                  <Icon size={24} style={{ color }} />
                </div>
                <div className="flex-1 text-left">
                  <p className="font-semibold" style={{ color: colors.text }}>{label}</p>
                  <p className="text-sm" style={{ color: colors.textMuted }}>{count}</p>
                </div>
                <ChevronRight size={20} style={{ color: colors.textMuted }} />
              </button>
            ))}
          </div>
        </div>

        <div className="h-6" />
      </div>
      <BottomNav />
    </>
  );

  // Écran Premiers Secours
  const SecoursScreen = () => (
    <>
      <Header title="Premiers Secours" />
      <div className="flex-1 overflow-y-auto">
        {/* Numéros d'urgence */}
        <div className="px-4 py-3">
          <div 
            className="p-4 rounded-2xl"
            style={{ backgroundColor: colors.danger }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/80 text-sm">Numéros d'urgence</p>
                <p className="text-white text-2xl font-bold mt-1">15 · 17 · 18</p>
              </div>
              <button className="w-14 h-14 rounded-full bg-white flex items-center justify-center">
                <Phone size={28} style={{ color: colors.danger }} />
              </button>
            </div>
          </div>
        </div>

        {/* Gestes essentiels */}
        <div className="px-4 mt-2">
          <h3 className="text-lg font-bold mb-3" style={{ color: colors.text }}>
            Gestes essentiels
          </h3>
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'PLS', desc: 'Position latérale', color: colors.success },
              { label: 'RCP', desc: 'Massage cardiaque', color: colors.danger },
              { label: 'Heimlich', desc: 'Étouffement', color: colors.accent },
            ].map(({ label, desc, color }) => (
              <button
                key={label}
                className="p-3 rounded-2xl text-center"
                style={{ backgroundColor: colors.card, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}
              >
                <div 
                  className="w-12 h-12 rounded-full mx-auto flex items-center justify-center mb-2"
                  style={{ backgroundColor: `${color}15` }}
                >
                  <span className="text-lg font-bold" style={{ color }}>{label.charAt(0)}</span>
                </div>
                <p className="font-semibold text-sm" style={{ color: colors.text }}>{label}</p>
                <p className="text-xs mt-0.5" style={{ color: colors.textMuted }}>{desc}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Fiches par situation */}
        <div className="px-4 mt-6">
          <h3 className="text-lg font-bold mb-3" style={{ color: colors.text }}>
            Par situation
          </h3>
          <div className="space-y-3">
            {[
              { label: 'Brûlures', icon: Flame },
              { label: 'Hémorragies', icon: Droplets },
              { label: 'Fractures', icon: AlertTriangle },
              { label: 'Malaises', icon: Heart },
            ].map(({ label, icon: Icon }) => (
              <button
                key={label}
                className="w-full p-4 rounded-2xl flex items-center gap-4"
                style={{ backgroundColor: colors.card, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}
              >
                <div 
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: `${colors.primary}10` }}
                >
                  <Icon size={20} style={{ color: colors.primary }} />
                </div>
                <span className="flex-1 text-left font-medium" style={{ color: colors.text }}>{label}</span>
                <div className="flex items-center gap-2">
                  <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-700">Hors ligne</span>
                  <ChevronRight size={20} style={{ color: colors.textMuted }} />
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Lien formation */}
        <div className="px-4 mt-6 mb-6">
          <div 
            className="p-4 rounded-2xl border-2 border-dashed"
            style={{ borderColor: colors.primary }}
          >
            <div className="flex items-center gap-4">
              <Star size={24} style={{ color: colors.primary }} />
              <div className="flex-1">
                <p className="font-semibold" style={{ color: colors.text }}>
                  Formez-vous au PSC1
                </p>
                <p className="text-sm" style={{ color: colors.textMuted }}>
                  Trouvez une formation près de chez vous
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <BottomNav />
    </>
  );

  // Écran Alertes
  const AlertesScreen = () => (
    <>
      <Header title="Alertes" />
      <div className="flex-1 overflow-y-auto">
        {/* Localisation */}
        <div className="px-4 py-3">
          <div 
            className="p-3 rounded-xl flex items-center gap-3"
            style={{ backgroundColor: `${colors.primary}10` }}
          >
            <MapPin size={20} style={{ color: colors.primary }} />
            <span className="text-sm font-medium" style={{ color: colors.primary }}>
              Nice, Alpes-Maritimes
            </span>
            <button className="ml-auto text-xs font-semibold" style={{ color: colors.accent }}>
              Modifier
            </button>
          </div>
        </div>

        {/* Alertes actives */}
        <div className="px-4 mt-2">
          <h3 className="text-lg font-bold mb-3" style={{ color: colors.text }}>
            Alertes en cours
          </h3>
          
          {/* Alerte orange */}
          <div 
            className="p-4 rounded-2xl mb-3 border-l-4"
            style={{ 
              backgroundColor: colors.card,
              borderColor: colors.warning,
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
            }}
          >
            <div className="flex items-start gap-3">
              <div 
                className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: colors.warning }}
              >
                <Wind size={20} className="text-white" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-xs font-bold text-white" style={{ backgroundColor: colors.warning }}>
                    JAUNE
                  </span>
                  <span className="text-xs" style={{ color: colors.textMuted }}>
                    <Clock size={12} className="inline mr-1" />
                    Il y a 2h
                  </span>
                </div>
                <p className="font-semibold mt-2" style={{ color: colors.text }}>
                  Vigilance vent violent
                </p>
                <p className="text-sm mt-1" style={{ color: colors.textMuted }}>
                  Rafales jusqu'à 80 km/h. Soyez prudents lors de vos déplacements.
                </p>
                <button 
                  className="mt-3 text-sm font-semibold"
                  style={{ color: colors.accent }}
                >
                  Voir les consignes →
                </button>
              </div>
            </div>
          </div>

          {/* État normal */}
          <div 
            className="p-4 rounded-2xl flex items-center gap-4"
            style={{ backgroundColor: `${colors.success}10` }}
          >
            <div 
              className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{ backgroundColor: colors.success }}
            >
              <Check size={20} className="text-white" />
            </div>
            <div>
              <p className="font-semibold" style={{ color: colors.success }}>
                Pas d'autre alerte
              </p>
              <p className="text-sm" style={{ color: colors.textMuted }}>
                Votre zone est en vigilance normale
              </p>
            </div>
          </div>
        </div>

        {/* Historique */}
        <div className="px-4 mt-6">
          <h3 className="text-lg font-bold mb-3" style={{ color: colors.text }}>
            Historique récent
          </h3>
          <div className="space-y-2">
            {[
              { type: 'Pluie-inondation', level: 'Orange', date: '15 déc.' },
              { type: 'Neige-verglas', level: 'Jaune', date: '12 déc.' },
              { type: 'Vent', level: 'Jaune', date: '8 déc.' },
            ].map(({ type, level, date }, i) => (
              <div 
                key={i}
                className="p-3 rounded-xl flex items-center gap-3"
                style={{ backgroundColor: colors.card }}
              >
                <span 
                  className="w-2 h-2 rounded-full"
                  style={{ 
                    backgroundColor: level === 'Orange' ? colors.accent : colors.warning 
                  }}
                />
                <span className="flex-1 text-sm" style={{ color: colors.text }}>{type}</span>
                <span className="text-xs" style={{ color: colors.textMuted }}>{date}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="h-6" />
      </div>
      <BottomNav />
    </>
  );

  // Écran Fiche RCP (exemple détail)
  const RCPScreen = () => (
    <>
      <Header 
        title="Massage cardiaque (RCP)" 
        showBack 
        onBack={() => setCurrentScreen('home')} 
      />
      <div className="flex-1 overflow-y-auto">
        {/* Image placeholder */}
        <div 
          className="mx-4 mt-4 h-48 rounded-2xl flex items-center justify-center"
          style={{ backgroundColor: `${colors.danger}15` }}
        >
          <div className="text-center">
            <Heart size={64} style={{ color: colors.danger }} className="mx-auto" />
            <p className="text-sm mt-2 font-medium" style={{ color: colors.danger }}>
              Illustration animée
            </p>
          </div>
        </div>

        {/* Étapes */}
        <div className="px-4 mt-6">
          <h3 className="text-lg font-bold mb-4" style={{ color: colors.text }}>
            Les étapes
          </h3>
          
          {[
            { step: 1, title: 'Vérifier la conscience', desc: 'Tapotez les épaules et posez une question simple' },
            { step: 2, title: 'Appeler les secours', desc: 'Composez le 15 ou le 112, mettez en haut-parleur' },
            { step: 3, title: 'Placer vos mains', desc: 'Au centre de la poitrine, bras tendus' },
            { step: 4, title: 'Compressions', desc: '30 compressions à 100-120/min, 5-6 cm de profondeur' },
            { step: 5, title: 'Insufflations', desc: '2 insufflations si formé, sinon continuer les compressions' },
          ].map(({ step, title, desc }) => (
            <div key={step} className="flex gap-4 mb-4">
              <div 
                className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 font-bold text-white"
                style={{ backgroundColor: colors.danger }}
              >
                {step}
              </div>
              <div className="flex-1 pb-4 border-b" style={{ borderColor: '#E2E8F0' }}>
                <p className="font-semibold" style={{ color: colors.text }}>{title}</p>
                <p className="text-sm mt-1" style={{ color: colors.textMuted }}>{desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Badge hors ligne */}
        <div className="px-4 mb-6">
          <div 
            className="p-3 rounded-xl flex items-center gap-3"
            style={{ backgroundColor: `${colors.success}10` }}
          >
            <Check size={20} style={{ color: colors.success }} />
            <span className="text-sm font-medium" style={{ color: colors.success }}>
              Disponible hors connexion
            </span>
          </div>
        </div>
      </div>
    </>
  );

  // Router simple
  const renderScreen = () => {
    switch (currentScreen) {
      case 'prevention':
        return <PreventionScreen />;
      case 'secours':
        return <SecoursScreen />;
      case 'alertes':
        return <AlertesScreen />;
      case 'rcp':
        return <RCPScreen />;
      default:
        return <HomeScreen />;
    }
  };

  return (
    <div 
      className="min-h-screen py-8 px-4 flex items-center justify-center"
      style={{ 
        background: 'linear-gradient(135deg, #1E3A5F 0%, #0f2744 100%)',
      }}
    >
      {/* Titre */}
      <div className="absolute top-8 left-8 text-white">
        <h1 className="text-3xl font-bold">SécuCitoyen</h1>
        <p className="text-white/60 mt-1">Mockup Interface Mobile</p>
      </div>

      {/* Navigation démo */}
      <div className="absolute top-8 right-8 flex gap-2">
        {['Accueil', 'Prévention', 'Secours', 'Alertes', 'Fiche RCP'].map((label, i) => {
          const screens = ['home', 'prevention', 'secours', 'alertes', 'rcp'];
          return (
            <button
              key={label}
              onClick={() => {
                setCurrentScreen(screens[i]);
                if (i < 4) setActiveTab(screens[i]);
              }}
              className="px-3 py-1.5 rounded-lg text-sm font-medium transition-all"
              style={{
                backgroundColor: currentScreen === screens[i] ? colors.accent : 'rgba(255,255,255,0.1)',
                color: 'white',
              }}
            >
              {label}
            </button>
          );
        })}
      </div>

      <PhoneFrame>
        {renderScreen()}
      </PhoneFrame>
    </div>
  );
};

export default SecuCitoyenMockup;