<p align="center">
    <img src="./.README/qova%20header.png" width="300px">
</p>
<h1 align="center">The Qova Template</h1>
<p align="center">Golang Error Handling | Automatic Imports | Easy to use tsx</p>

## About
The Qova Template provides an easy to use - go-like - standard library ([`__stdlib__`](./__stdlib__/)) and builder program ([`run.exe`](./run.exe)) built with esbuild in go. 

## The Builder
The builder program requires specific flags to perform actions:
1. ### Build
    > **IMPORTANT: YOU NEED TO NAME THE ENTRYPOINT OF THE ./source DIRECTORY AS <br >`[main] <name>.ts(x)`**


    You need to specify which parts of your project you want to build/rebuild. 

    This can be done by using the `-b:src` (for the [`./source`](./source/) directory) and the `-b:app` (for the [`./app`](./app/) directory) flags.
    ```powershell
    ./run -b:src -b:app
    ```

2. ### Include
    You might want to import some `.ts` or `.tsx` scripts automatically; Qova's got you covered!

    In the `[main] <name>.ts(x)` file you can auto import scripts like this:
    ```tsx
    /** @field ./mydir */
    /** @close ./mydir */

    // Rest of the script here
    ```
    Between the `/** @field ./mydir */` start tag and the `/** @close ./mydir */` end tag every script will be imported from the `./mydir` directory.

    To include the scripts run the builder with the flag `-i`:
    ```powershell
    ./run -i
    ```

3. ### Run
    If you want to automatically run the built files, you can use the `-r` flag:
    ```powershell
    ./run -r
    ```
    If a target wasn't specified it will be set to `electron`.

4. ### Target
    You can set a taget for the builder with the `-r` flag:
    ```powershell
    ./run -r:electron -r:node -r:bun
    ```
    - `-r:el` / `-r:electron`: `target = "electron"`
    - `-r:n` / `-r:node`: `target = "node"`
    - `-r:b` / `-r:bun`: `target = "bun"`
