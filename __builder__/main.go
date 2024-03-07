package main

import (
	"bufio"
	"fmt"
	"io"
	"os"
	"os/exec"
	"path/filepath"
	"strings"
	"time"
	"regexp"

	"github.com/evanw/esbuild/pkg/api"
)

var SOURCE_ENTRY_POINT = "./source/index.tsx"
var SCRIPT_DIRECTORIES = []string{}

func title(t string) {
	print("\n\n\n\x1b[1m", t, "\x1b[0m\n")
	for range len(t) {
		print("~")
	}
	println("\n")
}

func highlight(keyword string, title string, time time.Duration) {
	fmt.Printf("\x1b[38;5;6m@%s\x1b[0m %s \x1b[33m[%s]\x1b[0m\n", keyword, title, time)
}

func extractFields(filename string) (string, error) {
	file, err := os.Open(filename)
	if err != nil {
		return "", err
	}
	defer file.Close()

	scanner := bufio.NewScanner(file)

	// Regular expression to match "@field" and the following word
	fieldRegex := regexp.MustCompile(`@field\s+(\w+)`)

	for scanner.Scan() {
		line := scanner.Text()
		matches := fieldRegex.FindStringSubmatch(line)

		if len(matches) == 2 {
			// matches[1] contains the next word after "@field"
			SCRIPT_DIRECTORIES = append(SCRIPT_DIRECTORIES, strings.TrimSpace(matches[1]))
		}
	}

	if err := scanner.Err(); err != nil {
		return "", err
	}

	return "", nil
}

// AutoImportTSFiles generates import statements for TypeScript files in the specified directory
// func AutoImportTSFiles(directory string) (string, error) {
// 	startTag := fmt.Sprintf("/** @field %s */", directory)
// 	endTag := fmt.Sprintf("/** @end %s */", directory)

// 	var importStatements string

// 	// Get a list of all .ts files in the specified directory
// 	tsFiles, err := filepath.Glob(filepath.Join("./source/", directory, "*.ts*"))
// 	if err != nil {
// 		return "", err
// 	}

// 	for _, tsFile := range tsFiles {
// 		moduleName := strings.Split(filepath.Base(tsFile), ".")[0]
// 		importStatements += fmt.Sprintf("import \"./%s/%s\";\n", directory, moduleName)
// 	}

// 	indexFilePath := filepath.Join(SOURCE_ENTRY_POINT)
// 	indexTS, err := os.ReadFile(indexFilePath)
// 	if err != nil {
// 		return "", err
// 	}

// 	c1 := string(indexTS)
// 	content := strings.SplitAfter(c1, startTag)
// 	if len(content) < 2 {
// 		return "", fmt.Errorf("start tag (%s) not found", startTag)
// 	}

// 	content = strings.SplitAfter(content[1], endTag)
// 	if len(content) < 2 {
// 		return "", fmt.Errorf("end tag not found")
// 	}
// 	content_ := content[0]

// 	c1 = strings.ReplaceAll(c1,
// 		fmt.Sprintf("%s%s", startTag, content_),
// 		fmt.Sprintf("%s\n%s%s", startTag, importStatements, endTag),
// 	)

// 	return c1, nil
// }
func AutoImportTSFiles(directory string) (string, error) {
	startTag := fmt.Sprintf(`(/\*\*\s+@field\s+%s\s+\*/)`, directory)
	endTag := fmt.Sprintf(`/\*\*\s+@close\s+%s\s+\*/`, directory)
	var importStatements string

	// Get a list of all .ts files in the specified directory
	tsFiles, err := filepath.Glob(filepath.Join("./source/", directory, "*.ts*"))
	if err != nil {
		return "", err
	}

	for _, tsFile := range tsFiles {
		moduleName := strings.Split(filepath.Base(tsFile), ".")[0]
		importStatements += fmt.Sprintf("import \"./%s/%s\";\n", directory, moduleName)
	}

	indexFilePath := filepath.Join(SOURCE_ENTRY_POINT)
	indexTS, err := os.ReadFile(indexFilePath)
	if err != nil {
		return "", err
	}
	
	c1 := string(indexTS)
	
	startLineRegex := regexp.MustCompile(fmt.Sprintf(`%s.*`, startTag))
	endLineRegex := regexp.MustCompile(fmt.Sprintf(`%s.*`, endTag))

	// Find the start and end lines
	startLine := startLineRegex.FindString(c1)
	endLine := endLineRegex.FindString(c1)

	content := strings.SplitAfter(c1, startLine)
	if len(content) < 2 {
		return "", fmt.Errorf("start tag (%s) not found", startLine)
	}
	content = strings.SplitAfter(content[1], endLine)
	if len(content) < 2 {
		return "", fmt.Errorf("end tag not found")
	}
	content_ := content[0]


	c1 = strings.ReplaceAll(c1,
		fmt.Sprintf("%s%s", startLine, content_),
		fmt.Sprintf("%s\n%s%s", startLine, importStatements, endLine),
	)

	// Replace everything between start and end lines
	// c1 = strings.ReplaceAll(c1,
	// 	fmt.Sprintf("%s%s%s", startLine, contentBetween(startTag, endTag, c1), endLine),
	// 	fmt.Sprintf("%s\n%s%s", startLine, importStatements, endLine),
	// )

	return c1, nil
}

// func contentBetween(startPattern, endPattern, input string) string {
// 	startIndex := strings.Index(input, startPattern)
// 	endIndex := strings.Index(input, endPattern)

// 	if startIndex == -1 || endIndex == -1 || endIndex <= startIndex {
// 		return ""
// 	}

// 	return input[startIndex+len(startPattern) : endIndex]
// }

// UpdateIndexFile updates the index.ts file with the generated import statements
func UpdateIndexFile(directory, content string) error {
	indexFilePath := filepath.Join(SOURCE_ENTRY_POINT)
	indexTSFile, err := os.OpenFile(indexFilePath, os.O_RDWR|os.O_TRUNC, 0644)
	if err != nil {
		return err
	}
	defer indexTSFile.Close()

	_, err = indexTSFile.WriteString(content)
	if err != nil {
		return err
	}

	return nil
}

func autogen(directory string) {
	result, err := AutoImportTSFiles(directory)
	if err != nil {
		fmt.Println("Error:", err)
		return
	}

	err = UpdateIndexFile(directory, result)
	if err != nil {
		fmt.Println("Error:", err)
		return
	}
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
		EntryPoints:       []string{SOURCE_ENTRY_POINT},
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
		fmt.Println(result.Errors[0].Text)
		os.Exit(1)
	}

	elapsedTime := time.Since(startTime)
	// fmt.Printf("Source build took \x1b[33m%s\x1b[0m to run.\n", elapsedTime)
	highlight("directory", "source", elapsedTime)
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
		fmt.Println(result.Errors[0].Text)
		os.Exit(1)
	}
	
	me := copyFile("./app/html/index.html", "./build/index.html")
	if me != nil {
		fmt.Print(fmt.Sprintf("%t", me), "\n")
	}
	
	elapsedTime := time.Since(startTime)
	highlight("directory", "app", elapsedTime)
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
	
	if runmap["include"] {
		title("Generating Imports")
		
		filename := SOURCE_ENTRY_POINT // Replace with the actual filename
		_, err := extractFields(filename)
		if err != nil {
			fmt.Println("Error:", err)
			return
		}

		for _, dirname := range SCRIPT_DIRECTORIES {
			startTime := time.Now()
			autogen(dirname)
			elapsedTime := time.Since(startTime)
			highlight("field", dirname, elapsedTime)
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
