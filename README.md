# Solat Today

A modern, responsive web application that provides accurate prayer times for Muslims in Malaysia. Built with Next.js and using official JAKIM Malaysia data.

![Solat Today](https://solat.today/og.png)

## Features

- **Real-time Prayer Times**: Get accurate prayer times based on your current location
- **Countdown Timer**: Visual countdown to the next prayer time
- **Hijri Calendar**: Display current Hijri date alongside Gregorian calendar
- **Multiple Day View**: Navigate through prayer times for different days
- **Responsive Design**: Works seamlessly on mobile, tablet, and desktop devices
- **JAKIM Official Data**: Uses official Malaysian Islamic Development Department data
- **Offline Support**: Save your zone information for offline access
- **Nearby Mosques**: Find mosques in your vicinity (coming soon)
- **Qibla Direction**: Get accurate qibla direction from your location (coming soon)

## Technology Stack

- **Frontend**: Next.js 14, React, TypeScript, TailwindCSS
- **UI Components**: Shadcn UI
- **API**: Next.js API Routes with external JAKIM data integration
- **Geolocation**: Browser Geolocation API
- **Data Storage**: Local storage for offline capabilities

## Getting Started

First, install dependencies:

```bash
# Make sure to use the right node version
nvm use node

# Use pnpm as package manager
pnpm install
```

Then, run the development server:

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

## Environment Variables

No environment variables are required to run the application locally.

## Deployment

The application is designed to be deployed on Vercel for optimal performance:

```bash
pnpm build
```

## Contributing

Contributions are welcome! Feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Credits

- Prayer times data provided by [JAKIM Malaysia](https://www.e-solat.gov.my/)
- Created by [drmsr](https://x.com/drmsr_dev)

## Links

- Website: [https://solat.today](https://solat.today)
- GitHub Repository: [https://github.com/dr-msr/solat-today](https://github.com/dr-msr/solat-today)
