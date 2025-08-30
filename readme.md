# Search Stats Extended

Like the new anki stats screen? Want more? This is the addon for you.

## Config
     
- **loadDelayMs**: The number of ms to delay before displaying the search stats, Increasing this can help if the search stats appear above the regular stats (Though even with 0ms this doesn't tend to happen)

- **confirmExpensiveStats**: If true, graphs which itterate over every review for the cards in the selection will be hidden by default prompting the user to press a button to load them. 

- **barWidth, barHeight**: Change the RESOLUTION at which the bar/candlestick charts are rendered. This can also be used to change their aspect ratio.

- **piePercentages**: While true, A third percentage column is added to all pies.
  E.g.  
  ![image](https://github.com/user-attachments/assets/ebe205dc-2544-45ad-8cf6-25e02923a797)  
  Has no effect on Card Count Time Machine.

- **warnings**: If set to false, removes any text warning of the cutoff date in the review graphs (denoted by yellow).
  ![image](https://github.com/user-attachments/assets/ced82fdf-3a50-44bb-9535-413d2134a8bd)

- **trends**: If set to false, disables trend lines.

- **categories** Automatically set when you open and close a tab, can also be set to "removed" to omit the tab entirely

- **forceLang** Allows you to force a specific language regardless of what Anki's language is set to.

## The Graphs

### Here are some examples:

<img width="1244" height="555" alt="image" src="https://github.com/user-attachments/assets/7d678ff2-31e0-4d0c-917c-58a4668bd768" />
<img width="500" height="451" alt="image" src="https://github.com/user-attachments/assets/0576aacd-12d2-446c-9355-d0e76f7f2eb8" />
<img width="500" height="451" alt="image" src="https://github.com/user-attachments/assets/1781747b-8f69-42c8-8545-d93e99c9197d" />
<img width="500" height="569" alt="image" src="https://github.com/user-attachments/assets/9191e1e4-fe37-4cea-bb25-857f1b58966c" />
<img width="500" height="569" alt="image" src="https://github.com/user-attachments/assets/7034956f-9e2d-47b0-81d6-955461b87da1" />
<img width="1244" height="556" alt="image" src="https://github.com/user-attachments/assets/c038c4db-f21a-4448-9190-e0751fd9cc91" />

### And more:

- Future Due Types
- Future Due Retention
- Intra Day Due
- Todays Retention
- Custom pie
- Review Speed Trend
- SxR Heatmap
- Interval Distribution
- Interval Load
- Lapse Load
- Lapse Distribution
- Lapse Total
- Repetition Load
- Repetition Distribution
- Repetition Total
- Time Distribution
- Time Totals
- Introduced
- Forgotten
- Introductory Rating
- Ratings
- Interval Ratings
- Time Ratings
- Load Trend
- Learn Reviews per Card
- Memorised
- FSRS Calibration
- Stability Time Machine
- Difficulty Time Machine
- Stability Over Time
- Card Count Time Machine
- Review Interval Time Machine
- Daily Hourly Breakdown

## Development

Building this with make works on linux and will probably work on mac 

### Cloning the Repository

To clone the repository along with its submodule (the Anki codebase), you should use the following command:

```sh
git clone https://github.com/Luc-Mcgrady/Anki-Search-Stats-Extended.git --recursive --shallow-submodules
```

### Link the cloned repository to Anki's addons folder

Once the repo has been cloned, you can add a symlink from this repo to Anki's addon folder so that the addon will be included next time you start Anki

For Linux or MacOS:
```bash
ln -s PATH_TO_CLONED_REPO PATH_TO_ANKI_ADDONS_FOLDER/Anki-Search-Stats-Extended
```

For Windows:
```cmd
mklink /D "PATH_TO_ANKI_ADDONS_FOLDER\Anki-Search-Stats-Extended" "PATH_TO_CLONED_REPO"
```

### Build the addon

#### Linux / Mac

run make to setup source files
```
make
```

Then every-time you make any changes run make again.

#### Mac Proto Issues
It is possible that you may run into issues with protoc on mac.

https://github.com/Luc-Mcgrady/Anki-Search-Stats-Extended/issues/22#issue-2769153566


#### Windows

You need to make the file `src/ts/proto` and then generate the proto files by running

```sh
npm i
npx protoc \
    -I anki/proto \
    --es_out src/ts/proto \
    --es_opt target=ts \
    anki/proto/anki/*.proto \
```

Then whenever you want to build changes

```sh
npm run build
```
I haven't actually tested this so good luck.
Check the makefile for more information

------

Due to the way its set up you don't have to reload anki for javascript changes, you only have to run make/build again and reload the stats menu.

If you have any cool graph idea's then let me know or just pull request and make it yourself.

## License

All files in this repository are licenced under "GPL-3.0-only"  
Copyright 2023 Luc McGrady and contributors.
