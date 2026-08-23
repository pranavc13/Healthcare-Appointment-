const u = (id, w = 1200) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=80`;

export const IMAGES = {
  /* A calm, empty treatment room — the hero's focal image. */
  heroClinic: u('photo-1629909613654-28e377c37b09', 1400),
  reception: u('photo-1519494026892-80bbd2d6fd0d', 1200),
  consult: u('photo-1631217868264-e5b90bb7e133', 1200),
  team: u('photo-1666214280391-8ff5bd3c0bf0', 1200),
  corridor: u('photo-1538108149393-fbbd81895907', 1200),
};

/** Portrait pool used for doctor cards and the hero's trust row. */
export const FACES = [
  u('photo-1559839734-2b71ea197ec2', 400),
  u('photo-1612349317150-e413f6a5b16d', 400),
  u('photo-1622253692010-333f2da6031d', 400),
  u('photo-1594824476967-48c8b964273f', 400),
  u('photo-1591604021695-0c69b7c05981', 400),
  u('photo-1622902046580-2b47f47f5471', 400),
  u('photo-1643297654416-05795d62e39c', 400),
  u('photo-1651008376811-b90baee60c1f', 400),
  u('photo-1666887360742-974c8fce8e6b', 400),
  u('photo-1631217868264-e5b90bb7e133', 400),
];

/** Stable portrait per doctor id, so the same doctor keeps the same face. */
export function faceFor(key = '') {
  let h = 0;
  for (let i = 0; i < key.length; i += 1) h = (h * 31 + key.charCodeAt(i)) >>> 0;
  return FACES[h % FACES.length];
}
