import type { BaseTranslation } from "../i18n-types";

const en_US: BaseTranslation = {
    users: "Users",
    userList: {
        disconnected: "Disconnected",
        isHere: "Is on this map",
        inAnotherMap: "In another map",
        in: "In ",
        teleport: "Teleport",
        search: "Just look it up!",
        walkTo: "Walk to",
        teleporting: "Teleporting ...",
        businessCard: "Business Card",
    },
    connecting: "Connection to presence server ...",
    waitingInit: "Waiting for server initialization ...",
    waitingData: "Waiting user data ...",
    searchUser: "Search for user, map, etc ...",
    searchChat: "Search for channel, message, etc ...",
    role: {
        admin: "Administrator",
        member: "Member",
        visitor: "Visitor",
    },
    status: {
        online: "Online",
        away: "Away",
        unavailable: "Unavailable",
    },
    logIn: "Log in",
    signIn: "Register or log in to enjoy all the features of the chat !",
    invite: "Invite",
    roomEmpty: "This room is empty, invite a colleague or friend to join you!",
    userOnline: "user online",
    usersOnline: "users online",
    open: "Open",
    me: "Me",
    you: "You",
    ban: {
        title: "Ban",
        content: "Ban user {userName} from the running world. This can be cancelled from the administration.",
        ban: "Ban this user",
    },
    loading: "Loading",
    loadingUsers: "Loading the users ...",
    load: "Load",
    rankUp: "Promote",
    rankDown: "Retrograde",
    reinit: "Re initialize",
    enterText: "Enter a message ...",
    timeLine: {
        title: "Your Timeline",
        open: "Open your time line history!",
        description: "Messages and events history",
        incoming: " join the discussion",
        outcoming: " quit the discussion",
    },
    form: {
        placeholder: "Enter your message...",
        typing: " typing...",
        application: {
            klaxoon: {
                title: "Klaxoon",
                description: "Send embedded klaxoon in the chat!",
                error: "Please enter a valid Klaxoon URL",
            },
            youtube: {
                title: "Youtube",
                description: "Send embedded youtube video in the chat!",
                error: "Please enter a valid Youtube URL",
            },
            googleDocs: {
                title: "Google Docs",
                description: "Send embedded google docs in the chat!",
                error: "Please enter a valid Google Docs URL",
            },
            googleSlides: {
                title: "Google Slides",
                description: "Send embedded google slides in the chat!",
                error: "Please enter a valid Google Slides URL",
            },
            googleSheets: {
                title: "Google Sheets",
                description: "Send embedded google sheets in the chat!",
                error: "Please enter a valid Google Sheets URL",
            },
            eraser: {
                title: "Eraser",
                description: "Send embedded eraser in the chat!",
                error: "Please enter a valid Eraser URL",
            },
            excalidraw: {
                title: "Excalidraw",
                description: "Send embedded excalidraw in the chat!",
                error: "Please enter a valid Excalidraw URL",
            },
            weblink: {
                error: "Please enter a valid URL",
            },
        },
    },
    notification: {
        discussion: "wants to discuss with you",
        message: "sends a message",
        forum: "on the forum",
    },
    see: "See",
    show: "Show",
    less: "less",
    more: "more",
    sendBack: "Send back",
    delete: "Delete",
    messageDeleted: "This message was deleted by ",
    emoji: {
        icon: "Icon to open or close emoji selected popup",
        search: "Search emojis...",
        categories: {
            recents: "Recent Emojis",
            smileys: "Smileys & Emotion",
            people: "People & Body",
            animals: "Animals & Nature",
            food: "Food & Drink",
            activities: "Activities",
            travel: "Travel & Places",
            objects: "Objects",
            symbols: "Symbols",
            flags: "Flags",
            custom: "Custom",
        },
        notFound: "No emojis found",
    },
    said: "said :",
    reply: "Reply",
    react: "React",
    copy: "Copy",
    copied: "Copied!",
    file: {
        fileContentNoEmbed: "Content unavailable for viewing. Please download it",
        download: "download",
        openCoWebsite: "Open in co-website",
        copy: "copy the link",
        tooBig: "{fileName} is too big {maxFileSize}.",
        notLogged: "You need to be logged in to upload a file.",
    },
    needRefresh: "Your connection has expired, you need to refresh the page to reconnect to the chat.",
    refresh: "Refresh",
    upgrade: "Upgrade",
    upgradeToSeeMore: "Upgrade to see more messages",
    disabled: "This feature is disabled.",
    disabledByAdmin: "This feature is disabled by the administrator.",
    anAdmin: "an administrator",
    messageDeletedByYou: "You deleted this message",
    waiting: "Waiting",
};

export default en_US;
