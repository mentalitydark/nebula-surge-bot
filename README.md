# Awesome Bot Base

> [!NOTE] 
> This project **base** can be generated using the [Constant CLI](https://github.com/rinckodev/constatic/tree/master/tools/cli#readme)
> See the full documentation for this base by accessing: https://constatic-docs.vercel.app/docs/discord/start

This is the most complete discord bot base you've ever seen! Developed by [@rinckodev](https://github.com/rinckodev), this project uses typescript in an incredible way to provide complete structures and facilitate the development of your discord bot.

> [!WARNING]
> [NodeJs](https://nodejs.org/en) version required: 20.12 or higher

## Scripts

- `dev`: running bot in development
- `build`: build the project
- `watch`: running in watch mode
- `start`: running the compiled bot

## Structures

- [Commands](https://constatic-docs.vercel.app/docs/discord/commands)
- [Responder](https://constatic-docs.vercel.app/docs/discord/responders)
- [Events](https://constatic-docs.vercel.app/docs/discord/events)

## Deployment

This project includes a GitHub Action workflow to automatically deploy to [Discloud](https://discloud.com/) when a push is made to the `master` branch.

### Prerequisites

1.  **Discloud Token:** Obtain your API token via the Discloud Dashboard or the `/api token` command in Discord.
2.  **GitHub Secret:** Add your token as a repository secret in GitHub:
    *   Go to **Settings** > **Secrets and variables** > **Actions**.
    *   Create a new repository secret named `DISCLOUD_TOKEN` and paste your token there.

The workflow is located at `.github/workflows/deploy.yaml`. It automatically installs dependencies, builds the project, and performs the deployment.