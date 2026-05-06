# Readme addendum for NRW

Some of the [readme](./README.md) instructions don't work or are incomplete. Rather than writing over the original readme and risk PRs getting held up over comments on strings, use this as the troubleshooting addendum.

### Local Development

2. Initialize submodules

   If you want to run the GO backend, you need to init the submodules.

    ```bash
    git submodule update --init --recursive --remote
    ```

    If this fails, you may need to manually checkout the directories.
    You can either work from HEAD or get the specific commit that your target branch is using by going to the repo online (at Github), or by looking at your local submodule settings.
    Online, you'd see in the root dir something like this: `go-risk-module-api @ e6afd9b`. Use the last string as your commit to check out to.

    To run this, navigate to the repo base directory and run the following. It removes the directories if they exist,
    and then clones into that location at a specific commit.

    ```bash
    rm -rf go-api go-risk-module-api
    git clone https://github.com/IFRCGo/go-api.git go-api && (cd go-api && git checkout cda57b1)
    git clone https://github.com/IFRCGo/go-risk-module-api.git go-risk-module-api && (cd go-risk-module-api && git checkout e6afd9b)
    ```

3. Install the dependencies:

   ```bash
   pnpm install
   ```

Note, if youre not running the backend, you can just run this from the app/ dir.

4. Setup .env file.

In the `app/` dir, copy the `sample.env` file and rename the copy to `.env`.
Adjust settings as needed, as per the comments in the file.

5. Start the development server:

   ```bash
   pnpm start
   ````

Go to `https://localhost:3000/ibf`
