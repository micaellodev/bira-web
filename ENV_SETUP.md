# API Peru DNI Autofill - Environment Setup

## Required Environment Variable

Add the following to your `.env.local` file in the `bira-web` directory:

```env
APIPERU_TOKEN=your_api_token_here
```

## Getting Your API Token

1. Visit [https://apiperu.dev/](https://apiperu.dev/)
2. Sign up for an account
3. Obtain your API token from the dashboard
4. Add it to your `.env.local` file

## Important Notes

- The `.env.local` file should be in the root of the `bira-web` directory
- Never commit your `.env.local` file to version control
- Restart your development server after adding the environment variable
