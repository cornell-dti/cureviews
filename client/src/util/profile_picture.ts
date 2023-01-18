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

function hashCode(netId: string) {
  var h = 0,
    l = netId.length,
    i = 0;
  if (l > 0) while (i < l) h = ((h << 5) - h + netId.charCodeAt(i++)) | 0;
  return h;
}

export function randomPicture(netId: string) {
  return profilePictures[hashCode(netId) % profilePictures.length];
}
