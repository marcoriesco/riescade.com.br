/** @type {import('next').NextConfig} */
const supabaseMediaOrigin = (() => {
  try {
    const url = new URL(process.env.NEXT_PUBLIC_SUPABASE_URL || '');
    return url.protocol === 'https:' ? url.origin : '';
  } catch { return ''; }
})();
const nextConfig = {
  reactStrictMode: true,
  allowedDevOrigins: [
    "localhost",
    "e892-2804-7f0-aa1a-d0e9-8c3e-d058-ad80-ea25.ngrok-free.app",
  ],
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "www.riescade.com.br" },
      { protocol: "https", hostname: "riescade.com.br" },
      { protocol: "https", hostname: "riescade.com" },
      { protocol: "https", hostname: "image.pollinations.ai" }
    ],
    unoptimized: false, // Habilitar otimização para obter melhor qualidade
  },
  // Configuração de segurança para permitir o proxy de imagens
  async headers() {
    return [
      {
        // Aplicando a todas as rotas
        source: "/(.*)",
        headers: [
          {
            key: "Content-Security-Policy",
            value:
              `default-src 'self'; base-uri 'self'; object-src 'none'; frame-ancestors 'none'; form-action 'self' https://checkout.stripe.com; img-src 'self' https: data:; media-src 'self' ${supabaseMediaOrigin}; style-src 'self' 'unsafe-inline'; font-src 'self'; script-src 'self' 'unsafe-inline'; connect-src 'self' https:; upgrade-insecure-requests;`,
          },
          { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
    ];
  },
  // Garantir que os módulos do Node.js estejam disponíveis para as APIs
  serverExternalPackages: ["sharp"],
  // Configuração de API para OpenGraph
  serverRuntimeConfig: {
    PROJECT_ROOT: __dirname,
  },
};

module.exports = nextConfig;
