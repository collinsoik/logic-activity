This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000/games/logic-activity](http://localhost:3000/games/logic-activity) with your browser to see the result.

## Classroom controls

- Drag between an output port and an input port in either direction, including from a gate down to A, B, or C. Signal flow still runs from outputs to inputs.
- To replace a connection, drag from its input port to a different output, or from a new output to that input. Canceling a drag or attempting an invalid connection keeps the existing wire.
- Use **Fullscreen** in the toolbar to enter fullscreen, and **Exit fullscreen** or Escape to leave. Browsers require a user click to enter fullscreen. The activity also fits the available window height without fullscreen; the side panels scroll independently on shorter screens.
- Level 4 is `!(A & B)` and level 5 is `(!A) | B`. Existing completion records and saved circuits migrate with their respective challenges.

## Open Door website

The `collinsoik/open-door-reach-main` website forwards `/games/logic-activity` and its assets to `https://logicactivity.vercel.app/games/logic-activity`. Game changes belong in this repository; Vercel's production deployment of this repository supplies the activity shown on Open Door.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
