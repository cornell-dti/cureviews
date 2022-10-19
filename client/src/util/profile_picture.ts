

const profilePictures = [
    "/profile_bear/profile_bear_dark_blue.svg",
    "/profile_bear/profile_bear_light_blue.svg",
    "/profile_bear/profile_bear_light_pink.svg",
    "/profile_bear/profile_bear_mint.png",
    "/profile_bear/profile_bear_orange.svg",
    "/profile_bear/profile_bear_purple.svg",
    "/profile_bear/profile_bear_red.svg",
    "/profile_bear/profile_bear_yellow.svg",
];

export function randomPicture() {
    return profilePictures[Math.floor(Math.random() * profilePictures.length)];
}