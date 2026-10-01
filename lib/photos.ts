const u = (id: string, w = 1200) =>
  `https://images.unsplash.com/${id}?q=70&w=${w}&auto=format&fit=crop`;

export const PHOTOS = {
  duplex: u("photo-1570129477492-45c003edd2be", 1100),
  keys: u("photo-1560518883-ce09059eeffa", 700),
  facade: u("photo-1582407947304-fd86f028f716", 900),
} as const;
