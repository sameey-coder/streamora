export const PATHS = {
  payment: '/payment',
  paymentSuccess: '/payment/success',
  paymentCancel: '/payment/cancel',
  home: '/',
  browse: '/browse',
  movieDetail: '/movie/:id',
  login: '/login',
  register: '/register',
  favourites: '/favourites',
  history: '/history',
  subscription: '/subscription',
  profile: '/profile',
  admin: '/admin',
  adminLogin: '/admin/login',
  privacy: '/legal/privacy',
  terms: '/legal/terms',
  cookie: '/legal/cookies',
  legalDocument: '/legal/:slug',
}

export function moviePath(id) {
  return PATHS.movieDetail.replace(':id', String(id))
}
