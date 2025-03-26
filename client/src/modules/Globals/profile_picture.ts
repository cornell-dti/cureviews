const profilePictures = [
  '/profile-bears/profile_bear_dark_blue.svg',
  '/profile-bears/profile_bear_light_blue.svg',
  '/profile-bears/profile_bear_light_pink.svg',
  '/profile-bears/profile_bear_mint.png',
  '/profile-bears/profile_bear_orange.svg',
  '/profile-bears/profile_bear_purple.svg',
  '/profile-bears/profile_bear_red.svg',
  '/profile-bears/profile_bear_yellow.svg'
];

function hashCode(netId: string) {
  let hash = 0;
  for (let i = 0; i < netId.length; i++) {
    const code = netId.charCodeAt(i);
    hash = (hash << 5) - hash + code;
    hash = hash & hash;
  }
  return hash;
}

export function randomPicture(netId: string) {
  return profilePictures[Math.abs(hashCode(netId) % profilePictures.length)];
}
