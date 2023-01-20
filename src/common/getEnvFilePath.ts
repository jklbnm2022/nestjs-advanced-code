const getEnvFilePath = (option: string): string => {
  switch (option) {
    case 'development':
      return '.env.development';
    case 'production':
      return '.env.production';
    default:
      return '.env';
  }
};

export default getEnvFilePath;
