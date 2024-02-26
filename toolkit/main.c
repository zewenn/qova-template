
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <time.h>
#include <stdbool.h>

#define max_buildcmd_size 1024

void timeit_title(char title[])
{
    time_t rawTime;
    struct tm *timeInfo;

    time(&rawTime);
    timeInfo = localtime(&rawTime);

    // Format and print the current time
    char buffer[80];
    strftime(buffer, sizeof(buffer), "%Y-%m-%d %H:%M:%S", timeInfo);
    printf("%s: %s\n", title, buffer);
}

bool contains(char *arr[], int size, const char *value)
{
    for (int i = 0; i < size; ++i)
    {
        if (strcmp(arr[i], value) == 0)
        {
            return true; // Element found
        }
    }
    return false; // Element not found
}

void add_to_buildcmd(char build_cmd[max_buildcmd_size], char new_part[])
{
    if (strlen(build_cmd) + strlen(new_part) > max_buildcmd_size) {
        printf("[ERROR] Too large build command!");
        return;
    }

    if (build_cmd[0] == '\0')
    {
        strcat(build_cmd, new_part);
        return;
    }
    strcat(build_cmd, " && ");
    strcat(build_cmd, new_part);
}

size_t getCharArrayLength(const char array[])
{
    size_t length = 0;

    while (array[length] != '\0')
    {
        length++;
    }

    return length;
}

void title(char str[])
{
    int len = getCharArrayLength(str);
    printf("\n\n\n\x1b[1m%s\x1b[0m\n", str);
    for (int i = 0; i < len; i++)
    {
        printf("~");
    }
    printf("\n\n");
}

int main(int argc, char *argv[])
{
    char build_cmd[max_buildcmd_size] = "";

    // if (contains(argv, argc, "-i:scripts"))
    // {
    //     add_to_buildcmd(build_cmd, "python ./toolkit/python_hooks/[scripts].py");
    // }
    if (contains(argv, argc, "-b:src"))
    {
        add_to_buildcmd(build_cmd, "node ./toolkit/js_hooks/[src].mjs");
    }
    // if (contains(argv, argc, "-b:app"))
    // {
    //     add_to_buildcmd(build_cmd, "node ./toolkit/js_hooks/[app].mjs");
    // }

    if (build_cmd[0] != '\0')
    {
        title("Building");
    }
    system(build_cmd);

    if (contains(argv, argc, "-r"))
    {
        title("Running Electron");
        system("npx electron ./build");
    }

    return 0;

    printf("\n");

    timeit_title("npx electron");
    timeit_title("npx electron ran");
}
