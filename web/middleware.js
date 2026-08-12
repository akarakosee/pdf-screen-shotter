export const config = {
  // Bütün sayfalarda çalışması için
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};

export default function middleware(request) {
  const authorizationHeader = request.headers.get('authorization');

  if (authorizationHeader) {
    const basicAuth = authorizationHeader.split(' ')[1];
    const [user, password] = atob(basicAuth).split(':');

    // Kullanıcı adı: admin, Şifre: ayberk2003
    if (user === 'admin' && password === 'ayberk2003') {
      return; // Şifre doğruysa siteye giriş izni ver
    }
  }

  return new Response('Bu site su an yapim asamasindadir ve erisime kapalidir.', {
    status: 401,
    headers: {
      'WWW-Authenticate': 'Basic realm="Secure Area"',
    },
  });
}
