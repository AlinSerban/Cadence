// Removed unused import

export function getConcernedMessage(personality: string, _daysSinceLastLog: number): string {
    const messages = {
        encouraging: [
            "Hey there! I miss seeing your progress. Ready to get back on track? 💪",
            "Every journey has ups and downs. Let's get back to it together! 🌟",
            "I believe in you! Ready to start fresh? 🚀"
        ],
        playful: [
            "Where did you go? I was getting lonely! Come back and let's do something fun! 🎮",
            "I've been waiting for you! Let's play and make some progress! 🎯",
            "Missing our adventures together! Ready for a new one? ✨"
        ],
        energetic: [
            "Let's go! Time to channel that energy into something amazing! ⚡",
            "I'm pumped up and ready! Are you? Let's do this! 🔥",
            "No time to waste! Let's make today count! 💥"
        ],
        wise: [
            "It's okay to take breaks. When you're ready, I'll be here to support you. 🌸",
            "Every pause is a chance to reflect. Ready to continue your journey? 🧘",
            "Wisdom comes from both action and rest. What would you like to do? 🌿"
        ],
        sassy: [
            "Oh, so you're just going to leave me hanging? I thought we were a team! 😤",
            "Really? You're going to let me down like this? Come on, let's get moving! 😏",
            "I expected better from you! Time to prove me wrong! 💪"
        ]
    };

    const personalityMessages = messages[personality as keyof typeof messages] || messages.encouraging;
    return personalityMessages[Math.floor(Math.random() * personalityMessages.length)];
}

export function getCelebrationMessage(personality: string, level?: number): string {
    const messages = {
        encouraging: [
            "AMAZING! You leveled up! I'm so proud of your dedication! 🎉",
            "Incredible work! Level {level} unlocked! You're unstoppable! 🚀",
            "Outstanding! Your persistence is paying off! Keep it up! ⭐"
        ],
        playful: [
            "BOOM! Level up! You're officially awesome! Let's party! 🎊",
            "Level {level} achieved! Time to celebrate! 🎈",
            "You did it! Level up! I'm so excited! 🎉"
        ],
        energetic: [
            "YES! Level {level}! This is what I'm talking about! 🔥",
            "BOOM! Level up! You're on fire! Keep going! ⚡",
            "Incredible! Level {level} unlocked! Let's keep this energy! 💥"
        ],
        wise: [
            "Beautiful progress. You've earned this moment of celebration. ✨",
            "Level {level} achieved through wisdom and persistence. Well done. 🌸",
            "Your dedication has brought you here. Celebrate this milestone. 🧘"
        ],
        sassy: [
            "Finally! I knew you had it in you! Don't stop now! 😏",
            "Level {level}? I'm impressed! Keep proving me right! 😈",
            "About time! Level up! Now let's see what else you can do! 🔥"
        ]
    };

    const personalityMessages = messages[personality as keyof typeof messages] || messages.encouraging;
    const message = personalityMessages[Math.floor(Math.random() * personalityMessages.length)];
    return message.replace('{level}', level?.toString() || 'up');
}

export function getStreakMessage(personality: string, streak: number): string {
    const messages = {
        encouraging: [
            `Incredible! ${streak} days strong! You're building something amazing! 🔥`,
            `${streak} days of consistency! This is how legends are made! 💪`,
            `Wow! ${streak} days! Your dedication is inspiring! ⭐`
        ],
        playful: [
            `${streak} days?! You're on fire! I love this energy! 🔥🎮`,
            `${streak} days strong! We're unstoppable! 🎯✨`,
            `${streak} days! This is getting exciting! Let's keep going! 🎊`
        ],
        energetic: [
            `${streak} days! YES! This is what I'm talking about! ⚡`,
            `${streak} days of pure energy! Keep it flowing! 💥`,
            `${streak} days! You're absolutely crushing it! 🔥`
        ],
        wise: [
            `${streak} days of steady progress. This is beautiful to witness. 🌸`,
            `${streak} days of wisdom in action. Well done. 🧘`,
            `${streak} days of mindful progress. You're on the right path. 🌿`
        ],
        sassy: [
            `${streak} days? I'm impressed! Don't you dare break this streak now! 😤`,
            `${streak} days! Finally, you're living up to your potential! 😏`,
            `${streak} days strong! Keep proving me right! 🔥`
        ]
    };

    const personalityMessages = messages[personality as keyof typeof messages] || messages.encouraging;
    return personalityMessages[Math.floor(Math.random() * personalityMessages.length)];
}

export function getProudMessage(personality: string, activityName?: string): string {
    const messages = {
        encouraging: [
            "I'm so proud of you! Great work today! 🌟",
            "You're doing amazing! Keep up the fantastic work! 💪",
            "Your dedication is inspiring! Well done! ⭐"
        ],
        playful: [
            "You're awesome! I love seeing you in action! 🎮",
            "Great job! You make this look easy! ✨",
            "You're crushing it! This is so much fun! 🎯"
        ],
        energetic: [
            "YES! That's the energy I love to see! 🔥",
            "You're absolutely killing it! Keep going! ⚡",
            "Incredible work! This is what I'm talking about! 💥"
        ],
        wise: [
            "Your progress is beautiful to witness. 🌸",
            "Well done. Your consistency is paying off. 🧘",
            "You're on the right path. Keep going. 🌿"
        ],
        sassy: [
            "Finally! You're showing what you're made of! 😏",
            "About time! You're actually doing great! 😈",
            "I'm impressed! Keep proving me right! 🔥"
        ]
    };

    const personalityMessages = messages[personality as keyof typeof messages] || messages.encouraging;
    let message = personalityMessages[Math.floor(Math.random() * personalityMessages.length)];

    if (activityName) {
        message = message.replace('today', `with ${activityName}`);
    }

    return message;
}

export function getEncouragementMessage(personality: string): string {
    const messages = {
        encouraging: [
            "You've got this! I believe in you! 💪",
            "Every step counts! You're doing great! 🌟",
            "Take it one day at a time. You're stronger than you know! ⭐"
        ],
        playful: [
            "Come on, let's have some fun together! 🎮",
            "Ready for an adventure? Let's go! ✨",
            "I'm here for you! Let's make today awesome! 🎯"
        ],
        energetic: [
            "Let's channel that energy! You've got this! ⚡",
            "Time to get moving! I'm right here with you! 🔥",
            "Let's do this! I believe in your power! 💥"
        ],
        wise: [
            "Take a deep breath. You're exactly where you need to be. 🌸",
            "Wisdom comes from both action and patience. You're doing well. 🧘",
            "Trust the process. You're on your journey. 🌿"
        ],
        sassy: [
            "Come on, don't let me down! You're better than this! 😤",
            "I know you can do it! Prove me right! 😏",
            "Time to show what you're made of! Let's go! 🔥"
        ]
    };

    const personalityMessages = messages[personality as keyof typeof messages] || messages.encouraging;
    return personalityMessages[Math.floor(Math.random() * personalityMessages.length)];
}

export function getDefaultMessage(personality: string): string {
    const messages = {
        encouraging: [
            "Hi there! Ready to make today amazing? 🌟",
            "Hello! I'm here to support you on your journey! 💪",
            "Hey! Let's accomplish something great together! ⭐"
        ],
        playful: [
            "Hi! Ready to have some fun? 🎮",
            "Hello there! Let's play and make progress! ✨",
            "Hey! I'm excited to see what we'll do today! 🎯"
        ],
        energetic: [
            "Hi! Let's get this energy flowing! ⚡",
            "Hello! Ready to crush some goals? 🔥",
            "Hey! Time to make things happen! 💥"
        ],
        wise: [
            "Greetings. Ready to continue your journey? 🌸",
            "Hello. What wisdom shall we discover today? 🧘",
            "Hi. Let's approach today with mindfulness. 🌿"
        ],
        sassy: [
            "Oh, you're back! About time! 😏",
            "Hello there! Ready to actually do something? 😈",
            "Hey! Let's see if you can impress me today! 🔥"
        ]
    };

    const personalityMessages = messages[personality as keyof typeof messages] || messages.encouraging;
    return personalityMessages[Math.floor(Math.random() * personalityMessages.length)];
}

export function getPartnerEmoji(species: string, mood: string): string {
    const emojis = {
        cat: {
            idle: '😸',
            happy: '😺',
            excited: '🤩',
            concerned: '😿',
            celebrating: '🎉',
            sleepy: '😴'
        },
        dog: {
            idle: '🐕',
            happy: '🐕‍🦺',
            excited: '🤪',
            concerned: '😟',
            celebrating: '🎊',
            sleepy: '😴'
        },
        rabbit: {
            idle: '🐇',
            happy: '😊',
            excited: '🥳',
            concerned: '😔',
            celebrating: '✨',
            sleepy: '😴'
        },
        panda: {
            idle: '😌',
            happy: '😊',
            excited: '🤗',
            concerned: '😔',
            celebrating: '🎋',
            sleepy: '😴'
        },
        fox: {
            idle: '😏',
            happy: '😊',
            excited: '😈',
            concerned: '😤',
            celebrating: '🔥',
            sleepy: '😴'
        },
        owl: {
            idle: '🦉',
            happy: '😊',
            excited: '🤓',
            concerned: '😔',
            celebrating: '📚',
            sleepy: '😴'
        }
    };

    return emojis[species as keyof typeof emojis]?.[mood as keyof typeof emojis.cat] || '😊';
}
