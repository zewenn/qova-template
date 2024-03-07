package main

import "github.com/evanw/esbuild/pkg/api"
import "os"
import (
	"fmt"
	"io"
	"os/exec"
	"time"
)

func title(t string) {
	print("\n\n\n\x1b[1m", t, "\x1b[0m\n")
	for range len(t) {
		print("~")
	}
	println("\n")
}

func copyFile(srcPath, destPath string) error {
	// Open the source file
	srcFile, err := os.Open(srcPath)
	if err != nil {
		return err
	}
	defer srcFile.Close()

	// Create or truncate the destination file
	destFile, err := os.Create(destPath)
	if err != nil {
		return err
	}
	defer destFile.Close()

	// Copy the content from source to destination
	_, err = io.Copy(destFile, srcFile)
	if err != nil {
		return err
	}

	// Sync to ensure the content is written to disk
	err = destFile.Sync()
	if err != nil {
		return err
	}

	return nil
}

func build_src() {
	startTime := time.Now()
	result := api.Build(api.BuildOptions{
		EntryPoints:       []string{"./source/index.tsx"},
		Bundle:            true,
		MinifySyntax:      true,
		MinifyWhitespace:  true,
		MinifyIdentifiers: false,
		Outfile:           "./build/main.js",
		Platform:          api.PlatformNode,
		External:          []string{"electron"},
		JSX:               api.JSXAutomatic,
		JSXFragment:       "Fragment",
		JSXFactory:        "h",
		Target:            api.ESNext,
		Loader: map[string]api.Loader{
			".jpg": api.LoaderFile,
			".png": api.LoaderFile,
		},
		Write: true,
	})

	if len(result.Errors) != 0 {
		fmt.Println(fmt.Sprintf("%t", result.Errors[0]))
		os.Exit(1)
	}

	elapsedTime := time.Since(startTime)
	fmt.Printf("Source build took \x1b[33m%s\x1b[0m to run.\n", elapsedTime)
}

func build_app() {
	startTime := time.Now()
	result := api.Build(api.BuildOptions{
		EntryPoints:       []string{"./app/index.ts"},
		Bundle:            true,
		MinifySyntax:      true,
		MinifyWhitespace:  true,
		MinifyIdentifiers: false,
		Outfile:           "./build/index.js",
		Platform:          api.PlatformNode,
		External:          []string{"electron"},
		Loader: map[string]api.Loader{
			".jpg": api.LoaderFile,
			".png": api.LoaderFile,
		},
		Write: true,
	})
	if len(result.Errors) != 0 {
		fmt.Print(fmt.Sprintf("%t", result.Errors[0]), "\n")
		os.Exit(1)
	}

	me := copyFile("./app/html/index.html", "./build/index.html")
	if me != nil {
		fmt.Print(fmt.Sprintf("%t", me), "\n")
	}

	elapsedTime := time.Since(startTime)
	fmt.Printf("App build took \x1b[33m%s\x1b[0m to run.\n", elapsedTime)
}

func main() {
	runmap := map[string]bool{
		"src":     false,
		"app":     false,
		"run":     false,
		"include": false,
	}

	for _, arg := range os.Args[1:] {
		if arg == "-b:src" {
			runmap["src"] = true
		}
		if arg == "-b:app" {
			runmap["app"] = true
		}
		if arg == "-r" {
			runmap["run"] = true
		}
		if arg == "-i" {
			runmap["include"] = true
		}
	}

	if runmap["src"] || runmap["app"] {
		title("Building")
	}

	if runmap["src"] {
		build_src()
	}
	if runmap["app"] {
		build_app()
	}
	if runmap["include"] {
		cmd := exec.Command("python", "./toolkit/main.py")
		combinedOutput, err := cmd.CombinedOutput()

		if err != nil {
			fmt.Println("Error:", err)
		}

		// Print the combined output
		fmt.Println(string(combinedOutput))
	}
	if runmap["run"] {

		title("Electron")

		cmd := exec.Command("npx", "electron", "./build")
		combinedOutput, err := cmd.CombinedOutput()

		if err != nil {
			fmt.Println("Error:", err)
		}

		// Print the combined output
		fmt.Println(string(combinedOutput))
	}
}
