// Reviews mock data for Kaeloo products
// Each entry: productId -> [{ id, name, rating, date, title, body, verified }]

const commonReviews = [
  {
    name: 'Lucas M.',
    rating: 5,
    date: '2 weeks ago',
    dateFr: 'il y a 2 semaines',
    titleEn: 'Incredible quality',
    titleFr: 'Qualité incroyable',
    bodyEn: 'Honestly one of the best purchases I have made. Quality is way above what I expected.',
    bodyFr: 'Franchement un de mes meilleurs achats. La qualité est bien au-dessus de ce que j\'attendais.',
    verified: true,
  },
  {
    name: 'Chloé D.',
    rating: 5,
    date: '1 month ago',
    dateFr: 'il y a 1 mois',
    titleEn: 'Amazing',
    titleFr: 'Incroyable',
    bodyEn: 'Absolutely stunning. Looks even better in person than on the pictures.',
    bodyFr: 'Vraiment magnifique. C\'est encore mieux en vrai qu\'en photo.',
    verified: true,
  },
  {
    name: 'Adam T.',
    rating: 5,
    date: '3 weeks ago',
    dateFr: 'il y a 3 semaines',
    titleEn: 'Blown away',
    titleFr: 'Bluffé',
    bodyEn: 'Feels premium, finish is on point. I keep getting compliments.',
    bodyFr: 'Finition premium, ça fait la différence. Je reçois plein de compliments.',
    verified: true,
  },
  {
    name: 'Sarah B.',
    rating: 5,
    date: '5 days ago',
    dateFr: 'il y a 5 jours',
    titleEn: 'Just wow',
    titleFr: 'Waouh',
    bodyEn: 'Best purchase this year. Would 100% buy again.',
    bodyFr: 'Meilleur achat de l\'année. Je rachète direct.',
    verified: true,
  },
  {
    name: 'Kevin R.',
    rating: 5,
    date: '2 months ago',
    dateFr: 'il y a 2 mois',
    titleEn: 'Highly recommend',
    titleFr: 'Je recommande',
    bodyEn: 'Everything is perfect. The look, the feel, the packaging.',
    bodyFr: 'Tout est parfait. Le style, le toucher, le packaging.',
    verified: true,
  },
  {
    name: 'Julie K.',
    rating: 5,
    date: '1 week ago',
    dateFr: 'il y a 1 semaine',
    titleEn: 'Love it',
    titleFr: 'J\'adore',
    bodyEn: 'Fell in love the moment I opened the box. Truly incredible.',
    bodyFr: 'Coup de cœur immédiat en ouvrant le colis. Vraiment incroyable.',
    verified: true,
  },
  {
    name: 'Marc L.',
    rating: 5,
    date: '3 months ago',
    dateFr: 'il y a 3 mois',
    titleEn: 'Insane value',
    titleFr: 'Rapport qualité prix fou',
    bodyEn: 'You do not find this quality at this price anywhere. Incredible.',
    bodyFr: 'On ne trouve pas cette qualité à ce prix ailleurs. Incroyable.',
    verified: true,
  },
];

// Deterministic pseudo-random selector based on product id
const hash = (str) => {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = ((h << 5) - h + str.charCodeAt(i)) | 0;
  return Math.abs(h);
};

export const getReviewsForProduct = (productId) => {
  const seed = hash(productId);
  const count = 3 + (seed % 4); // 3 to 6 reviews
  const startIdx = seed % commonReviews.length;
  const picks = [];
  for (let i = 0; i < count; i++) {
    picks.push({
      id: `${productId}-r${i}`,
      ...commonReviews[(startIdx + i) % commonReviews.length],
    });
  }
  return picks;
};

export const getRatingStats = (productId) => {
  const seed = hash(productId);
  const totalCount = 47 + (seed % 380); // 47 to ~427
  const avg = 4.3 + ((seed % 70) / 100); // 4.3 to 5.0
  return {
    average: Math.min(5, Math.round(avg * 10) / 10),
    count: totalCount,
  };
};
