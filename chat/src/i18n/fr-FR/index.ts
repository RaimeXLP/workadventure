import type { Translation } from "../i18n-types";

const fr_FR: Translation = {
    users: "Utilisateurs",
    userList: {
        disconnected: "Non connecté",
        isHere: "Sur cette map",
        inAnotherMap: "Dans une autre map",
        in: "Dans ",
        teleport: "Se téléporter",
        search: "Il suffit de chercher !",
        walkTo: "Marcher jusqu'à",
        teleporting: "Téléportation ...",
        businessCard: "Carte de visite",
    },
    connecting: "Connexion au serveur ...",
    waitingInit: "Attente de l'initialisation du serveur ...",
    waitingData: "En attentes des informations de l'utilisateur ...",
    searchUser: "Rechercher un utilisateur, une map, etc ...",
    searchChat: "Rechercher un canal, un message, etc ...",
    role: {
        admin: "Administrateur",
        member: "Membre",
        visitor: "Visiteur",
    },
    status: {
        online: "En ligne",
        away: "Absent",
        unavailable: "Non disponible",
    },
    logIn: "Se connecter",
    signIn: "Inscrivez-vous ou connectez-vous pour profiter de toutes les fonctionnalités du chat !",
    invite: "Inviter",
    roomEmpty: "Cette salle est vide, invitez un collègue ou un ami à vous rejoindre !",
    userOnline: "utilisateur en ligne",
    usersOnline: "utilisateurs en ligne",
    open: "Ouvrir",
    me: "Moi",
    you: "Vous",
    ban: {
        title: "Bannir",
        content: "Bannir l'utilisateur {userName} du monde courant. Cela peut être annulé depuis l'administration.",
        ban: "Bannir cet utilisateur",
    },
    loading: "Chargement",
    loadingUsers: "Chargement des utilisateurs ...",
    load: "Charger",
    rankUp: "Promouvoir",
    rankDown: "Rétrograder",
    reinit: "Ré initialiser",
    enterText: "Écrire un message ...",
    timeLine: {
        title: "Votre historique",
        open: "Ouvrir votre historique de conversation !",
        description: "Historique de vos conversations",
        incoming: " a rejoint la conversation",
        outcoming: " a quitté la conversation",
    },
    form: {
        placeholder: "Écrire votre message...",
        typing: " écrit...",
        application: {
            klaxoon: {
                title: "Klaxoon",
                description: "Envoyer un klaxoon dans le chat !",
                error: "L'URL Klaxoon n'est pas valide",
            },
            youtube: {
                title: "Youtube",
                description: "Envoyer une vidéo youtube dans le chat !",
                error: "L'URL Youtube n'est pas valide",
            },
            googleDocs: {
                title: "Google Docs",
                description: "Envoyer un document google docs dans le chat !",
                error: "L'URL Google Docs n'est pas valide",
            },
            googleSlides: {
                title: "Google Slides",
                description: "Envoyer une présentation google slides dans le chat !",
                error: "L'URL Google Slides n'est pas valide",
            },
            googleSheets: {
                title: "Google Sheets",
                description: "Envoyer un tableau google sheets dans le chat !",
                error: "L'URL Google Sheets n'est pas valide",
            },
            eraser: {
                title: "Eraser",
                description: "Envoyer un tableau eraser dans le chat !",
                error: "L'URL Eraser n'est pas valide",
            },
            excalidraw: {
                title: "Excalidraw",
                description: "Envoyer un dessin excalidraw dans le chat !",
                error: "L'URL Excalidraw n'est pas valide",
            },
            weblink: {
                error: "L'URL n'est pas valide",
            },
        },
    },
    notification: {
        discussion: "veut discuter avec toi",
        message: "a envoyé un message",
        forum: "sur le forum",
    },
    see: "Voir",
    show: "Voir",
    less: "moins",
    more: "plus",
    sendBack: "Renvoyer",
    delete: "Supprimer",
    messageDeleted: "Ce message a été supprimé par ",
    emoji: {
        icon: "Emojis",
        search: "Chercher un emoji...",
        categories: {
            recents: "Emojis récents",
            smileys: "Smileys & emotions",
            people: "Personne & corps",
            animals: "Animaux & nature",
            food: "Nourriture & boissons",
            activities: "Activités",
            travel: "Voyage & endroits",
            objects: "Objets",
            symbols: "Symbols",
            flags: "Drapeaux",
            custom: "Personnalisés",
        },
        notFound: "Aucun emoji trouvé",
    },
    said: "a dit :",
    reply: "Répondre",
    react: "Réagir",
    copy: "Copier",
    copied: "Copié !",
    file: {
        fileContentNoEmbed: "Le contenue n'est pas lisible sur le navigateur. Vous pouvez télécharger le document",
        download: "Téléchargement",
        openCoWebsite: "Ouvrir en co-website",
        copy: "Copier le lien",
        tooBig: "{fileName} est trop volumineux {maxFileSize}.",
        notLogged: "Vous devez être connecté pour télécharger un fichier.",
    },
    needRefresh: "Votre connexion a expiré, vous devez actualiser la page pour vous reconnecter au chat.",
    refresh: "Rafraichir",
    upgrade: "Passez premium",
    upgradeToSeeMore: "Passez premium pour voir plus de messages",
    disabled: "Cette fonctionnalité est désactivée.",
    disabledByAdmin: "Cette fonctionnalité est désactivée par l'administrateur.",
    anAdmin: "un administrateur",
    messageDeletedByYou: "Vous avez supprimé ce message",
    waiting: "En attente",
};

export default fr_FR;
