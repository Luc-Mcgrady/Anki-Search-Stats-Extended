# Search Stats Extended

Like the new anki stats screen? Want more? This is the addon for you.

## Config
     
- **loadDelayMs**: The number of ms to delay before displaying the search stats, Increasing this can help if the search stats appear above the regular stats (Though even with 0ms this doesn't tend to happen)

- **burdenNotLoad**: If true, replaces the word "Load" with "Burden" in many places to be consistent with SuperMemo https://supermemo.guru/wiki/Burden

- **confirmExpensiveStats**: If true, graphs which itterate over every review for the cards in the selection will be hidden by default prompting the user to press a button to load them. 

- **barWidth, barHeight**: Change the RESOLUTION at which the bar/candlestick charts are rendered. This can also be used to change their aspect ratio.

- **piePercentages**: While true, A third percentage column is added to all pies.
  E.g.  
  ![image](https://github.com/user-attachments/assets/ebe205dc-2544-45ad-8cf6-25e02923a797)  
  Has no effect on Card Count Time Machine.

- **warnings**: If set to false, removes any text warning of the cutoff date in the review graphs (denoted by yellow).
  ![image](https://github.com/user-attachments/assets/ced82fdf-3a50-44bb-9535-413d2134a8bd)

- **trends**: If set to false, disables trend lines.

## The Graphs

### Future due types

![image](https://github.com/Luc-Mcgrady/Anki-New-Stats-Plus/assets/63685643/84ccc66d-7e1d-4fb7-9c12-0ad231e44fdd)

### Intra-Day Due 

![image](https://github.com/Luc-Mcgrady/Anki-Search-Stats-Extended/assets/63685643/fdab1f3f-c3bb-4a45-b8d4-f5544774d946)

### Todays Retention

![image](https://github.com/Luc-Mcgrady/Anki-New-Stats-Plus/assets/63685643/d34dd13e-32cc-49cc-ab46-871696f58c75)

### Custom Pie

![image](https://github.com/Luc-Mcgrady/Anki-Search-Stats-Extended/assets/63685643/26d552b5-9707-4cc1-a4f0-c5c1fb1d3a14)

### Interval Distribution/Load

![image](https://github.com/Luc-Mcgrady/Anki-Search-Stats-Extended/assets/63685643/dfe42518-5d5a-4d3e-92e9-8552ac753d64)

### Lapse Load/Distribution/Total

![image](https://github.com/Luc-Mcgrady/Anki-Search-Stats-Extended/assets/63685643/8235d024-0bca-4856-bd6f-099e88da8c43)

### Repetition Load/Distribution/Total

![image](https://github.com/Luc-Mcgrady/Anki-Search-Stats-Extended/assets/63685643/db56bfec-6fe1-47d0-987c-c0c79f5bf876)

### Time Distribution/Total

![image](https://github.com/user-attachments/assets/15e1e948-c869-4af9-b20f-6f55708d1a23)

### Review Speed Trend

![image](https://github.com/user-attachments/assets/02c08574-a100-48b6-9c75-3e3e8a5d3aec)

### Introduced/Forgotten

![image](https://github.com/user-attachments/assets/b8110b00-7c56-42e6-a163-03676c0e75f9)

### Rating Graphs

![image](https://github.com/user-attachments/assets/36bea17e-814a-477b-ac5d-ff4f4fad2ce1)
![image](https://github.com/user-attachments/assets/901fe7bf-53bf-4e53-ba09-d512b8fee38d)

### Burden Trend

![image](https://github.com/user-attachments/assets/acad50ec-72b1-4041-a5af-b63ad3e4fa67)

### Card Count / Interval Time Machines

![image](https://github.com/user-attachments/assets/a8804de9-c60e-412d-8bf0-7c04e1a2423c)

## Development

Building this with make addon works on linux and will probably work on mac 

### Cloning the Repository

To clone the repository along with its submodule (the Anki codebase), you should use the following command:

```sh
git clone https://github.com/Luc-Mcgrady/Anki-Search-Stats-Extended.git --recursive --shallow-submodules
```

### Linux / Mac

run make to setup source files
```
make
``` 

Then every-time you make any changes run make again.

### Windows

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
