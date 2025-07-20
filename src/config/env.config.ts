export const EnvConfiguration = () => ({
  cors: {
    origins: process.env.CORS_ORIGINS?.split(',') || '*',
    methods: process.env.CORS_METHODS || 'GET,POST',
  },
  port: parseInt(process.env.PORT) || 3000,
  db: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 3306,
    name: process.env.DB_NAME,
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'secret',
    expiresIn: process.env.JWT_EXPIRES_IN || '2h',
  },
  storage: {
    temp: process.env.STORAGE_TEMP || './temp',
    static: process.env.STORAGE_STATIC || './static',
    destination: process.env.STORAGE_DESTINATION || './static/uploads',
  },
  stripe: {
    secret: process.env.STRIPE_SECRET || '',
  },
  mail: {
    sendgrid: process.env.SENDGRID_API_KEY || '',
    host: process.env.EMAIL_HOST || '',
    port: process.env.EMAIL_PORT || '',
    user: process.env.EMAIL_USER || '',
    password: process.env.EMAIL_PASS || '',
    template: {
      coordinator: process.env.SENDGRID_TEMPLATE_COORDINATOR || '',
      players: process.env.SENDGRID_TEMPLATE_PLAYERS || '',
      supports: process.env.SENDGRID_TEMPLATE_SUPPORTS || '',
      massive: process.env.SENDGRID_TEMPLATE_MASSIVE || '',
      password: process.env.SENDGRID_TEMPLATE_PASSWORD || '',
    },
  },
  host: {
    app: process.env.HOST_APP || '',
    api: process.env.HOST_API || '',
  },
});
