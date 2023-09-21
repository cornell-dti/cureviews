const profilePictures = [
  '/profile_bear/profile_bear_dark_blue.svg',
  '/profile_bear/profile_bear_light_blue.svg',
  '/profile_bear/profile_bear_light_pink.svg',
  '/profile_bear/profile_bear_mint.png',
  '/profile_bear/profile_bear_orange.svg',
  '/profile_bear/profile_bear_purple.svg',
  '/profile_bear/profile_bear_red.svg',
  '/profile_bear/profile_bear_yellow.svg',
]

function hashCode(netId: string) {
  var hash = 0
  for (var i = 0; i < netId.length; i++) {
    var code = netId.charCodeAt(i)
    hash = (hash << 5) - hash + code
    hash = hash & hash
  }
  return hash
}

export function randomPicture(netId: string) {
  return profilePictures[hashCode(netId) % profilePictures.length]
}
