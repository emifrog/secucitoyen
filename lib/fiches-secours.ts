export interface FicheSecours {
  id: string;
  title: string;
  icon: string;
  urgency: 'critical' | 'high' | 'medium';
  shortDescription: string;
  whenToAct: string[];
  steps: {
    title: string;
    description: string;
    warning?: string;
    tip?: string;
  }[];
  doNot: string[];
  callEmergency: {
    when: string;
    number: string;
    whatToSay: string[];
  };
}

export const fichesSecours: FicheSecours[] = [
  {
    id: 'arret-cardiaque',
    title: 'Arrêt cardiaque',
    icon: '❤️',
    urgency: 'critical',
    shortDescription: 'Massage cardiaque et utilisation du défibrillateur',
    whenToAct: [
      'La personne ne répond pas',
      'La personne ne respire pas ou respire anormalement (gasps)',
      'Ne cherchez pas le pouls : absence de réponse + respiration anormale = agissez',
    ],
    steps: [
      {
        title: 'Sécurisez et vérifiez',
        description: 'Assurez-vous que l\'environnement est sûr. Tapotez les épaules de la victime et demandez fort "Est-ce que vous m\'entendez ?"',
        tip: 'Si la personne ne répond pas, criez à l\'aide pour alerter les personnes autour.',
      },
      {
        title: 'Appelez les secours',
        description: 'Composez le 15 (SAMU) ou le 112. Mettez le haut-parleur pour continuer les gestes. Demandez à quelqu\'un d\'aller chercher un défibrillateur (DAE).',
        warning: 'Ne raccrochez jamais, le régulateur vous guide.',
      },
      {
        title: 'Vérifiez la respiration',
        description: 'Basculez la tête en arrière, soulevez le menton. Regardez si la poitrine se soulève, écoutez et sentez le souffle pendant 10 secondes maximum.',
        tip: 'Les gasps (respiration anormale, bruyante) ne sont PAS une respiration normale.',
      },
      {
        title: 'Commencez le massage',
        description: 'Placez le talon de votre main au centre de la poitrine, l\'autre main par-dessus. Bras tendus, compressez fort (5-6 cm) et vite (100-120/min).',
        tip: 'Rythme : pensez à "Stayin\' Alive" des Bee Gees.',
        warning: 'Ne vous arrêtez pas, même si vous entendez des craquements.',
      },
      {
        title: 'Alternez compressions et insufflations',
        description: '30 compressions puis 2 insufflations (si vous êtes formé). Pincez le nez, couvrez la bouche et soufflez 1 seconde jusqu\'à voir la poitrine se soulever.',
        tip: 'Si non formé aux insufflations, continuez uniquement les compressions.',
      },
      {
        title: 'Utilisez le défibrillateur',
        description: 'Dès qu\'un DAE arrive, allumez-le et suivez les instructions vocales. Collez les électrodes sur la poitrine nue et sèche. Éloignez-vous pendant l\'analyse et le choc.',
        warning: 'Ne touchez pas la victime pendant le choc électrique.',
      },
    ],
    doNot: [
      'N\'attendez pas pour commencer le massage',
      'N\'interrompez pas les compressions plus de 10 secondes',
      'Ne déplacez pas la victime sauf danger immédiat',
      'N\'ayez pas peur d\'appuyer trop fort',
    ],
    callEmergency: {
      when: 'Immédiatement dès que vous constatez l\'arrêt',
      number: '15 ou 112',
      whatToSay: [
        'Arrêt cardiaque en cours',
        'Adresse précise (rue, numéro, étage, code)',
        'Je commence le massage cardiaque',
        'Envoyez un défibrillateur',
      ],
    },
  },
  {
    id: 'etouffement',
    title: 'Étouffement',
    icon: '😮',
    urgency: 'critical',
    shortDescription: 'Désobstruction des voies aériennes chez l\'adulte, l\'enfant et le nourrisson',
    whenToAct: [
      'La personne porte les mains à sa gorge',
      'Elle ne peut plus parler, tousser ou respirer',
      'Son visage devient rouge puis bleu',
      'Elle émet des sifflements ou aucun son',
    ],
    steps: [
      {
        title: 'Évaluez la situation',
        description: 'Demandez "Est-ce que vous vous étouffez ?". Si la personne peut tousser, encouragez-la à continuer de tousser pour expulser l\'objet.',
        tip: 'Une toux efficace est le meilleur moyen d\'expulser un corps étranger.',
      },
      {
        title: 'Donnez 5 tapes dans le dos',
        description: 'Penchez la personne vers l\'avant. Avec le talon de la main, donnez 5 tapes fermes entre les omoplates.',
        warning: 'Frappez vers le haut et l\'extérieur pour faciliter l\'expulsion.',
      },
      {
        title: 'Faites 5 compressions abdominales',
        description: 'Placez-vous derrière la victime. Mettez votre poing fermé au-dessus du nombril, sous le sternum. Tirez franchement vers vous et vers le haut.',
        tip: 'C\'est la manœuvre de Heimlich.',
        warning: 'Ne faites pas Heimlich sur une femme enceinte ou une personne obèse : faites des compressions thoraciques.',
      },
      {
        title: 'Alternez tapes et compressions',
        description: 'Continuez à alterner 5 tapes dans le dos et 5 compressions abdominales jusqu\'à expulsion de l\'objet ou perte de conscience.',
      },
      {
        title: 'Nourrisson (moins d\'un an) : geste différent',
        description: 'Jamais de compressions abdominales. Allongez le nourrisson à plat ventre sur votre avant-bras, tête plus basse que le corps, et donnez 5 tapes dans le dos entre les omoplates. Sans effet, retournez-le sur le dos et faites 5 compressions thoraciques avec deux doigts au milieu de la poitrine. Alternez jusqu\'à la désobstruction.',
        warning: 'Ne secouez jamais un nourrisson et ne le tenez jamais par les pieds.',
      },
      {
        title: 'Si perte de conscience',
        description: 'Allongez la victime au sol, appelez le 15/112. Commencez la RCP (massage cardiaque). Regardez dans la bouche avant chaque insufflation pour retirer l\'objet visible.',
        warning: 'Ne mettez jamais vos doigts à l\'aveugle dans la bouche.',
      },
    ],
    doNot: [
      'N\'intervenez pas si la personne tousse efficacement',
      'Ne donnez pas de tapes dans le dos si la personne est debout droite',
      'Ne faites pas boire la personne',
      'Ne mettez pas vos doigts dans la gorge à l\'aveugle',
      'Ne faites jamais de compressions abdominales à un nourrisson de moins d\'un an',
    ],
    callEmergency: {
      when: 'Si l\'obstruction ne se lève pas après quelques cycles, ou immédiatement si perte de conscience',
      number: '15 ou 112',
      whatToSay: [
        'Étouffement en cours / Personne inconsciente après étouffement',
        'Adresse précise',
        'État de la victime (consciente/inconsciente)',
        'Gestes effectués',
      ],
    },
  },
  {
    id: 'hemorragie',
    title: 'Hémorragie',
    icon: '🩸',
    urgency: 'high',
    shortDescription: 'Compression et garrot en cas de saignement abondant',
    whenToAct: [
      'Le sang coule abondamment et ne s\'arrête pas',
      'Le sang imbibe rapidement un tissu ou forme une flaque',
      'La plaie est profonde ou béante',
      'Saignement après un accident grave',
    ],
    steps: [
      {
        title: 'Protégez-vous',
        description: 'Mettez des gants si disponibles ou utilisez un sac plastique. Évitez le contact direct avec le sang.',
        tip: 'Votre sécurité d\'abord. Demandez à la victime de comprimer elle-même si possible.',
      },
      {
        title: 'Allongez la victime',
        description: 'Faites allonger la personne pour éviter une chute en cas de malaise. Cela ralentit aussi le saignement.',
      },
      {
        title: 'Comprimez directement la plaie',
        description: 'Appuyez fortement sur la plaie avec un linge propre ou directement avec la main protégée. Maintenez une pression ferme et continue.',
        warning: 'Ne relâchez jamais la pression pour "voir si ça saigne encore".',
      },
      {
        title: 'Appelez les secours',
        description: 'Composez le 15 ou 112 ou demandez à un témoin de le faire pendant que vous maintenez la compression.',
      },
      {
        title: 'Allongez et couvrez',
        description: 'Gardez la victime allongée et maintenez la compression sans interruption jusqu\'à l\'arrivée des secours. Surélever le membre n\'est plus recommandé : cela n\'aide pas et détourne de la compression.',
        tip: 'Couvrez la victime pour éviter l\'hypothermie.',
      },
      {
        title: 'Garrot en dernier recours',
        description: 'Si la compression est inefficace (membre arraché, multiples victimes), posez un garrot 5 cm au-dessus de la plaie. Notez l\'heure de pose.',
        warning: 'Le garrot ne doit JAMAIS être desserré une fois posé, sauf par les secours.',
      },
    ],
    doNot: [
      'Ne retirez pas un objet planté dans la plaie',
      'Ne relâchez pas la pression avant l\'arrivée des secours',
      'Ne faites pas de garrot sur une articulation',
      'N\'appliquez pas de désinfectant sur une hémorragie grave',
    ],
    callEmergency: {
      when: 'Pour toute hémorragie abondante qui ne s\'arrête pas en quelques minutes',
      number: '15 ou 112',
      whatToSay: [
        'Hémorragie abondante',
        'Localisation de la plaie',
        'Cause (accident, chute, etc.)',
        'État de conscience de la victime',
      ],
    },
  },
  {
    id: 'brulures',
    title: 'Brûlures',
    icon: '🔥',
    urgency: 'medium',
    shortDescription: 'Premiers gestes pour brûlures thermiques et chimiques',
    whenToAct: [
      'Contact avec une source de chaleur (flamme, liquide chaud, objet brûlant)',
      'Brûlure électrique',
      'Projection de produit chimique',
      'Coup de soleil sévère',
    ],
    steps: [
      {
        title: 'Éloignez de la source',
        description: 'Éloignez la victime de la source de chaleur ou du produit chimique. Si les vêtements sont en feu : "Stop, drop and roll" (arrêtez, tombez, roulez).',
        warning: 'Pour une brûlure électrique, coupez d\'abord le courant avant de toucher la victime.',
      },
      {
        title: 'Refroidissez immédiatement',
        description: 'Faites couler de l\'eau tiède (15-20°C) sur la brûlure pendant 15 à 20 minutes. L\'eau doit couler doucement, pas sous pression.',
        tip: 'Commencez dès que possible : le refroidissement reste utile jusqu\'à 3 heures après la brûlure.',
        warning: 'N\'utilisez pas d\'eau glacée ni de glace, cela aggrave les lésions.',
      },
      {
        title: 'Retirez les vêtements et bijoux',
        description: 'Retirez délicatement les vêtements non collés et les bijoux (bagues, montres) avant que le gonflement ne s\'installe.',
        warning: 'Ne tirez JAMAIS sur un vêtement collé à la peau.',
      },
      {
        title: 'Évaluez la gravité',
        description: 'Estimez la surface (paume de la main = 1% du corps). Notez la profondeur : rouge (1er degré), cloques (2e degré), blanc/noir (3e degré).',
        tip: 'Brûlure grave si : > 10% du corps, visage, mains, pieds, parties génitales, ou 3e degré.',
      },
      {
        title: 'Protégez la brûlure',
        description: 'Couvrez d\'un linge propre et humide ou d\'un film alimentaire sans serrer.',
        warning: 'Ne percez jamais les cloques, ne mettez rien dessus (beurre, dentifrice, etc.).',
      },
    ],
    doNot: [
      'N\'appliquez pas de glace ou d\'eau glacée',
      'Ne percez pas les cloques',
      'N\'appliquez pas de corps gras (beurre, huile)',
      'Ne collez pas de coton ou pansement adhésif sur la brûlure',
      'N\'utilisez pas de désinfectant coloré (éosine)',
    ],
    callEmergency: {
      when: 'Brûlure étendue (> paume de main chez l\'enfant, > 10% adulte), profonde, ou sur zone sensible',
      number: '15 ou 112',
      whatToSay: [
        'Type de brûlure (thermique, chimique, électrique)',
        'Surface et localisation',
        'Aspect (rouge, cloques, blanc)',
        'Gestes effectués',
      ],
    },
  },
  {
    id: 'pls',
    title: 'Position Latérale de Sécurité',
    icon: '🛏️',
    urgency: 'medium',
    shortDescription: 'Mettre une personne inconsciente qui respire en sécurité',
    whenToAct: [
      'La personne est inconsciente (ne répond pas)',
      'Elle respire normalement',
      'Vous devez la laisser seule pour aller chercher de l\'aide',
    ],
    steps: [
      {
        title: 'Vérifiez la conscience',
        description: 'Secouez doucement les épaules et demandez fort "Est-ce que vous m\'entendez ? Serrez-moi la main !"',
        tip: 'Pas de réponse = inconscient. Criez à l\'aide.',
      },
      {
        title: 'Libérez les voies aériennes',
        description: 'Basculez la tête en arrière en soulevant le menton. Vérifiez la respiration pendant 10 secondes (regarder, écouter, sentir).',
        warning: 'Si pas de respiration normale, commencez le massage cardiaque.',
      },
      {
        title: 'Préparez la position',
        description: 'Allongez la victime sur le dos. Placez son bras le plus proche de vous à angle droit, coude plié, paume vers le haut.',
      },
      {
        title: 'Positionnez l\'autre bras',
        description: 'Prenez l\'autre main et amenez le dos de sa main contre sa joue côté vous. Gardez la main plaquée contre sa joue.',
      },
      {
        title: 'Faites rouler la victime',
        description: 'Avec votre autre main, attrapez le genou opposé et relevez-le. Tirez sur le genou pour faire rouler la victime vers vous.',
        tip: 'Le mouvement doit être fluide, en bloc.',
      },
      {
        title: 'Stabilisez la position',
        description: 'Ajustez la jambe du dessus à angle droit pour stabiliser. Ouvrez la bouche vers le sol pour que les liquides s\'écoulent. Vérifiez que la tête reste en arrière.',
        warning: 'Couvrez la victime et surveillez sa respiration en attendant les secours.',
      },
    ],
    doNot: [
      'Ne mettez pas en PLS quelqu\'un qui ne respire pas',
      'Ne laissez pas la personne sur le dos si vous devez vous absenter',
      'Ne mettez pas d\'oreiller sous la tête',
      'En cas de traumatisme (chute, accident) : limitez les mouvements de la tête et du cou pendant le retournement, mais mettez quand même en PLS — libérer les voies aériennes prime',
    ],
    callEmergency: {
      when: 'Toujours appeler le 15 pour une personne inconsciente',
      number: '15 ou 112',
      whatToSay: [
        'Personne inconsciente mais qui respire',
        'Mise en PLS effectuée',
        'Adresse précise',
        'Circonstances (chute, malaise, etc.)',
      ],
    },
  },
  {
    id: 'avc',
    title: 'AVC - Accident Vasculaire Cérébral',
    icon: '🧠',
    urgency: 'critical',
    shortDescription: 'Reconnaître et agir vite face à un AVC (règle FAST)',
    whenToAct: [
      'Visage paralysé ou asymétrique (bouche de travers)',
      'Bras ou jambe faible ou paralysé d\'un côté',
      'Difficultés à parler ou propos incohérents',
      'Maux de tête violents et soudains',
      'Troubles de la vision',
    ],
    steps: [
      {
        title: 'Appliquez la règle FAST',
        description: 'Face (visage tombant ?), Arms (lever les 2 bras), Speech (élocution difficile ?), Time (notez l\'heure des premiers symptômes).',
        warning: 'Chaque minute compte ! Les traitements sont efficaces dans les 4h30.',
      },
      {
        title: 'Appelez le 15 immédiatement',
        description: 'Composez le 15 (SAMU) et décrivez les symptômes. Précisez l\'heure exacte d\'apparition des premiers signes.',
        tip: 'Dites "Je suspecte un AVC" pour déclencher une prise en charge rapide.',
      },
      {
        title: 'Allongez la personne',
        description: 'Installez la victime allongée avec la tête légèrement surélevée (coussin). Si elle vomit, mettez-la en PLS.',
        warning: 'Ne la faites pas marcher et ne la laissez pas seule.',
      },
      {
        title: 'Rassemblez les informations',
        description: 'Notez l\'heure des symptômes, les traitements en cours (anticoagulants ?), antécédents médicaux.',
        tip: 'Ces infos sont cruciales pour les médecins.',
      },
      {
        title: 'Surveillez en attendant les secours',
        description: 'Surveillez la respiration et l\'état de conscience. Rassurez la personne, parlez-lui calmement.',
      },
    ],
    doNot: [
      'Ne donnez rien à boire ou manger (risque de fausse route)',
      'Ne donnez aucun médicament (même de l\'aspirine)',
      'Ne faites pas marcher la personne',
      'Ne minimisez pas les symptômes même s\'ils régressent',
    ],
    callEmergency: {
      when: 'Immédiatement dès le premier signe suspect',
      number: '15',
      whatToSay: [
        'Je suspecte un AVC',
        'Heure d\'apparition des symptômes',
        'Symptômes observés (FAST)',
        'Âge et antécédents de la personne',
      ],
    },
  },
  {
    id: 'noyade',
    title: 'Noyade',
    icon: '🌊',
    urgency: 'critical',
    shortDescription: 'Sauvetage et premiers secours en cas de noyade',
    whenToAct: [
      'Personne qui se débat dans l\'eau ou disparaît sous la surface',
      'Personne inconsciente trouvée dans l\'eau',
      'Personne sortie de l\'eau qui ne respire pas bien',
      'Enfant retrouvé près d\'un point d\'eau, léthargique ou toussant',
    ],
    steps: [
      {
        title: 'Assurez votre sécurité',
        description: 'N\'entrez pas dans l\'eau si vous ne savez pas nager ou si le courant est fort. Tendez un objet (branche, serviette) ou lancez une bouée.',
        warning: 'Beaucoup de sauveteurs improvisés se noient. Appelez les secours d\'abord !',
      },
      {
        title: 'Appelez les secours',
        description: 'Composez le 15, 18 ou 112. En mer : canal 16 VHF ou 196 (CROSS).',
        tip: 'Décrivez le lieu exact (plage, piscine, étang...).',
      },
      {
        title: 'Sortez la victime de l\'eau',
        description: 'Maintenez la tête hors de l\'eau. Si possible, gardez-la horizontale en la sortant. Posez-la au sol sur le dos.',
        warning: 'En cas de plongeon ou chute, suspectez un traumatisme cervical : immobilisez la nuque.',
      },
      {
        title: 'Vérifiez la conscience et la respiration',
        description: 'Secouez les épaules, demandez "Vous m\'entendez ?". Basculez la tête en arrière, regardez si la poitrine se soulève.',
      },
      {
        title: 'Si elle ne respire pas : 5 insufflations',
        description: 'Commencez par 5 insufflations (bouche-à-bouche). Pincez le nez, soufflez 1 seconde jusqu\'à voir la poitrine se soulever.',
        tip: 'Les poumons peuvent être remplis d\'eau, les insufflations sont prioritaires.',
      },
      {
        title: 'Puis massage cardiaque',
        description: 'Après les 5 insufflations, alternez 30 compressions et 2 insufflations. Continuez jusqu\'à l\'arrivée des secours ou la reprise de la respiration.',
      },
      {
        title: 'Si elle respire',
        description: 'Mettez-la en Position Latérale de Sécurité (PLS). Couvrez-la pour éviter l\'hypothermie.',
        warning: 'Surveillez-la : l\'état peut se dégrader (noyade secondaire).',
      },
    ],
    doNot: [
      'Ne vous mettez pas en danger pour sauver quelqu\'un',
      'Ne secouez pas la victime pour faire sortir l\'eau',
      'N\'essayez pas de vider l\'eau des poumons par pression sur le ventre',
      'Ne laissez jamais une personne qui a failli se noyer sans surveillance médicale',
    ],
    callEmergency: {
      when: 'Immédiatement, avant même de tenter un sauvetage',
      number: '15, 18 ou 112 (196 en mer)',
      whatToSay: [
        'Noyade en cours / personne sortie de l\'eau',
        'Localisation exacte du point d\'eau',
        'État de la victime (consciente, respire ?)',
        'Nombre de victimes',
      ],
    },
  },
  {
    id: 'electrocution',
    title: 'Électrocution',
    icon: '⚡',
    urgency: 'critical',
    shortDescription: 'Conduite à tenir en cas de contact électrique',
    whenToAct: [
      'Personne en contact avec une source électrique',
      'Personne retrouvée inconsciente près d\'un appareil électrique',
      'Brûlure avec point d\'entrée et de sortie',
      'Chute après un choc électrique',
    ],
    steps: [
      {
        title: 'Ne touchez pas la victime !',
        description: 'Vous risquez de vous électrocuter aussi. Évaluez la situation à distance.',
        warning: 'DANGER MORTEL : ne touchez jamais une personne en contact avec du courant.',
      },
      {
        title: 'Coupez le courant',
        description: 'Débranchez l\'appareil, coupez le disjoncteur général ou le compteur. Pour une ligne haute tension, éloignez-vous et appelez EDF/Enedis (au moins 10m).',
        warning: 'Haute tension : restez à distance et attendez les secours spécialisés.',
      },
      {
        title: 'Si impossible de couper : dégagez',
        description: 'Utilisez un objet isolant (bâton en bois sec, chaise en plastique) pour éloigner le câble ou la victime. Ne touchez rien de métallique.',
      },
      {
        title: 'Appelez les secours',
        description: 'Composez le 15 ou 112. Décrivez le type de courant (domestique, haute tension, foudre).',
      },
      {
        title: 'Vérifiez l\'état de la victime',
        description: 'Une fois le courant coupé, vérifiez conscience et respiration. Commencez la RCP si arrêt cardiaque.',
        tip: 'L\'électrocution cause souvent des arrêts cardiaques.',
      },
      {
        title: 'Recherchez les brûlures',
        description: 'Cherchez le point d\'entrée (contact) et de sortie (mise à la terre) du courant. Ces brûlures peuvent être profondes.',
        warning: 'Les lésions internes sont souvent bien plus graves que ce qu\'on voit.',
      },
      {
        title: 'Immobilisez si chute',
        description: 'Si la victime est tombée (projetée par le courant), suspectez une fracture ou un traumatisme crânien. Ne la déplacez pas.',
      },
    ],
    doNot: [
      'Ne touchez jamais une personne en contact avec le courant',
      'N\'utilisez pas d\'objet métallique ou mouillé pour dégager',
      'N\'approchez pas d\'une ligne haute tension tombée au sol',
      'Ne sous-estimez pas un choc électrique, même bénin en apparence',
    ],
    callEmergency: {
      when: 'Systématiquement, même si la personne semble aller bien',
      number: '15 ou 112',
      whatToSay: [
        'Électrocution (basse ou haute tension)',
        'Le courant est-il coupé ?',
        'État de la victime',
        'Brûlures visibles',
      ],
    },
  },
  {
    id: 'morsures',
    title: 'Morsures et piqûres',
    icon: '🐍',
    urgency: 'high',
    shortDescription: 'Conduite à tenir en cas de morsure de serpent, chien ou piqûre',
    whenToAct: [
      'Morsure de serpent (vipère)',
      'Morsure de chien ou animal',
      'Piqûre d\'insecte avec réaction allergique',
      'Piqûre de méduse ou poisson venimeux',
    ],
    steps: [
      {
        title: 'Calmez la victime et vous-même',
        description: 'Le stress accélère la diffusion du venin. Faites asseoir ou allonger la victime. Gardez le membre mordu immobile et plus bas que le cœur.',
      },
      {
        title: 'Morsure de serpent',
        description: 'Retirez bagues, montres, bracelets (gonflement). Nettoyez à l\'eau et au savon. Immobilisez le membre avec une attelle improvisée.',
        warning: 'N\'incisez pas, ne sucez pas, ne posez pas de garrot, ne mettez pas de glace !',
        tip: 'Prenez une photo du serpent si possible pour aider à l\'identification.',
      },
      {
        title: 'Morsure de chien/animal',
        description: 'Nettoyez abondamment à l\'eau et au savon pendant 10 min. Désinfectez. Comprimez si ça saigne beaucoup.',
        warning: 'Consultez pour antirabique si animal errant, comportement anormal ou non vacciné.',
      },
      {
        title: 'Piqûre d\'insecte',
        description: 'Retirez le dard en grattant (pas avec une pince). Désinfectez. Appliquez du froid. Surveillez une réaction allergique.',
        warning: 'Signes d\'allergie grave : gonflement du visage, difficultés à respirer → 15 immédiatement.',
      },
      {
        title: 'Piqûre de méduse',
        description: 'Rincez à l\'eau de mer (pas d\'eau douce !). Retirez les filaments avec le bord d\'une carte rigide ou une pince, sans frotter et sans sable. Appliquez du chaud (40-45°C) pendant 20 min.',
        tip: 'L\'eau chaude inactive le venin de la plupart des méduses.',
      },
      {
        title: 'Surveillez les signes de gravité',
        description: 'Gonflement important, difficultés respiratoires, malaise, vomissements = urgence 15.',
      },
    ],
    doNot: [
      'N\'aspirez pas le venin avec la bouche',
      'Ne posez pas de garrot',
      'Ne mettez pas de glace sur une morsure de serpent',
      'Ne tuez pas l\'animal (danger + illégal pour espèces protégées)',
      'N\'attendez pas pour consulter en cas de morsure animale',
    ],
    callEmergency: {
      when: 'Morsure de serpent, réaction allergique, morsure profonde ou au visage',
      number: '15 ou 112',
      whatToSay: [
        'Type de morsure/piqûre',
        'Description de l\'animal si possible',
        'Heure de la morsure',
        'Symptômes actuels',
      ],
    },
  },
  {
    id: 'fractures',
    title: 'Fractures et traumatismes',
    icon: '🦴',
    urgency: 'high',
    shortDescription: 'Immobiliser une fracture et gérer un traumatisme',
    whenToAct: [
      'Déformation visible d\'un membre',
      'Douleur intense localisée après un choc',
      'Impossibilité de bouger le membre',
      'Gonflement rapide et hématome',
      'Craquement entendu lors du choc',
    ],
    steps: [
      {
        title: 'Ne déplacez pas la victime',
        description: 'Sauf danger immédiat (feu, risque d\'explosion), ne bougez pas la personne. Si elle est consciente, demandez-lui de ne pas bouger.',
        warning: 'Suspectez une fracture de la colonne si accident violent, chute de hauteur ou plongeon.',
      },
      {
        title: 'Immobilisez le membre',
        description: 'Maintenez le membre dans la position où il se trouve. N\'essayez pas de le remettre en place. Utilisez des attelles improvisées (journal roulé, planche).',
        tip: 'L\'attelle doit immobiliser l\'articulation au-dessus ET en-dessous de la fracture.',
      },
      {
        title: 'Appliquez du froid',
        description: 'Mettez de la glace dans un linge (jamais directement sur la peau). Appliquez 15-20 min pour réduire le gonflement.',
      },
      {
        title: 'Fracture ouverte',
        description: 'Si l\'os est visible ou si ça saigne : ne touchez pas l\'os, couvrez la plaie d\'un linge propre, ne serrez pas.',
        warning: 'Ne retirez rien de planté dans la plaie.',
      },
      {
        title: 'Surveillez la circulation',
        description: 'Vérifiez que les doigts/orteils restent roses, mobiles et sensibles. Un membre bleu, froid ou insensible = urgence.',
      },
      {
        title: 'Appelez les secours',
        description: 'Pour toute fracture de la cuisse, du bassin, de la colonne, ou si fracture ouverte. Pour les autres, conduisez aux urgences.',
      },
    ],
    doNot: [
      'Ne tentez jamais de remettre un os en place',
      'Ne faites pas marcher sur une jambe fracturée',
      'Ne retirez pas un objet planté',
      'Ne serrez pas trop les attelles',
      'N\'appliquez pas de pommade ou de chaleur',
    ],
    callEmergency: {
      when: 'Fracture ouverte, cuisse, bassin, colonne, ou victime incapable de se déplacer',
      number: '15 ou 112',
      whatToSay: [
        'Suspicion de fracture',
        'Localisation',
        'Circonstances (chute, accident...)',
        'État de la victime',
      ],
    },
  },
  {
    id: 'malaise-cardiaque',
    title: 'Malaise cardiaque',
    icon: '💔',
    urgency: 'critical',
    shortDescription: 'Reconnaître et agir face à un infarctus',
    whenToAct: [
      'Douleur oppressante au centre de la poitrine',
      'Douleur irradiant vers le bras gauche, la mâchoire ou le dos',
      'Sensation d\'écrasement thoracique',
      'Essoufflement, sueurs, nausées',
      'Angoisse, sensation de mort imminente',
    ],
    steps: [
      {
        title: 'Appelez le 15 immédiatement',
        description: 'Dites "Je suspecte un infarctus". Chaque minute compte : le muscle cardiaque meurt sans oxygène.',
        warning: 'Même si les symptômes diminuent, appelez quand même.',
      },
      {
        title: 'Installez la personne au repos',
        description: 'Position demi-assise, dos calé. C\'est la position qui soulage le plus le cœur.',
        tip: 'Desserrez col, ceinture, cravate pour faciliter la respiration.',
      },
      {
        title: 'Donnez de l\'aspirine si disponible',
        description: 'Si la personne n\'est pas allergique et peut avaler : 1 comprimé de 300mg à croquer (pas à avaler avec de l\'eau).',
        warning: 'Uniquement si le 15 vous le confirme ou si vous êtes certain qu\'il n\'y a pas de contre-indication.',
      },
      {
        title: 'Si la personne a un traitement',
        description: 'Si elle a de la trinitrine (Natispray, Trinitrine) prescrite, aidez-la à l\'utiliser : 1-2 pulvérisations sous la langue.',
      },
      {
        title: 'Surveillez attentivement',
        description: 'Restez avec elle, parlez-lui calmement pour la rassurer. Surveillez sa conscience et sa respiration.',
        warning: 'Préparez-vous à faire un massage cardiaque si arrêt cardiaque.',
      },
      {
        title: 'Si perte de conscience et arrêt respiratoire',
        description: 'Allongez la personne, commencez immédiatement le massage cardiaque. Demandez un défibrillateur.',
      },
    ],
    doNot: [
      'Ne laissez pas la personne faire des efforts',
      'Ne minimisez pas les symptômes chez les femmes (souvent atypiques)',
      'Ne donnez pas d\'aspirine si allergie ou saignement récent',
      'N\'attendez pas que "ça passe"',
    ],
    callEmergency: {
      when: 'Dès le premier signe de douleur thoracique suspecte',
      number: '15',
      whatToSay: [
        'Je suspecte un infarctus',
        'Symptômes (douleur, essoufflement, sueurs)',
        'Heure de début',
        'Antécédents cardiaques connus',
      ],
    },
  },
  {
    id: 'hypothermie',
    title: 'Hypothermie',
    icon: '🥶',
    urgency: 'high',
    shortDescription: 'Réchauffer une personne en hypothermie',
    whenToAct: [
      'Exposition prolongée au froid ou à l\'eau froide',
      'Frissons intenses ou, au contraire, absence de frissons (grave)',
      'Peau froide et pâle',
      'Confusion, élocution difficile',
      'Somnolence, perte de coordination',
    ],
    steps: [
      {
        title: 'Mettez à l\'abri du froid',
        description: 'Déplacez la victime dans un endroit chaud ou abrité du vent. Isolez-la du sol froid (couvertures, vêtements).',
        warning: 'Manipulez délicatement : le cœur est très sensible en hypothermie.',
      },
      {
        title: 'Retirez les vêtements mouillés',
        description: 'Remplacez-les par des vêtements secs. Enveloppez dans des couvertures, sac de couchage, couverture de survie.',
        tip: 'Couvrez surtout la tête et le cou (grande perte de chaleur).',
      },
      {
        title: 'Réchauffez progressivement',
        description: 'Réchauffement passif : couvertures, pièce chauffée. Vous pouvez appliquer des bouillottes sur le tronc (aisselles, cou), jamais sur les membres.',
        warning: 'Ne réchauffez JAMAIS les bras et jambes en premier (risque cardiaque).',
      },
      {
        title: 'Si la personne est consciente',
        description: 'Donnez des boissons chaudes sucrées (pas d\'alcool). Faites faire des petits mouvements pour produire de la chaleur.',
      },
      {
        title: 'Si inconsciente ou hypothermie sévère',
        description: 'Appelez le 15 immédiatement. Ne frottez pas la peau. Vérifiez la respiration (elle peut être très lente).',
        warning: 'En hypothermie sévère, le pouls peut être imperceptible mais présent. Vérifiez 1 minute.',
      },
      {
        title: 'Si arrêt cardiaque',
        description: 'Commencez la RCP et continuez jusqu\'à l\'arrivée des secours. "On n\'est pas mort de froid tant qu\'on n\'est pas chaud et mort."',
      },
    ],
    doNot: [
      'Ne frottez pas les membres (risque de lésions)',
      'Ne donnez pas d\'alcool (il aggrave l\'hypothermie)',
      'Ne réchauffez pas brutalement (bain chaud)',
      'Ne faites pas faire d\'efforts physiques intenses',
      'N\'abandonnez pas la RCP même si la personne semble morte',
    ],
    callEmergency: {
      when: 'Hypothermie sévère (confusion, somnolence, absence de frissons)',
      number: '15 ou 112',
      whatToSay: [
        'Hypothermie suspectée',
        'Durée d\'exposition au froid',
        'État de conscience',
        'Température estimée si thermomètre disponible',
      ],
    },
  },
  {
    id: 'convulsions',
    title: 'Convulsions et épilepsie',
    icon: '⚡',
    urgency: 'high',
    shortDescription: 'Protéger une personne en crise convulsive',
    whenToAct: [
      'Chute brutale avec raidissement du corps',
      'Mouvements saccadés incontrôlés des membres',
      'Perte de conscience pendant la crise',
      'Morsure de langue, bave ou mousse aux lèvres',
      'Parfois perte d\'urines',
    ],
    steps: [
      {
        title: 'Restez calme et chronométrez',
        description: 'Notez l\'heure de début. La plupart des crises durent moins de 2 minutes.',
        warning: 'Crise de plus de 5 minutes = urgence absolue (état de mal épileptique).',
      },
      {
        title: 'Protégez des blessures',
        description: 'Éloignez les objets dangereux. Glissez quelque chose de mou sous la tête (veste, coussin).',
        warning: 'Ne maintenez pas les membres, ne mettez rien dans la bouche !',
      },
      {
        title: 'Laissez la crise se dérouler',
        description: 'N\'essayez pas d\'arrêter les mouvements. Ne donnez rien à boire ou manger.',
      },
      {
        title: 'Après la crise',
        description: 'La personne sera confuse et fatiguée. C\'est normal. Mettez-la en PLS. Parlez-lui calmement.',
        tip: 'La récupération peut prendre 10-30 minutes.',
      },
      {
        title: 'Vérifiez les blessures',
        description: 'Cherchez des blessures liées à la chute ou des morsures de langue.',
      },
      {
        title: 'Quand appeler le 15',
        description: 'Première crise, crise > 5 min, crises répétées, pas de reprise de conscience, grossesse, diabète, blessure.',
      },
    ],
    doNot: [
      'N\'essayez pas d\'ouvrir la bouche ou d\'y mettre un objet',
      'Ne maintenez pas la personne de force',
      'Ne donnez rien à boire ou manger pendant ou juste après',
      'Ne laissez pas la personne seule après la crise',
    ],
    callEmergency: {
      when: 'Première crise, crise > 5 min, pas de retour à la conscience, blessure',
      number: '15 ou 112',
      whatToSay: [
        'Crise convulsive / épilepsie',
        'Durée de la crise',
        'État actuel (conscient ou non)',
        'Antécédents connus d\'épilepsie',
      ],
    },
  },
  {
    id: 'intoxication',
    title: 'Intoxication et empoisonnement',
    icon: '☠️',
    urgency: 'high',
    shortDescription: 'Conduite à tenir en cas d\'ingestion de produit toxique',
    whenToAct: [
      'Ingestion de produit ménager, médicament, plante toxique',
      'Inhalation de gaz ou fumées toxiques',
      'Contact cutané avec un produit chimique',
      'Symptômes : nausées, vomissements, confusion, difficultés respiratoires',
    ],
    steps: [
      {
        title: 'Identifiez le produit',
        description: 'Gardez l\'emballage, le flacon ou le reste de la substance. Notez la quantité approximative et l\'heure d\'ingestion.',
        tip: 'Prenez une photo de l\'étiquette si possible.',
      },
      {
        title: 'Appelez le centre antipoison',
        description: 'Téléphonez immédiatement au centre antipoison de votre région. Ils vous guideront selon le produit.',
        tip: 'Centres antipoison : Paris 01 40 05 48 48, Lyon 04 72 11 69 11, Marseille 04 91 75 25 25...',
      },
      {
        title: 'Ne faites pas vomir',
        description: 'Sauf si le centre antipoison le demande explicitement. Faire vomir peut aggraver les lésions (produits caustiques, moussants, pétrole).',
        warning: 'Ne donnez jamais de lait (ne neutralise pas les poisons).',
      },
      {
        title: 'Inhalation de gaz',
        description: 'Aérez la pièce ou sortez à l\'air libre. Si odeur de gaz, n\'actionnez pas d\'interrupteur (étincelle). Coupez l\'arrivée de gaz.',
        warning: 'Suspicion de monoxyde de carbone : évacuez et appelez le 15 et les pompiers.',
      },
      {
        title: 'Contact avec la peau ou les yeux',
        description: 'Rincez abondamment à l\'eau pendant 15-20 minutes. Retirez les vêtements contaminés.',
      },
      {
        title: 'Si perte de conscience',
        description: 'Mettez en PLS si elle respire. Commencez la RCP si arrêt respiratoire. Bouche-à-bouche protégé si possible.',
      },
    ],
    doNot: [
      'Ne faites pas vomir sans avis médical',
      'Ne donnez pas de lait, d\'huile ou d\'eau',
      'Ne tardez pas à appeler même si les symptômes semblent légers',
      'Ne jetez pas le produit en cause',
    ],
    callEmergency: {
      when: 'Troubles de la conscience, difficultés respiratoires, produit très toxique',
      number: '15 (+ centre antipoison)',
      whatToSay: [
        'Nom exact du produit',
        'Quantité ingérée/exposée',
        'Heure de l\'exposition',
        'Symptômes actuels',
        'Âge et poids de la victime',
      ],
    },
  },
];

export function getFicheById(id: string): FicheSecours | undefined {
  return fichesSecours.find((fiche) => fiche.id === id);
}

export function getFichesSummary() {
  return fichesSecours.map(({ id, title, icon, urgency, shortDescription }) => ({
    id,
    title,
    icon,
    urgency,
    shortDescription,
  }));
}
