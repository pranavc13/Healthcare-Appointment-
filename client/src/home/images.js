const u = (id, w = 1200) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=80`;

export const IMAGES = {
  heroClinic: u('photo-1666214280391-8ff5bd3c0bf0', 1400),
  reception: u('photo-1586773860418-d37222d8fce3', 1200),
  consult: u('photo-1579684385127-1ef15d508118', 1200),
  team: u('photo-1631217868264-e5b90bb7e133', 1200),
  corridor: u('photo-1519494026892-80bbd2d6fd0d', 1200),
  equipment: u('photo-1576091160550-2173dba999ef', 1000),
  lab: u('photo-1584982751601-97dcc096659c', 1000),
};

export const FACES = [
  u('photo-1559839734-2b71ea197ec2', 200),
  u('photo-1622253692010-333f2da6031d', 200),
  u('photo-1612349317150-e413f6a5b16d', 200),
  u('photo-1594824476967-48c8b964273f', 200),
  u('photo-1538108149393-fbbd81895907', 200),
  u('photo-1551190822-a9333d879b1f', 200),
];

/** Stable portrait per doctor id, so the same doctor keeps the same face. */
export function faceFor(key = '') {
  let h = 0;
  for (let i = 0; i < key.length; i += 1) h = (h * 31 + key.charCodeAt(i)) >>> 0;
  return FACES[h % FACES.length];
}
